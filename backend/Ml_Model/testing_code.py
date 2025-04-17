import cv2
from ultralytics import YOLO

# Load the model
model = YOLO("firesmoke_06-jan-25_best.pt")  # Updated model file path

# Load the video
video_path = "WhatsApp Video 2025-04-08 at 17.56.00_56748a7e.mp4"  # Updated video file path
cap = cv2.VideoCapture(video_path)

# Check if the video was loaded successfully
if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

# Define class-wise confidence thresholds
CONF_THRESHOLDS = {"fire": 0.5, "smoke": 0.1}

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Perform inference on the frame
    results = model.predict(source=frame, save=False)  

    for result in results:
        filtered_boxes = []
        for box in result.boxes:
            class_id = int(box.cls[0].item())  # Get class ID
            conf = box.conf[0].item()  # Get confidence score

            # Define class names (adjust according to your model's class order)
            class_names = model.names
            class_label = class_names[class_id]

            # Apply different confidence thresholds
            if class_label in CONF_THRESHOLDS and conf >= CONF_THRESHOLDS[class_label]:
                filtered_boxes.append(box)

        # Update result with filtered boxes
        result.boxes = filtered_boxes

    # Annotate the frame
    annotated_frame = results[0].plot()

    # Display the annotated frame
    cv2.imshow("Detection Results", annotated_frame)

    # Exit on pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()
