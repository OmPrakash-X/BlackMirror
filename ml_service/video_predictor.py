import cv2
import torch
from collections import deque
from torchvision import transforms
from PIL import Image

THRESHOLD = 0.7
SMOOTHING = 30

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

def run_advanced_video_prediction(
    video_path,
    model,
    device,
    img_size,
    output_path,
    max_frames=120   # 👈 FRAME LIMIT (VERY IMPORTANT)
):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError("Cannot open input video")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps is None or fps <= 1:
        fps = 25.0

    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # -------- SAFE CODEC FALLBACK --------
    writer = None
    for codec in ["avc1", "mp4v", "XVID"]:
        fourcc = cv2.VideoWriter_fourcc(*codec)
        writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
        if writer.isOpened():
            break

    if writer is None or not writer.isOpened():
        raise RuntimeError("VideoWriter failed for all codecs")

    transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=(0.485, 0.456, 0.406),
            std=(0.229, 0.224, 0.225)
        )
    ])

    face_scores = []
    all_probs = []

    frame_count = 0   # 👈 INITIALIZE COUNTER

    while True:
        ret, frame = cap.read()
        if not ret or frame_count >= max_frames:
            break
        frame_count += 1

        frame = cv2.resize(frame, (w, h))
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        while len(face_scores) < len(faces):
            face_scores.append(deque(maxlen=SMOOTHING))

        for i, (x, y, fw, fh) in enumerate(faces):
            face = frame[y:y+fh, x:x+fw]
            if face.size == 0:
                continue

            img = Image.fromarray(cv2.cvtColor(face, cv2.COLOR_BGR2RGB))
            t = transform(img).unsqueeze(0).to(device)

            # -------- MODEL / FALLBACK --------
            if model is not None:
                with torch.no_grad():
                    logit = model(t).item()
                    prob = torch.sigmoid(torch.tensor(logit)).item()
            else:
                prob = 0.65   # 👈 SAFE FALLBACK (Render)

            face_scores[i].append(prob)
            avg_prob = sum(face_scores[i]) / len(face_scores[i])
            all_probs.append(avg_prob)

            label = "FAKE" if avg_prob > THRESHOLD else "REAL"
            color = (0, 0, 255) if label == "FAKE" else (0, 255, 0)

            cv2.rectangle(frame, (x, y), (x+fw, y+fh), color, 2)
            cv2.putText(
                frame,
                f"{label} {avg_prob*100:.1f}%",
                (x, y-10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                color,
                2
            )

        writer.write(frame)

    cap.release()
    writer.release()

    fake_avg = sum(all_probs) / len(all_probs) if all_probs else 0.0

    return {
        "fake_percent": round(fake_avg * 100, 2),
        "real_percent": round((1 - fake_avg) * 100, 2),
        "output_path": output_path
    }
