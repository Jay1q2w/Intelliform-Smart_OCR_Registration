from flask import Flask, request, jsonify
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import torch

# Flask app
app = Flask(__name__)

processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-printed')
model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-printed')

# Set device to GPU if available, otherwise CPU
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

@app.route('/ocr', methods=['POST'])
def ocr_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        image = Image.open(file.stream).convert("RGB")

        pixel_values = processor(images=image, return_tensors="pt").pixel_values.to(device)
        generated_ids = model.generate(pixel_values)
        
        extracted_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        
        print(f"Extracted Text: {extracted_text}")
        
        return jsonify({'text': extracted_text})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)