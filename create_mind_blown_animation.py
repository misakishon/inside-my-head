import os
import json
import cv2
import numpy as np
from PIL import Image

def ease_out_back(x, c1=1.70158):
    c3 = c1 + 1.0
    return 1.0 + c3 * ((x - 1.0) ** 3) + c1 * ((x - 1.0) ** 2)

def ease_in_cubic(x):
    return x * x * x

def ease_in_out_sine(x):
    return -(np.cos(np.pi * x) - 1.0) / 2.0

def composite_item(canvas, item_rgba, cx, cy, scale=1.0, angle=0.0, alpha_mult=1.0):
    if scale <= 0.01 or alpha_mult <= 0.01:
        return
    h_item, w_item = item_rgba.shape[:2]
    H, W = canvas.shape[:2]

    M_rot = cv2.getRotationMatrix2D((w_item / 2.0, h_item / 2.0), angle, scale)
    M_rot[0, 2] += (cx - w_item / 2.0)
    M_rot[1, 2] += (cy - h_item / 2.0)

    warped = cv2.warpAffine(item_rgba, M_rot, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))

    if alpha_mult < 1.0:
        warped[:, :, 3] = (warped[:, :, 3].astype(np.float32) * alpha_mult).astype(np.uint8)

    w_a = (warped[:, :, 3:4] / 255.0)
    c_a = (canvas[:, :, 3:4] / 255.0)

    out_a = w_a + c_a * (1.0 - w_a)
    out_rgb = (warped[:, :, :3] * w_a + canvas[:, :, :3] * c_a * (1.0 - w_a)) / np.maximum(out_a, 1e-5)

    canvas[:, :, :3] = np.clip(out_rgb, 0, 255).astype(np.uint8)
    canvas[:, :, 3] = np.clip(out_a[:, :, 0] * 255.0, 0, 255).astype(np.uint8)

