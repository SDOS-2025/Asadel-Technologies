import cv2
from ultralytics import YOLO
import yt_dlp

def is_youtube_url(url):
    return "youtube.com" in url or "youtu.be" in url

def get_youtube_stream_url(youtube_url):
    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "format": "best[ext=mp4]/best",
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=False)
        return info["url"]

# Input: local video path or YouTube URL
video_input ="1.mp4"  # Replace as needed

# Use streaming URL for YouTube
if is_youtube_url(video_input):
    print("Getting streamable YouTube URL...")
    video_path = get_youtube_stream_url(video_input)
    print(f"Streaming from: {video_path}")
else:
    video_path = video_input

# Load model
model = YOLO("best.pt")  # Replace with your model path

# Open video
cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

# Configs
CONF_THRESHOLDS = {"fire": 0.2, "smoke": 0.2}
frame_skip = 4
frame_count = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1
    if frame_count % frame_skip != 0:
        continue

    results = model.predict(source=frame, save=False)

    for result in results:
        filtered_boxes = []
        for box in result.boxes:
            class_id = int(box.cls[0].item())
            conf = box.conf[0].item()
            class_label = model.names[class_id]

            if class_label in CONF_THRESHOLDS and conf >= CONF_THRESHOLDS[class_label]:
                filtered_boxes.append(box)

        result.boxes = filtered_boxes

    annotated_frame = results[0].plot()
    cv2.imshow("Detection Results", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
