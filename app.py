from flask import Flask, render_template, request, jsonify
import os
import base64
from datetime import datetime
import random

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Your actual marine animal classes
CLASS_NAMES = ['dolphin', 'fish', 'lobster', 'octopus', 'sea_horse']

class DummyPredictor:
    def __init__(self):
        self.model_performance = {
            'cnn': {'accuracy': 85, 'name': 'CNN', 'icon': 'fas fa-brain'},
            'svm': {'accuracy': 78, 'name': 'SVM', 'icon': 'fas fa-project-diagram'},
            'random_forest': {'accuracy': 82, 'name': 'Random Forest', 'icon': 'fas fa-tree'},
            'knn': {'accuracy': 75, 'name': 'KNN', 'icon': 'fas fa-sitemap'},
            'kmeans': {'accuracy': 65, 'name': 'K-means', 'icon': 'fas fa-object-group'}
        }
    
    def predict_all_models(self, image_data):
        # Convert image to base64 for display
        img_str = base64.b64encode(image_data).decode()
        
        # Generate realistic predictions for all models
        predictions = {}
        best_confidence = 0
        best_model = 'cnn'
        best_species = 'dolphin'
        
        for model in ['cnn', 'svm', 'random_forest', 'knn', 'kmeans']:
            # Create realistic confidence scores based on model performance
            base_confidence = self.model_performance[model]['accuracy']
            confidence = random.uniform(base_confidence - 10, base_confidence + 5)
            confidence = max(30, min(95, confidence))  # Keep between 30-95%
            
            # Randomly select a species (in real app, this would be actual prediction)
            species = random.choice(CLASS_NAMES)
            
            # Store prediction
            predictions[model] = {
                'species': species,
                'confidence': round(confidence, 2),
                'model_name': self.model_performance[model]['name']
            }
            
            # Track best prediction
            if confidence > best_confidence:
                best_confidence = confidence
                best_model = model
                best_species = species
        
        return {
            'success': True,
            'image': f"data:image/jpeg;base64,{img_str}",
            'predictions': predictions,
            'best_model': best_model,
            'best_species': best_species,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

# Initialize predictor
predictor = DummyPredictor()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        if file and file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            # Get predictions
            image_data = file.read()
            results = predictor.predict_all_models(image_data)
            return jsonify(results)
        
        return jsonify({'error': 'Invalid file type. Please upload an image.'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)