import os
import json
import cv2
import numpy as np
from PIL import Image

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

def save_gif(frames, out_paths, durations, loop=0):
    gif_trans_frames = []
    for p_img in frames:
        alpha = np.array(p_img.split()[-1])
        rgb = p_img.convert('RGB')
        p_frame = rgb.quantize(colors=254, method=Image.Quantize.MEDIANCUT)
        p_frame_np = np.array(p_frame)
        p_frame_np[alpha < 100] = 255
        p_res = Image.fromarray(p_frame_np, mode='P')
        p_res.putpalette(p_frame.getpalette() + [0, 0, 0])
        p_res.info['transparency'] = 255
        gif_trans_frames.append(p_res)

    for p in out_paths:
        os.makedirs(os.path.dirname(os.path.abspath(p)), exist_ok=True)
        try:
            gif_trans_frames[0].save(
                p,
                format='GIF',
                save_all=True,
                append_images=gif_trans_frames[1:],
                duration=durations,
                loop=loop,
                disposal=2,
                transparency=255
            )
            print(f"Saved GIF: {p}")
        except Exception as e:
            print(f"Warning: Failed to save GIF to {p}: {e}")

def save_webp(frames, out_paths, durations, loop=0):
    for p in out_paths:
        os.makedirs(os.path.dirname(os.path.abspath(p)), exist_ok=True)
        try:
            frames[0].save(
                p,
                format='WEBP',
                save_all=True,
                append_images=frames[1:],
                duration=durations,
                loop=loop,
                lossless=True
            )
            print(f"Saved WebP: {p}")
        except Exception as e:
            print(f"Warning: Failed to save WebP to {p}: {e}")

