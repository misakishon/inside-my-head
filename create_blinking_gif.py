import os
import cv2
import numpy as np
from PIL import Image

def generate_blinking_animation():
    input_path = r'C:\Users\Shon\AppData\Local\Temp\orca-paste-1792476281405-de466e2c-b42b-4a62-8bfb-2d8ed94e54f1.png'
    output_dir = r'C:\TrainAi\Animated'
    comp_dir = r'C:\TrainAi\Animated\Components'
    os.makedirs(comp_dir, exist_ok=True)

    orig = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    h, w, _ = orig.shape

    # Focus on the eye region
    # y: 530..660, x: 570..930
    crop = orig[530:660, 570:930].copy()
    gray = cv2.cvtColor(crop[:, :, :3], cv2.COLOR_BGR2GRAY)
    ink = (gray < 100).astype(np.uint8)
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(ink)

    mask_eyes = np.zeros(gray.shape, np.uint8)
    for i in [2, 3]:
        mask_eyes[labels == i] = 255
    mask_dil = cv2.dilate(mask_eyes, np.ones((5,5), np.uint8))
    clean_base = crop.copy()
    clean_base[:, :, :3] = cv2.inpaint(crop[:, :, :3], mask_dil, 5, cv2.INPAINT_TELEA)

    orig_left_eye = (labels == 3)
    orig_right_eye = (labels == 2)

    def scale_eye_shape(eye_mask, y_anchor, scale_y):
        h_c, w_c = eye_mask.shape
        M = np.float32([
            [1, 0, 0],
            [0, scale_y, y_anchor * (1.0 - scale_y)]
        ])
        warped = cv2.warpAffine(eye_mask.astype(np.uint8) * 255, M, (w_c, h_c), flags=cv2.INTER_LINEAR)
        return warped

    def draw_tapered_curve(canvas, pts, max_thickness=8):
        xs = np.linspace(pts[0, 0], pts[-1, 0], 120)
        poly = np.polyfit(pts[:, 0], pts[:, 1], 2)
        ys = np.polyval(poly, xs)
        for i in range(len(xs) - 1):
            rel = i / len(xs)
            t_factor = np.sin(rel * np.pi) ** 0.5
            thick = max(2, int(round(max_thickness * t_factor)))
            p1 = (int(round(xs[i])), int(round(ys[i])))
            p2 = (int(round(xs[i+1])), int(round(ys[i+1])))
            cv2.line(canvas, p1, p2, (0, 0, 0, 255), thick, cv2.LINE_AA)

    def get_frame(state):
        # returns full 1254x1254 RGBA frame
        if state == 'open':
            return orig.copy()
        
        frame_crop = clean_base.copy()
        h_c, w_c, _ = frame_crop.shape

        if state == 'half_close':
            wl = scale_eye_shape(orig_left_eye, 95, 0.45)
            wr = scale_eye_shape(orig_right_eye, 88, 0.45)
            combined = (wl > 50) | (wr > 50)
            comb_f = cv2.GaussianBlur(combined.astype(np.float32), (3, 3), 0.5)
            for c in range(3):
                frame_crop[:, :, c] = (frame_crop[:, :, c] * (1.0 - comb_f) + 0.0 * comb_f).astype(np.uint8)
            frame_crop[combined, 3] = 255
            
        elif state == 'half_open':
            wl = scale_eye_shape(orig_left_eye, 95, 0.65)
            wr = scale_eye_shape(orig_right_eye, 88, 0.65)
            combined = (wl > 50) | (wr > 50)
            comb_f = cv2.GaussianBlur(combined.astype(np.float32), (3, 3), 0.5)
            for c in range(3):
                frame_crop[:, :, c] = (frame_crop[:, :, c] * (1.0 - comb_f) + 0.0 * comb_f).astype(np.uint8)
            frame_crop[combined, 3] = 255
            
        elif state == 'closed':
            pts_l = np.array([[48, 71], [94, 77], [140, 72]], np.int32)
            pts_r = np.array([[272, 70], [303, 75], [334, 71]], np.int32)
            draw_tapered_curve(frame_crop, pts_l, max_thickness=8)
            draw_tapered_curve(frame_crop, pts_r, max_thickness=8)

        full_frame = orig.copy()
        full_frame[530:660, 570:930] = frame_crop
        return full_frame

    # Generate the 4 core state frames
    print("Generating core frames...")
    frame_open = get_frame('open')
    frame_half_close = get_frame('half_close')
    frame_closed = get_frame('closed')
    frame_half_open = get_frame('half_open')

    # Convert to RGB / RGBA Pillow images
    # Timeline choreography:
    # 1. Idle open: 2200ms
    # 2. Blink 1:
    #    - half_close: 50ms
    #    - closed: 90ms
    #    - half_open: 50ms
    # 3. Pause open: 1400ms
    # 4. Double Blink:
    #    - Blink 2a:
    #      - half_close: 40ms
    #      - closed: 80ms
    #      - half_open: 50ms
    #      - open: 120ms
    #    - Blink 2b:
    #      - half_close: 40ms
    #      - closed: 80ms
    #      - half_open: 50ms
    # Total loop: ~4.2 seconds
    
    sequence_plan = [
        ('open', 2200),
        ('half_close', 50),
        ('closed', 90),
        ('half_open', 50),
        ('open', 1400),
        ('half_close', 40),
        ('closed', 80),
        ('half_open', 50),
        ('open', 120),
        ('half_close', 40),
        ('closed', 80),
        ('half_open', 50),
    ]

    state_dict_bgr = {
        'open': frame_open,
        'half_close': frame_half_close,
        'closed': frame_closed,
        'half_open': frame_half_open
    }

    # Prepare RGBA frames (for WebP and transparent GIF)
    pil_rgba_frames = []
    durations = []
    for state, dur in sequence_plan:
        bgr = state_dict_bgr[state]
        # Convert BGR to RGB
        rgba_img = cv2.cvtColor(bgr, cv2.COLOR_BGRA2RGBA)
        pil_rgba_frames.append(Image.fromarray(rgba_img))
        durations.append(dur)

    # 1. Save Animated WebP (Full 8-bit Alpha Transparency)
    webp_path = os.path.join(output_dir, 'blinking_avatar.webp')
    pil_rgba_frames[0].save(
        webp_path,
        format='WEBP',
        save_all=True,
        append_images=pil_rgba_frames[1:],
        duration=durations,
        loop=0,
        lossless=True
    )
    print(f"Saved: {webp_path}")

    # 2. Save Animated GIF with Transparency
    # For GIF with transparency: quantize each frame to palette with transparency index
    gif_trans_frames = []
    for p_img in pil_rgba_frames:
        # Create a palette image with alpha thresholding
        alpha = np.array(p_img.split()[-1])
        rgb = p_img.convert('RGB')
        # Quantize RGB to 254 colors (saving 1 slot for transparent)
        p_frame = rgb.quantize(colors=254, method=Image.Quantize.MEDIANCUT)
        p_frame_np = np.array(p_frame)
        # Transparent pixels get index 255
        p_frame_np[alpha < 128] = 255
        p_res = Image.fromarray(p_frame_np, mode='P')
        p_res.putpalette(p_frame.getpalette() + [0, 0, 0])
        p_res.info['transparency'] = 255
        gif_trans_frames.append(p_res)


    gif_trans_path = os.path.join(output_dir, 'blinking_avatar_transparent.gif')
    gif_trans_frames[0].save(
        gif_trans_path,
        format='GIF',
        save_all=True,
        append_images=gif_trans_frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        transparency=255
    )
    print(f"Saved: {gif_trans_path}")

    # Also save as blinking_avatar.gif (primary)
    primary_gif = os.path.join(output_dir, 'blinking_avatar.gif')
    gif_trans_frames[0].save(
        primary_gif,
        format='GIF',
        save_all=True,
        append_images=gif_trans_frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        transparency=255
    )
    print(f"Saved: {primary_gif}")

    # Also save into Components/
    comp_gif = os.path.join(comp_dir, '16_blinking_avatar.gif')
    gif_trans_frames[0].save(
        comp_gif,
        format='GIF',
        save_all=True,
        append_images=gif_trans_frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        transparency=255
    )
    print(f"Saved: {comp_gif}")

    # 3. Save Dark Mode & Light Mode Solid Animated GIFs (for maximum visual fidelity on dark/light apps)
    # Dark mode: #0b0f19
    dark_bg = np.array([11, 15, 25], dtype=np.float32)
    dark_frames = []
    for state, dur in sequence_plan:
        bgr = state_dict_bgr[state]
        rgb = cv2.cvtColor(bgr[:, :, :3], cv2.COLOR_BGR2RGB).astype(np.float32)
        a = (bgr[:, :, 3:4] / 255.0)
        comp = rgb * a + dark_bg * (1.0 - a)
        p_d = Image.fromarray(np.clip(comp, 0, 255).astype(np.uint8)).quantize(colors=256)
        dark_frames.append(p_d)

    dark_gif_path = os.path.join(output_dir, 'blinking_avatar_dark.gif')
    dark_frames[0].save(
        dark_gif_path,
        format='GIF',
        save_all=True,
        append_images=dark_frames[1:],
        duration=durations,
        loop=0
    )
    print(f"Saved: {dark_gif_path}")

    # Light mode: #f4f4f4
    light_bg = np.array([244, 244, 244], dtype=np.float32)
    light_frames = []
    for state, dur in sequence_plan:
        bgr = state_dict_bgr[state]
        rgb = cv2.cvtColor(bgr[:, :, :3], cv2.COLOR_BGR2RGB).astype(np.float32)
        a = (bgr[:, :, 3:4] / 255.0)
        comp = rgb * a + light_bg * (1.0 - a)
        p_l = Image.fromarray(np.clip(comp, 0, 255).astype(np.uint8)).quantize(colors=256)
        light_frames.append(p_l)

    light_gif_path = os.path.join(output_dir, 'blinking_avatar_light.gif')
    light_frames[0].save(
        light_gif_path,
        format='GIF',
        save_all=True,
        append_images=light_frames[1:],
        duration=durations,
        loop=0
    )
    print(f"Saved: {light_gif_path}")

if __name__ == '__main__':
    generate_blinking_animation()
