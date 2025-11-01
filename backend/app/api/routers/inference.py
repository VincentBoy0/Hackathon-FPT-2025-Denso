from unittest import result
from fastapi import APIRouter, Depends, Response, status
from sqlmodel import Session
from app.database import get_session
from app.models import Label
from sqlalchemy import select, func
# 1. Import the library
from inference_sdk import InferenceHTTPClient
import base64
from PIL import Image, ImageDraw, ImageFont
import io


client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com", # Local server address
    api_key="EXUUb5BeYLFScx4vn44F"
)

# # 3. Run your workflow on an image
# result = client.run_workflow(
#     workspace_name="fpt-hackathon",
#     workflow_id="custom-workflow",
#     images={
#         "image": "./static/images/IMG_20230106_151007_jpg.rf.c7353c78aa78a354c046bec468052f0c.jpg" # Path to your image file
#     },
#     use_cache=True # Speeds up repeated requests
# )

# # 4. Get your results
# print(result)


# http://localhost:8000/ai_inference
router = APIRouter(prefix="/inference", tags=["inference"])

@router.get("/")
def get_all_labels(db: Session = Depends(get_session)):
    labels = db.exec(select(Label)).scalars().all()
    return labels
def draw_bounding_boxes(image_path, predictions):
    # Open the original image
    image = Image.open(image_path)
    draw = ImageDraw.Draw(image)

    for pred in predictions:
        x = pred['x']
        y = pred['y']
        width = pred['width']
        height = pred['height']

        
        # Calculate the coordinates of the bounding box
        left = x - width / 2
        top = y - height / 2
        right = x + width / 2
        bottom = y + height / 2
        box_side = max(width, height)
        font_size = max(18, int(box_side * 0.3))
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except OSError:
            font = ImageFont.load_default()
        
        # Draw the bounding box
        draw.rectangle([left, top, right, bottom], outline="red", width=3)
        #present the label and confidence
        label = pred['class']
        confidence = pred['confidence'] * 100
        print(label, confidence)
        draw.text((left, top - 35), f"{label} {confidence:.2f}", fill="red", font=font)

    return image
# Extract predictions from the result
@router.post("/")
def add_label(img_path: str):
    result = client.run_workflow(
    workspace_name="fpt-hackathon",
    workflow_id="custom-workflow",
    images={
        "image": img_path # Path to your image file
    },
    use_cache=True # Speeds up repeated requests
    )
    predictions = result[0]['predictions']['predictions']
    output_image = draw_bounding_boxes(img_path, predictions)
    # output_image.show()  # To display the image
    output_image.save("../frontend/public/output_with_boxes.jpg")  # To save the image
    return result
@router.post("/viz")
def viz(b64: str):
    img = base64.b64decode(b64)
    return Response(content=img, media_type="image/jpeg")