def generate_animation():
    comp_dir = r'C:\TrainAi\Animated\Components'
    output_dir = r'C:\TrainAi\Animated'
    meta_path = os.path.join(comp_dir, 'components_metadata.json')

    with open(meta_path) as f:
        meta = json.load(f)

    # Resolution: 640x960
    W, H = 640, 960
    S = 640.0 / 1024.0 # 0.625

    # Origin where items fly out from inside the head:
    ORIGIN_X = 512.0 * S
    ORIGIN_Y = 885.0 * S

    # Load all separated components
    comp_imgs = {}
    for c in meta['components']:
        fpath = os.path.join(comp_dir, c['file'])
        img = cv2.imread(fpath, cv2.IMREAD_UNCHANGED)
        # Pre-scale items to match S
        new_w = max(1, int(round(c['width'] * S)))
        new_h = max(1, int(round(c['height'] * S)))
        scaled_img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
        
        target_cx = (c['x'] + c['width'] / 2.0) * S
        target_cy = (c['y'] + c['height'] / 2.0) * S

        comp_imgs[c['file']] = {
            'img': scaled_img,
            'target_cx': target_cx,
            'target_cy': target_cy,
            'orig_w': new_w,
            'orig_h': new_h
        }

    # Load character bases
    char_open = cv2.imread(os.path.join(comp_dir, '01_character.png'), cv2.IMREAD_UNCHANGED)
    hooded = cv2.imread(os.path.join(comp_dir, 'Monochrome Hooded Glasses Avatar - Transparent.png'), cv2.IMREAD_UNCHANGED)

    # Affine transform for hooded -> canvas
    char_x, char_y = 218, 864
    M = np.array([
        [1.47183776e+00,  1.79117538e-02,  2.11636903e+02],
        [-1.79117538e-02,  1.47183776e+00,  2.04862444e+02]
    ])
    M_inv = cv2.invertAffineTransform(M)
    M_canvas = M_inv.copy()
    M_canvas[0, 2] += char_x
    M_canvas[1, 2] += char_y

    hooded_1024 = cv2.warpAffine(hooded, M_canvas, (1024, 1536), flags=cv2.INTER_LANCZOS4)
    char_1024 = np.zeros((1536, 1024, 4), dtype=np.uint8)
    h_c, w_c, _ = char_open.shape
    char_1024[char_y:char_y+h_c, char_x:char_x+w_c] = char_open

    # Pre-render hooded blink states
    print("Generating hooded blink states...")
    crop_h = hooded[530:660, 570:930].copy()
    gray_h = cv2.cvtColor(crop_h[:, :, :3], cv2.COLOR_BGR2GRAY)
    ink_h = (gray_h < 100).astype(np.uint8)
    num_l, lbls, _, cents = cv2.connectedComponentsWithStats(ink_h)
    mask_e = np.zeros(gray_h.shape, np.uint8)
    for i in [2, 3]:
        mask_e[lbls == i] = 255
    mask_dil = cv2.dilate(mask_e, np.ones((5, 5), np.uint8))
    clean_h = crop_h.copy()
    clean_h[:, :, :3] = cv2.inpaint(crop_h[:, :, :3], mask_dil, 5, cv2.INPAINT_TELEA)

    def draw_curve(canvas, pts, max_th=8):
        xs = np.linspace(pts[0, 0], pts[-1, 0], 120)
        poly = np.polyfit(pts[:, 0], pts[:, 1], 2)
        ys = np.polyval(poly, xs)
        for i in range(len(xs) - 1):
            rel = i / len(xs)
            thick = max(2, int(round(max_th * (np.sin(rel * np.pi) ** 0.5))))
            p1 = (int(round(xs[i])), int(round(ys[i])))
            p2 = (int(round(xs[i+1])), int(round(ys[i+1])))
            cv2.line(canvas, p1, p2, (0, 0, 0, 255), thick, cv2.LINE_AA)

    def get_hooded_frame(state):
        if state == 'open':
            return hooded.copy()
        f = clean_h.copy()
        if state == 'half':
            wl = cv2.warpAffine((lbls == 3).astype(np.uint8) * 255, np.float32([[1, 0, 0], [0, 0.48, 95 * 0.52]]), (f.shape[1], f.shape[0]))
            wr = cv2.warpAffine((lbls == 2).astype(np.uint8) * 255, np.float32([[1, 0, 0], [0, 0.48, 88 * 0.52]]), (f.shape[1], f.shape[0]))
            comb = (wl > 50) | (wr > 50)
            cf = cv2.GaussianBlur(comb.astype(np.float32), (3, 3), 0.5)
            for c_i in range(3):
                f[:, :, c_i] = (f[:, :, c_i] * (1.0 - cf)).astype(np.uint8)
            f[comb, 3] = 255
        elif state == 'closed':
            pts_l = np.array([[48, 71], [94, 77], [140, 72]], np.int32)
            pts_r = np.array([[272, 70], [303, 75], [334, 71]], np.int32)
            draw_curve(f, pts_l, max_th=8)
            draw_curve(f, pts_r, max_th=8)
        full = hooded.copy()
        full[530:660, 570:930] = f
        return full

    def warp_hooded(h_img):
        w_1024 = cv2.warpAffine(h_img, M_canvas, (1024, 1536), flags=cv2.INTER_LANCZOS4)
        return cv2.resize(w_1024, (W, H), interpolation=cv2.INTER_AREA)

    hooded_base_open = warp_hooded(get_hooded_frame('open'))
    hooded_base_half = warp_hooded(get_hooded_frame('half'))
    hooded_base_closed = warp_hooded(get_hooded_frame('closed'))

    char_open_base = cv2.resize(char_1024, (W, H), interpolation=cv2.INTER_AREA)


    # Floating components list (excluding character itself)
    floating_items = [
        # (filename, stagger_delay, bob_amplitude, bob_freq, bob_phase, rot_amp)
        ('02_floating_cap.png',    0.00,  8.0, 1.0, 0.0, 2.0),
        ('03_laptop.png',          0.05, 10.0, 0.9, 1.2, 3.5),
        ('04_lightbulb.png',       0.03,  7.0, 1.2, 2.4, 4.0),
        ('05_game_controller.png', 0.06,  9.0, 0.8, 3.1, -3.0),
        ('06_headphones.png',      0.08, 11.0, 1.1, 4.2, 2.5),
        ('07_smartphone.png',      0.10,  8.0, 1.0, 0.8, -4.0),
        ('08_spiral_notebook.png', 0.12,  9.0, 0.9, 1.9, 3.0),
        ('09_gear.png',            0.15,  6.0, 1.3, 3.5, 12.0),
        ('10_coffee_mug.png',      0.14,  8.0, 1.0, 5.0, -3.5),
        ('11_document_binder.png', 0.16,  7.0, 1.1, 2.8, 4.0),
        ('12_floating_paper.png',  0.18,  6.0, 1.4, 0.5, -5.0),
    ]

    TOTAL_FRAMES = 72
    # Phases:
    # 0..11: Closed state (12 frames)
    # 12..25: Opening explosion (14 frames)
    # 26..47: Floating state (22 frames)
    # 48..61: Closing absorption (14 frames)
    # 62..71: Closed rest (10 frames)

    rgba_frames = []
    print(f"Rendering {TOTAL_FRAMES} frames at {W}x{H}...")

    for f_idx in range(TOTAL_FRAMES):
        canvas = np.zeros((H, W, 4), dtype=np.uint8)

        # Helper to pick hooded frame with blink
        if f_idx in [4, 6]:
            current_hooded = hooded_base_half
        elif f_idx == 5:
            current_hooded = hooded_base_closed
        else:
            current_hooded = hooded_base_open

        # 1. Determine Head & Hood state
        if f_idx < 12 or f_idx >= 62:
            # Fully closed hooded
            char_canvas = current_hooded.copy()
            openness = 0.0
        elif 12 <= f_idx < 17:
            # Transition from hooded to open head
            t = (f_idx - 12) / 5.0
            t_smooth = ease_in_out_sine(t)
            char_canvas = np.clip(current_hooded.astype(np.float32) * (1.0 - t_smooth) + char_open_base.astype(np.float32) * t_smooth, 0, 255).astype(np.uint8)
            openness = t_smooth * 0.4

        elif 17 <= f_idx < 48:
            # Fully open head
            char_canvas = char_open_base.copy()
            if f_idx < 26:
                # Emergence progress
                t = (f_idx - 17) / 9.0
                openness = 0.4 + t * 0.6
            else:
                openness = 1.0
        elif 48 <= f_idx < 56:
            # Closing emergence
            t = (f_idx - 48) / 8.0
            openness = 1.0 - t * 0.7
            char_canvas = char_open_base.copy()
        elif 56 <= f_idx < 62:
            # Transition from open to hooded
            t = (f_idx - 56) / 6.0
            t_smooth = ease_in_out_sine(t)
            char_canvas = np.clip(char_open_base.astype(np.float32) * (1.0 - t_smooth) + current_hooded.astype(np.float32) * t_smooth, 0, 255).astype(np.uint8)
            openness = (1.0 - t_smooth) * 0.3

        # Base character onto canvas
        canvas = char_canvas.copy()

        # 2. Render Burst Lines & Confetti (Behind or around floating items)
        # Burst lines appear during explosion: peak around frames 20..32
        if 14 <= f_idx < 52:
            if 14 <= f_idx < 24:
                # burst in
                b_t = (f_idx - 14) / 10.0
                b_scale = ease_out_back(b_t, 1.2)
                b_alpha = min(1.0, b_t * 1.5)
            elif 24 <= f_idx < 44:
                # floating pulse
                b_pulse = np.sin((f_idx - 24) * 0.3) * 0.05
                b_scale = 1.0 + b_pulse
                b_alpha = 0.85 + b_pulse * 2.0
            else:
                # retracting
                b_t = (f_idx - 44) / 8.0
                b_scale = max(0.1, 1.0 - b_t)
                b_alpha = max(0.0, 1.0 - b_t * 1.3)

            burst_info = comp_imgs['13_burst_lines.png']
            composite_item(canvas, burst_info['img'], burst_info['target_cx'], burst_info['target_cy'], scale=b_scale, alpha_mult=b_alpha)

            confetti_info = comp_imgs['14_confetti_all.png']
            composite_item(canvas, confetti_info['img'], confetti_info['target_cx'], confetti_info['target_cy'], scale=b_scale * 0.95, alpha_mult=b_alpha)

        # 3. Render Floating Items
        for item_name, stagger, bob_amp, bob_freq, bob_phase, rot_amp in floating_items:
            item_data = comp_imgs[item_name]
            target_cx = item_data['target_cx']
            target_cy = item_data['target_cy']

            if f_idx < 12 or f_idx >= 62:
                # Hidden inside closed head
                continue

            elif 12 <= f_idx < 26:
                # Emergence: from (ORIGIN_X, ORIGIN_Y) to (target_cx, target_cy)
                raw_t = (f_idx - 12) / 14.0
                t_item = np.clip((raw_t - stagger) / (1.0 - stagger), 0.0, 1.0)
                if t_item <= 0.0:
                    continue
                ease_t = ease_out_back(t_item, 1.4)
                curr_cx = ORIGIN_X + (target_cx - ORIGIN_X) * ease_t
                curr_cy = ORIGIN_Y + (target_cy - ORIGIN_Y) * ease_t
                curr_scale = min(1.15, max(0.08, ease_t))
                curr_angle = rot_amp * np.sin(t_item * np.pi)
                curr_alpha = min(1.0, t_item * 1.8)

            elif 26 <= f_idx < 48:
                # Floating Levitation state
                float_t = (f_idx - 26) / 22.0
                wave = np.sin(float_t * 2.0 * np.pi * bob_freq + bob_phase)
                curr_cx = target_cx + wave * (bob_amp * 0.3)
                curr_cy = target_cy + wave * bob_amp
                curr_scale = 1.0 + wave * 0.02
                curr_angle = rot_amp * np.sin(float_t * 2.0 * np.pi * bob_freq + bob_phase * 1.2)
                curr_alpha = 1.0

            elif 48 <= f_idx < 62:
                # Absorption: back into (ORIGIN_X, ORIGIN_Y)
                raw_t = (f_idx - 48) / 14.0
                # Stagger reverse: items closer to head sink first
                rev_stagger = (1.0 - stagger) * 0.3
                t_item = np.clip((raw_t - rev_stagger) / (1.0 - rev_stagger), 0.0, 1.0)
                ease_t = ease_in_cubic(t_item)
                curr_cx = target_cx + (ORIGIN_X - target_cx) * ease_t
                curr_cy = target_cy + (ORIGIN_Y - target_cy) * ease_t
                curr_scale = max(0.05, 1.0 - ease_t * 0.95)
                curr_angle = rot_amp * (1.0 - ease_t)
                curr_alpha = max(0.0, 1.0 - ease_t * 1.2)

            composite_item(canvas, item_data['img'], curr_cx, curr_cy, scale=curr_scale, angle=curr_angle, alpha_mult=curr_alpha)

        # Convert to PIL RGBA
        rgba_canvas = cv2.cvtColor(canvas, cv2.COLOR_BGRA2RGBA)
        rgba_frames.append(Image.fromarray(rgba_canvas))

    print(f"Rendered all {len(rgba_frames)} frames.")

    # Frame duration: 50ms (20 fps)
    durations = [50] * TOTAL_FRAMES
    # Give a slightly longer pause at peak open (frame 36) and closed (frame 0)
    durations[0] = 300
    durations[36] = 200

    # 1. Save High Quality WebP (Lossless 8-bit Alpha)
    webp_path = os.path.join(output_dir, 'mind_blown_avatar.webp')
    rgba_frames[0].save(
        webp_path,
        format='WEBP',
        save_all=True,
        append_images=rgba_frames[1:],
        duration=durations,
        loop=0,
        lossless=True
    )
    print(f"Saved: {webp_path}")

    # 2. Save Transparent GIF
    gif_trans_frames = []
    for p_img in rgba_frames:
        alpha = np.array(p_img.split()[-1])
        rgb = p_img.convert('RGB')
        p_frame = rgb.quantize(colors=254, method=Image.Quantize.MEDIANCUT)
        p_frame_np = np.array(p_frame)
        p_frame_np[alpha < 100] = 255
        p_res = Image.fromarray(p_frame_np, mode='P')
        p_res.putpalette(p_frame.getpalette() + [0, 0, 0])
        p_res.info['transparency'] = 255
        gif_trans_frames.append(p_res)

    gif_path = os.path.join(output_dir, 'mind_blown_avatar.gif')
    gif_trans_frames[0].save(
        gif_path,
        format='GIF',
        save_all=True,
        append_images=gif_trans_frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        transparency=255
    )
    print(f"Saved: {gif_path}")

    # Save to Components/
    comp_gif_path = os.path.join(comp_dir, '17_mind_blown_avatar.gif')
    gif_trans_frames[0].save(
        comp_gif_path,
        format='GIF',
        save_all=True,
        append_images=gif_trans_frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        transparency=255
    )
    print(f"Saved: {comp_gif_path}")

    # 3. Save Dark Mode pre-matted GIF (slate-950: #0b0f19)
    dark_bg = np.array([11, 15, 25], dtype=np.float32)
    dark_frames = []
    for p_img in rgba_frames:
        p_np = np.array(p_img).astype(np.float32)
        a = p_np[:, :, 3:4] / 255.0
        comp = p_np[:, :, :3] * a + dark_bg * (1.0 - a)
        p_d = Image.fromarray(np.clip(comp, 0, 255).astype(np.uint8)).quantize(colors=256)
        dark_frames.append(p_d)

    dark_gif_path = os.path.join(output_dir, 'mind_blown_avatar_dark.gif')
    dark_frames[0].save(
        dark_gif_path,
        format='GIF',
        save_all=True,
        append_images=dark_frames[1:],
        duration=durations,
        loop=0
    )
    print(f"Saved: {dark_gif_path}")

if __name__ == '__main__':
    generate_animation()