def run():
    comp_dir = r'C:\TrainAi\Animated\Components'
    output_dir = r'C:\TrainAi\Animated'
    public_dir = r'C:\TrainAi\Animated\public'
    meta_path = os.path.join(comp_dir, 'components_metadata.json')

    with open(meta_path) as f:
        meta = json.load(f)

    # Resolution: 640x960
    W, H = 640, 960
    S = 640.0 / 1024.0 # 0.625

    # Load and scale components
    comp_imgs = {}
    for c in meta['components']:
        fpath = os.path.join(comp_dir, c['file'])
        img = cv2.imread(fpath, cv2.IMREAD_UNCHANGED)
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

    # Base character 01_character.png
    char_open = cv2.imread(os.path.join(comp_dir, '01_character.png'), cv2.IMREAD_UNCHANGED)
    char_x, char_y = 218, 864
    char_canvas_1024 = np.zeros((1536, 1024, 4), dtype=np.uint8)
    h_c, w_c, _ = char_open.shape
    char_canvas_1024[char_y:char_y+h_c, char_x:char_x+w_c] = char_open

    # Eyelid blink states for 01_character.png
    char_blink_1024 = char_canvas_1024.copy()
    p_y0 = char_y + 250
    p_x0 = char_x + 270
    pupil_crop = char_blink_1024[p_y0:p_y0+60, p_x0:p_x0+70].copy()
    gray_p = cv2.cvtColor(pupil_crop[:, :, :3], cv2.COLOR_BGR2GRAY)
    pupil_mask = (gray_p < 80) & (pupil_crop[:, :, 3] > 100)
    clean_p = pupil_crop.copy()
    clean_p[:, :, :3] = cv2.inpaint(pupil_crop[:, :, :3], pupil_mask.astype(np.uint8), 3, cv2.INPAINT_TELEA)

    eyelid_closed = clean_p.copy()
    pts = np.array([[28, 26], [46, 32], [64, 27]], np.int32)
    xs = np.linspace(28, 64, 40)
    poly = np.polyfit(pts[:, 0], pts[:, 1], 2)
    ys = np.polyval(poly, xs)
    for i in range(len(xs) - 1):
        p1 = (int(round(xs[i])), int(round(ys[i])))
        p2 = (int(round(xs[i+1])), int(round(ys[i+1])))
        cv2.line(eyelid_closed, p1, p2, (20, 20, 20, 255), 4, cv2.LINE_AA)

    eyelid_half = clean_p.copy()
    M_half = np.float32([[1, 0, 0], [0, 0.45, 30 * 0.55]])
    warped_pupil = cv2.warpAffine((pupil_mask * 255).astype(np.uint8), M_half, (70, 60))
    eyelid_half[warped_pupil > 50, :3] = (20, 20, 20)
    eyelid_half[warped_pupil > 50, 3] = 255

    char_blink_half_1024 = char_canvas_1024.copy()
    char_blink_half_1024[p_y0:p_y0+60, p_x0:p_x0+70] = eyelid_half
    char_blink_closed_1024 = char_canvas_1024.copy()
    char_blink_closed_1024[p_y0:p_y0+60, p_x0:p_x0+70] = eyelid_closed

    char_base = cv2.resize(char_canvas_1024, (W, H), interpolation=cv2.INTER_AREA)
    char_base_half = cv2.resize(char_blink_half_1024, (W, H), interpolation=cv2.INTER_AREA)
    char_base_closed = cv2.resize(char_blink_closed_1024, (W, H), interpolation=cv2.INTER_AREA)

    cap_img = comp_imgs['02_floating_cap.png']['img']

    # Seated cap coordinates (Closed state)
    cap_seated_x = 234.0
    cap_seated_y = 715.0
    cap_w_1024 = 550.0
    cap_h_1024 = 321.0
    CAP_SEATED_CX = (cap_seated_x + cap_w_1024 / 2.0) * S # 318.125
    CAP_SEATED_CY = (cap_seated_y + cap_h_1024 / 2.0) * S # 547.1875

    # Floating cap coordinates (Open state)
    cap_info = comp_imgs['02_floating_cap.png']
    CAP_FLOAT_CX = cap_info['target_cx'] # 302.5
    CAP_FLOAT_CY = cap_info['target_cy'] # 121.5

    # =========================================================================
    # PART 1: GIF NOT OPEN (Closed State with Cap on Head & Natural Eye Blinks)
    # =========================================================================
    print("--- Generating NOT OPEN GIF ---")
    NOT_OPEN_FRAMES = 40 # 40 frames at 50ms = 2.0s seamless loop
    not_open_rgba = []

    for f_i in range(NOT_OPEN_FRAMES):
        # Subtle gentle idle breathing / sway
        idle_t = f_i / float(NOT_OPEN_FRAMES)
        idle_dy = np.sin(idle_t * 2.0 * np.pi) * 1.5

        # Eye blink schedule:
        # Blink 1: frames 8..11 (half, closed, closed, half)
        # Blink 2: frames 24..26 (half, closed, half)
        if f_i in [8, 11, 24, 26]:
            char_f = char_base_half.copy()
        elif f_i in [9, 10, 25]:
            char_f = char_base_closed.copy()
        else:
            char_f = char_base.copy()

        canvas = np.zeros((H, W, 4), dtype=np.uint8)
        # Offset character slightly by idle_dy
        M_idle = np.float32([[1, 0, 0], [0, 1, idle_dy]])
        canvas_char = cv2.warpAffine(char_f, M_idle, (W, H), flags=cv2.INTER_LINEAR)
        canvas = canvas_char.copy()

        # Seat cap firmly on head with corresponding subtle idle
        cap_cy = CAP_SEATED_CY + idle_dy
        composite_item(canvas, cap_img, CAP_SEATED_CX, cap_cy, scale=1.0, angle=0.0, alpha_mult=1.0)

        rgba = cv2.cvtColor(canvas, cv2.COLOR_BGRA2RGBA)
        not_open_rgba.append(Image.fromarray(rgba))

    not_open_durations = [50] * NOT_OPEN_FRAMES
    # Pause slightly at frame 0
    not_open_durations[0] = 120

    public_assets_dir = os.path.join(public_dir, 'assets')
    src_assets_dir = os.path.join(output_dir, 'src', 'assets')

    # Save Not Open GIF
    not_open_paths = [
        os.path.join(comp_dir, 'avatar_not_open.gif'),
        os.path.join(public_dir, 'avatar_not_open.gif'),
        os.path.join(public_assets_dir, 'avatar_not_open.gif'),
        os.path.join(src_assets_dir, 'avatar_not_open.gif'),
        os.path.join(output_dir, 'avatar_not_open.gif'),
    ]
    save_gif(not_open_rgba, not_open_paths, not_open_durations, loop=0)

    # Save Not Open WebP
    not_open_webp_paths = [
        os.path.join(public_dir, 'avatar_not_open.webp'),
        os.path.join(public_assets_dir, 'avatar_not_open.webp'),
        os.path.join(output_dir, 'avatar_not_open.webp'),
    ]
    save_webp(not_open_rgba, not_open_webp_paths, not_open_durations, loop=0)

    # =========================================================================
    # PART 2: GIF OPEN (Full Mind-Blown Continuous Levitation & Burst Loop)
    # =========================================================================
    print("--- Generating OPEN GIF (Continuous Infinite Levitation Loop - NEVER AUTO CLOSES) ---")
    OPEN_FRAMES = 48 # 48 frames at 50ms = 2.4s seamless loop
    open_rgba = []

    idea_items = [
        # (filename, bob_amp_x, bob_amp_y, freq, phase, rot_amp)
        ('04_lightbulb.png',        2.0,  7.0, 1.0, 0.5,   4.0),
        ('03_laptop.png',          -3.0, 10.0, 1.0, 1.2,   3.5),
        ('05_game_controller.png',  2.5,  9.0, 1.0, 2.8,  -3.5),
        ('06_headphones.png',       3.0, 11.0, 1.0, 4.1,   3.0),
        ('07_smartphone.png',      -2.0,  8.0, 1.0, 1.7,  -4.0),
        ('08_spiral_notebook.png', -2.5,  9.0, 1.0, 3.2,   3.5),
        ('09_gear.png',             1.5,  6.0, 1.0, 5.0,  18.0), # Rotating gear!
        ('10_coffee_mug.png',       2.0,  8.0, 1.0, 0.9,  -3.0),
        ('11_document_binder.png', -1.5,  7.0, 1.0, 2.2,   4.0),
        ('12_floating_paper.png',  -2.0,  6.0, 1.0, 3.8,  -5.0),
    ]

    for f_i in range(OPEN_FRAMES):
        t_cycle = f_i / float(OPEN_FRAMES) # 0.0 to 1.0
        t_rad = t_cycle * 2.0 * np.pi

        # 1. Base open character 01_character.png
        canvas = char_base.copy()

        # 2. Burst lines and Confetti pulse continuously
        pulse = np.sin(t_rad * 2.0) * 0.04
        b_scale = 1.0 + pulse
        b_alpha = 0.90 + pulse * 1.5

        burst_info = comp_imgs['13_burst_lines.png']
        composite_item(canvas, burst_info['img'], burst_info['target_cx'], burst_info['target_cy'], scale=b_scale, alpha_mult=b_alpha)

        confetti_info = comp_imgs['14_confetti_all.png']
        composite_item(canvas, confetti_info['img'], confetti_info['target_cx'], confetti_info['target_cy'], scale=b_scale * 0.96, alpha_mult=b_alpha)

        # 3. All Idea Items Floating Seamlessly
        for item_name, amp_x, amp_y, freq, phase, rot_amp in idea_items:
            item_data = comp_imgs[item_name]
            tcx = item_data['target_cx']
            tcy = item_data['target_cy']

            wave_y = np.sin(t_rad * freq + phase)
            wave_x = np.cos(t_rad * freq + phase)
            curr_cx = tcx + wave_x * amp_x
            curr_cy = tcy + wave_y * amp_y
            curr_angle = rot_amp * np.sin(t_rad * freq + phase * 1.1)
            curr_scale = 1.0 + wave_y * 0.025

            composite_item(canvas, item_data['img'], curr_cx, curr_cy, scale=curr_scale, angle=curr_angle, alpha_mult=1.0)

        # 4. Snapback Cap Floating at the Top (Never descends down onto head)
        cap_wave_y = np.sin(t_rad * 1.0)
        cap_wave_x = np.cos(t_rad * 1.0)
        cap_cx = CAP_FLOAT_CX + cap_wave_x * 3.0
        cap_cy = CAP_FLOAT_CY + cap_wave_y * 8.0
        cap_angle = -2.0 + np.sin(t_rad * 1.0 + 0.3) * 2.2
        cap_scale = 1.0 + cap_wave_y * 0.02

        composite_item(canvas, cap_img, cap_cx, cap_cy, scale=cap_scale, angle=cap_angle, alpha_mult=1.0)

        rgba = cv2.cvtColor(canvas, cv2.COLOR_BGRA2RGBA)
        open_rgba.append(Image.fromarray(rgba))

    open_durations = [50] * OPEN_FRAMES

    # Save Open GIF (Continuous Loop - Stays Open Forever until User Clicks!)
    open_paths = [
        os.path.join(comp_dir, 'avatar_open.gif'),
        os.path.join(comp_dir, '17_mind_blown_avatar.gif'),
        os.path.join(public_dir, 'avatar_open.gif'),
        os.path.join(public_dir, '17_mind_blown_avatar.gif'),
        os.path.join(public_assets_dir, 'avatar_open.gif'),
        os.path.join(public_assets_dir, '17_mind_blown_avatar.gif'),
        os.path.join(src_assets_dir, 'avatar_open.gif'),
        os.path.join(output_dir, 'avatar_open.gif'),
        os.path.join(output_dir, 'mind_blown_avatar.gif'),
    ]
    save_gif(open_rgba, open_paths, open_durations, loop=0)

    # Save Open WebP
    open_webp_paths = [
        os.path.join(public_dir, 'avatar_open.webp'),
        os.path.join(public_dir, 'mind_blown_avatar.webp'),
        os.path.join(public_assets_dir, 'avatar_open.webp'),
        os.path.join(public_assets_dir, 'mind_blown_avatar.webp'),
        os.path.join(output_dir, 'avatar_open.webp'),
        os.path.join(output_dir, 'mind_blown_avatar.webp'),
    ]
    save_webp(open_rgba, open_webp_paths, open_durations, loop=0)

    print("--- SUCCESS: Generated separate NOT OPEN and OPEN GIFs! ---")

if __name__ == '__main__':
    run()
