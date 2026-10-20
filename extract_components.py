import os
import json
import cv2
import numpy as np

def extract_all():
    input_path = r'C:\TrainAi\Animated\Creative Ideas Unleashed.png'
    output_dir = r'C:\TrainAi\Animated\Components'
    particles_dir = os.path.join(output_dir, 'particles')
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(particles_dir, exist_ok=True)

    img = cv2.imread(input_path)
    h, w, _ = img.shape
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    print(f"Loaded image: {w}x{h}")

    # Step 1: Precise background identification
    # Ink barrier: gray < 210
    barrier = (gray < 210).astype(np.uint8)
    passable = (barrier == 0).astype(np.uint8)
    _, labels = cv2.connectedComponents(passable, connectivity=8)
    bg_label = labels[0, 0] # 1

    is_bg_connected = (labels == bg_label)

    # Also punch out enclosed background hole inside headphone headband arch
    # Headphone arch patch center is around (y=579, x=777)
    hp_arch_region = (gray[520:640, 700:840] > 220).astype(np.uint8)
    num_p, lbls_p, stats_p, cents_p = cv2.connectedComponentsWithStats(hp_arch_region)
    for p_i in range(1, num_p):
        if stats_p[p_i, cv2.CC_STAT_AREA] > 2000:
            is_bg_connected[520:640, 700:840] |= (lbls_p == p_i)
            print(f"Punched out headphone arch hole ({stats_p[p_i, cv2.CC_STAT_AREA]} px)")

    # Calculate smooth alpha
    bg_ref = 238.0
    ink_ref = 35.0


    # Dilate non-bg slightly to find edge transition pixels
    ink_border_zone = cv2.dilate((~is_bg_connected).astype(np.uint8), np.ones((5, 5), np.uint8)) & is_bg_connected

    alpha = np.ones((h, w), dtype=np.float32)
    alpha[is_bg_connected] = 0.0

    zone_pixels = ink_border_zone.astype(bool)
    alpha_zone = np.clip((bg_ref - gray.astype(np.float32)) / (bg_ref - ink_ref), 0.0, 1.0)
    alpha[zone_pixels] = alpha_zone[zone_pixels]

    alpha = cv2.GaussianBlur(alpha, (3, 3), 0.5)
    alpha[~is_bg_connected] = np.maximum(alpha[~is_bg_connected], 0.96)
    
    pure_bg = is_bg_connected & (~cv2.dilate(zone_pixels.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool))
    alpha[pure_bg] = 0.0

    # Defringe RGB
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgb_clean = img.astype(np.float32)
    semi = (alpha > 0.01) & (alpha < 0.99)
    for c in range(3):
        c_val = (rgb_clean[:, :, c] - (1.0 - alpha) * 238.0) / np.maximum(alpha, 0.01)
        rgb_clean[:, :, c] = np.where(semi, np.clip(c_val, 0, 255), rgb_clean[:, :, c])

    rgba[:, :, :3] = np.clip(rgb_clean, 0, 255).astype(np.uint8)
    rgba[:, :, 3] = np.clip(alpha * 255.0, 0, 255).astype(np.uint8)

    # Save 00_full_illustration_transparent.png
    full_path = os.path.join(output_dir, '00_full_illustration_transparent.png')
    cv2.imwrite(full_path, rgba)
    print("Saved 00_full_illustration_transparent.png")

    # Step 2: Separate each component
    # We will segment each component using connected components and logical grouping
    fg_mask = (alpha > 0.05)
    num_fg, fg_labels, fg_stats, fg_centroids = cv2.connectedComponentsWithStats(fg_mask.astype(np.uint8), connectivity=8)

    def crop_and_save(mask, filename, pad=12):
        ys, xs = np.where(mask)
        if len(ys) == 0:
            return None
        y1, y2 = max(0, ys.min() - pad), min(h, ys.max() + 1 + pad)
        x1, x2 = max(0, xs.min() - pad), min(w, xs.max() + 1 + pad)

        comp_rgba = rgba[y1:y2, x1:x2].copy()
        # Ensure only pixels in mask are kept
        mask_crop = mask[y1:y2, x1:x2]
        comp_rgba[~mask_crop, 3] = 0

        cv2.imwrite(filename, comp_rgba)
        metadata = {
            "file": os.path.basename(filename),
            "x": int(x1),
            "y": int(y1),
            "width": int(x2 - x1),
            "height": int(y2 - y1),
            "original_bounds": {
                "min_x": int(xs.min()),
                "min_y": int(ys.min()),
                "max_x": int(xs.max()),
                "max_y": int(ys.max())
            }
        }
        return metadata

    # Find labels for main objects by their bounding boxes/centroids
    components_info = {}

    # Map labels to objects
    label_map = {}
    for i in range(1, num_fg):
        bx, by, bw, bh, ba = fg_stats[i]
        cx, cy = int(fg_centroids[i][0]), int(fg_centroids[i][1])
        label_map[i] = {"bbox": (bx, by, bw, bh), "center": (cx, cy), "area": ba}

    # Groupings:
    # 1. Cap: center near (455, 199)
    cap_mask = np.zeros((h, w), bool)
    for lbl, info in label_map.items():
        if info["area"] > 50000 and info["center"][1] < 350:
            cap_mask |= (fg_labels == lbl)

    # 2. Lightbulb: center near (547, 403)
    bulb_mask = np.zeros((h, w), bool)
    for lbl, info in label_map.items():
        if 5000 < info["area"] < 15000 and 300 < info["center"][1] < 460 and 480 < info["center"][0] < 600:
            bulb_mask |= (fg_labels == lbl)

    # 3. Laptop: center near (370, 497)
    laptop_mask = np.zeros((h, w), bool)
    for lbl, info in label_map.items():
        if info["area"] > 30000 and 400 < info["center"][1] < 600 and info["center"][0] < 450:
            laptop_mask |= (fg_labels == lbl)

    # 4. Game controller: center near (702, 442)
    gamepad_mask = np.zeros((h, w), bool)
    for lbl, info in label_map.items():
        if 10000 < info["area"] < 25000 and 380 < info["center"][1] < 500 and info["center"][0] > 600:
            gamepad_mask |= (fg_labels == lbl)

    # 5. Headphones: center near (762, 610)
    headphones_mask = np.zeros((h, w), bool)
    for lbl, info in label_map.items():
        if 20000 < info["area"] < 40000 and 520 < info["center"][1] < 700 and info["center"][0] > 650:
            headphones_mask |= (fg_labels == lbl)

    # 6. Smartphone: center near (574, 625)
    phone_mask = np.zeros((h, w), bool)
    for lbl, info in label_map.items():
        if 8000 < info["area"] < 20000 and 560 < info["center"][1] < 680 and 520 < info["center"][0] < 620:
            phone_mask |= (fg_labels == lbl)

    # 7. Spiral Notebook: center near (361, 735)
    notebook_mask = np.zeros((h, w), bool)
    for lbl, info in label_map.items():
        if 15000 < info["area"] < 35000 and 650 < info["center"][1] < 800 and info["center"][0] < 450:
            notebook_mask |= (fg_labels == lbl)

    # 8. Gear: center near (531, 771)
    gear_mask = np.zeros((h, w), bool)
    for lbl, info in label_map.items():
        if 4000 < info["area"] < 10000 and 720 < info["center"][1] < 810 and 480 < info["center"][0] < 580:
            gear_mask |= (fg_labels == lbl)

    # 9. Coffee Mug: center near (736, 792)
    mug_mask = np.zeros((h, w), bool)
    for lbl, info in label_map.items():
        if 8000 < info["area"] < 20000 and 740 < info["center"][1] < 840 and info["center"][0] > 680:
            mug_mask |= (fg_labels == lbl)

    # 10. Document / Binder: center near (612, 816)
    binder_mask = np.zeros((h, w), bool)
    for lbl, info in label_map.items():
        if 2000 < info["area"] < 8000 and 780 < info["center"][1] < 860 and 580 < info["center"][0] < 650:
            binder_mask |= (fg_labels == lbl)

    # 11. Character & Floating paper:
    # Character head component is area > 200000, center y > 1000
    char_full_mask = np.zeros((h, w), bool)
    for lbl, info in label_map.items():
        if info["area"] > 200000 and info["center"][1] > 900:
            char_full_mask |= (fg_labels == lbl)

    # Separate floating paper from character:
    # Paper is in x in [375, 480], y in [810, 883]
    paper_mask = np.zeros((h, w), bool)
    # The paper contour:
    # y <= 880 or inside paper quad
    paper_roi = (char_full_mask) & (np.arange(h)[:, None] >= 810) & (np.arange(h)[:, None] <= 882) & (np.arange(w)[None, :] >= 370) & (np.arange(w)[None, :] <= 485)
    paper_mask[paper_roi] = True

    char_mask = char_full_mask.copy()
    # For char_mask, remove the paper
    char_mask[paper_mask] = False

    # Smooth the rim line of skull where paper met it
    # Between x=420..460, y=880..890, ensure smooth rim
    rim_touch = (np.arange(h)[:, None] >= 880) & (np.arange(h)[:, None] <= 885) & (np.arange(w)[None, :] >= 420) & (np.arange(w)[None, :] <= 460)
    char_mask[rim_touch & char_full_mask] = True

    # 12. Burst lines:
    burst_top_right = np.zeros((h, w), bool)
    burst_upper_left = np.zeros((h, w), bool)
    burst_lower_left = np.zeros((h, w), bool)
    burst_right = np.zeros((h, w), bool)
    burst_lower_right = np.zeros((h, w), bool)

    for lbl, info in label_map.items():
        cx, cy = info["center"]
        ba = info["area"]
        # Burst top right: ~ (708, 329)
        if 800 < ba < 2000 and 650 < cx < 750 and 280 < cy < 380:
            burst_top_right |= (fg_labels == lbl)
        # Burst upper left: ~ (158, 626)
        elif 800 < ba < 2000 and 100 < cx < 200 and 550 < cy < 670:
            burst_upper_left |= (fg_labels == lbl)
        # Burst lower left: ~ (168, 773)
        elif 800 < ba < 2500 and 100 < cx < 220 and 700 < cy < 830:
            burst_lower_left |= (fg_labels == lbl)
        # Burst right: ~ (917, 644)
        elif 800 < ba < 2500 and 850 < cx < 970 and 580 < cy < 700:
            burst_right |= (fg_labels == lbl)
        # Burst lower right: ~ (847, 866)
        elif 800 < ba < 2000 and 780 < cx < 900 and 820 < cy < 920:
            burst_lower_right |= (fg_labels == lbl)

    all_burst_mask = burst_top_right | burst_upper_left | burst_lower_left | burst_right | burst_lower_right

    # 13. Confetti particles:
    confetti_zigzag = np.zeros((h, w), bool)
    confetti_curl = np.zeros((h, w), bool)
    confetti_trapezoid = np.zeros((h, w), bool)
    confetti_square = np.zeros((h, w), bool)
    confetti_sparkles = np.zeros((h, w), bool)

    for lbl, info in label_map.items():
        cx, cy = info["center"]
        ba = info["area"]
        if 1500 < ba < 3000 and 180 < cx < 260 and 540 < cy < 620:
            confetti_zigzag |= (fg_labels == lbl)
        elif 250 < ba < 600 and 800 < cx < 880 and 740 < cy < 810:
            confetti_curl |= (fg_labels == lbl)
        elif 600 < ba < 1500 and 120 < cx < 200 and 880 < cy < 950:
            confetti_trapezoid |= (fg_labels == lbl)
        elif 350 < ba < 700 and 140 < cx < 210 and 410 < cy < 470:
            confetti_square |= (fg_labels == lbl)
        elif ba < 600 and not (all_burst_mask | cap_mask | bulb_mask | laptop_mask | gamepad_mask | headphones_mask | phone_mask | notebook_mask | gear_mask | mug_mask | binder_mask | char_mask | paper_mask)[fg_labels == lbl].any():
            confetti_sparkles |= (fg_labels == lbl)

    all_confetti_mask = confetti_zigzag | confetti_curl | confetti_trapezoid | confetti_square | confetti_sparkles

    # Save all main components
    components_to_save = [
        ("01_character.png", char_mask),
        ("02_floating_cap.png", cap_mask),
        ("03_laptop.png", laptop_mask),
        ("04_lightbulb.png", bulb_mask),
        ("05_game_controller.png", gamepad_mask),
        ("06_headphones.png", headphones_mask),
        ("07_smartphone.png", phone_mask),
        ("08_spiral_notebook.png", notebook_mask),
        ("09_gear.png", gear_mask),
        ("10_coffee_mug.png", mug_mask),
        ("11_document_binder.png", binder_mask),
        ("12_floating_paper.png", paper_mask),
        ("13_burst_lines.png", all_burst_mask),
        ("14_confetti_all.png", all_confetti_mask),
    ]

    metadata_list = []
    for fname, mask in components_to_save:
        fpath = os.path.join(output_dir, fname)
        meta = crop_and_save(mask, fpath)
        if meta:
            metadata_list.append(meta)
            print(f"Saved: {fname} ({meta['width']}x{meta['height']})")

    # Save individual particle components
    particles_to_save = [
        ("burst_top_right.png", burst_top_right),
        ("burst_upper_left.png", burst_upper_left),
        ("burst_lower_left.png", burst_lower_left),
        ("burst_right.png", burst_right),
        ("burst_lower_right.png", burst_lower_right),
        ("confetti_zigzag_ribbon.png", confetti_zigzag),
        ("confetti_curl_squiggle.png", confetti_curl),
        ("confetti_trapezoid.png", confetti_trapezoid),
        ("confetti_square.png", confetti_square),
        ("confetti_sparkles.png", confetti_sparkles),
    ]

    particles_metadata = []
    for fname, mask in particles_to_save:
        fpath = os.path.join(particles_dir, fname)
        meta = crop_and_save(mask, fpath)
        if meta:
            particles_metadata.append(meta)
            print(f"Saved particle: {fname} ({meta['width']}x{meta['height']})")

    # Save metadata JSON
    full_meta = {
        "canvas_size": {"width": w, "height": h},
        "components": metadata_list,
        "particles": particles_metadata
    }

    meta_json_path = os.path.join(output_dir, "components_metadata.json")
    with open(meta_json_path, "w", encoding="utf-8") as f:
        json.dump(full_meta, f, indent=2)
    print("Saved components_metadata.json")

if __name__ == "__main__":
    extract_all()
