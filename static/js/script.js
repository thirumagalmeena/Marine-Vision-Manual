document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const browseBtn = document.getElementById('browse-btn');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const removeBtn = document.getElementById('remove-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const fileInfo = document.getElementById('file-info');
    const loading = document.getElementById('loading');
    const resultsContainer = document.getElementById('results-container');
    const detectedAnimal = document.getElementById('detected-animal');
    const confidenceLevel = document.getElementById('confidence-level');
    const animalDescription = document.getElementById('animal-description');
    const habitatInfo = document.getElementById('habitat-info');
    const conservationInfo = document.getElementById('conservation-info');
    const bestModel = document.getElementById('best-model');
    const modelsGrid = document.getElementById('models-grid');
    const speciesGrid = document.getElementById('species-grid');
    const timestamp = document.getElementById('timestamp');

    // Marine species data - UPDATED with your actual categories
    const speciesData = {
        'dolphin': {
            name: 'Dolphin',
            description: 'Dolphins are highly intelligent marine mammals known for their playful behavior, complex social structures, and remarkable communication skills. They use echolocation to navigate and hunt in dark waters.',
            habitat: 'Oceans worldwide, both coastal and deep waters',
            conservation: 'Some species are threatened by fishing nets, pollution, and habitat degradation',
            image: 'https://images.unsplash.com/photo-1545119220-8d42a6d742d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        'fish': {
            name: 'Fish',
            description: 'Fish are diverse aquatic vertebrates with gills and fins. They come in various shapes, sizes, and colors, playing crucial roles in marine ecosystems as both predators and prey.',
            habitat: 'All aquatic environments - oceans, rivers, lakes worldwide',
            conservation: 'Many species face overfishing and habitat destruction',
            image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        'lobster': {
            name: 'Lobster',
            description: 'Lobsters are marine crustaceans with hard exoskeletons and ten legs. They are bottom-dwellers known for their distinctive claws and are important commercial seafood species.',
            habitat: 'Rocky, sandy, or muddy bottoms of ocean floors',
            conservation: 'Some populations affected by overfishing and climate change',
            image: 'https://images.unsplash.com/photo-1594736797933-d0f95e0b5b12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        'octopus': {
            name: 'Octopus',
            description: 'Octopuses are highly intelligent invertebrates known for their eight arms, camouflage abilities, and problem-solving skills. They can change color and texture to blend with surroundings.',
            habitat: 'Various ocean habitats including coral reefs and sea floors',
            conservation: 'Generally stable, but affected by pollution and habitat loss',
            image: 'https://images.unsplash.com/photo-1534760486235-d6b3d5e5eb3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        'sea_horse': {
            name: 'Sea Horse',
            description: 'Sea horses are unique fish with horse-like heads, prehensile tails, and bony plates instead of scales. Males carry and give birth to young, which is rare in the animal kingdom.',
            habitat: 'Shallow tropical and temperate waters, often in seagrass beds',
            conservation: 'Many species are vulnerable due to habitat loss and traditional medicine trade',
            image: 'https://images.unsplash.com/photo-1558642245-00febc58c0a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        }
    };

    // Model performance data
    const modelPerformance = {
        'cnn': { name: 'CNN', accuracy: 85, icon: 'fas fa-brain' },
        'svm': { name: 'SVM', accuracy: 78, icon: 'fas fa-project-diagram' },
        'random_forest': { name: 'Random Forest', accuracy: 82, icon: 'fas fa-tree' },
        'knn': { name: 'KNN', accuracy: 75, icon: 'fas fa-sitemap' },
        'kmeans': { name: 'K-means', accuracy: 65, icon: 'fas fa-object-group' }
    };

    // Event Listeners
    browseBtn.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileSelect);
    removeBtn.addEventListener('click', removeImage);
    analyzeBtn.addEventListener('click', analyzeImage);

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: fileInput });
        }
    });

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPG, PNG, JPEG, GIF)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Display file info
        fileInfo.innerHTML = `
            <p><i class="fas fa-check-circle" style="color: var(--success)"></i> 
            ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</p>
        `;

        // Preview image
        const reader = new FileReader();
        reader.onload = function(event) {
            previewImg.src = event.target.result;
            imagePreview.style.display = 'block';
            analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    function removeImage() {
        fileInput.value = '';
        imagePreview.style.display = 'none';
        analyzeBtn.disabled = true;
        fileInfo.innerHTML = '<p><i class="fas fa-info-circle"></i> No file selected</p>';
        resultsContainer.style.display = 'none';
    }

    async function analyzeImage() {
        if (!fileInput.files[0]) return;

        // Show loading, hide results
        loading.style.display = 'block';
        resultsContainer.style.display = 'none';
        analyzeBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                displayResults(data);
            } else {
                throw new Error(data.error || 'Prediction failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error analyzing image: ' + error.message);
        } finally {
            loading.style.display = 'none';
            analyzeBtn.disabled = false;
        }
    }

    function displayResults(data) {
        // Update timestamp
        timestamp.textContent = `Last analysis: ${data.timestamp}`;

        // Find the best prediction
        const bestPrediction = findBestPrediction(data.predictions);
        
        // Update main detection result
        const bestSpecies = speciesData[bestPrediction.species];
        detectedAnimal.textContent = bestSpecies.name;
        confidenceLevel.textContent = `${bestPrediction.confidence}%`;
        animalDescription.textContent = bestSpecies.description;
        habitatInfo.textContent = bestSpecies.habitat;
        conservationInfo.textContent = bestSpecies.conservation;
        bestModel.textContent = bestPrediction.model.toUpperCase();

        // Update confidence level color
        updateConfidenceColor(confidenceLevel, bestPrediction.confidence);

        // Display model comparisons
        displayModelComparisons(data.predictions, bestPrediction.model);

        // Display all species analysis
        displaySpeciesAnalysis(data.predictions, bestPrediction.species);

        // Show results container
        resultsContainer.style.display = 'block';
    }

    function findBestPrediction(predictions) {
        let best = { confidence: 0 };
        
        Object.entries(predictions).forEach(([model, prediction]) => {
            if (prediction.confidence > best.confidence) {
                best = {
                    model: model,
                    species: prediction.species,
                    confidence: prediction.confidence
                };
            }
        });
        
        return best;
    }

    function updateConfidenceColor(element, confidence) {
        element.className = 'confidence';
        if (confidence >= 80) {
            element.classList.add('prediction-high');
        } else if (confidence >= 60) {
            element.classList.add('prediction-medium');
        } else {
            element.classList.add('prediction-low');
        }
    }

    function displayModelComparisons(predictions, bestModelName) {
        modelsGrid.innerHTML = '';
        
        Object.entries(predictions).forEach(([modelKey, prediction]) => {
            const model = modelPerformance[modelKey];
            const card = document.createElement('div');
            card.className = `model-card ${modelKey === bestModelName ? 'best-model' : ''}`;
            
            card.innerHTML = `
                <div class="model-icon">
                    <i class="${model.icon}"></i>
                </div>
                <div class="model-name">${model.name}</div>
                <div class="model-accuracy ${getConfidenceClass(prediction.confidence)}">
                    ${prediction.confidence}%
                </div>
                <div class="model-confidence">Confidence</div>
                <div class="model-accuracy" style="font-size: 0.9rem; color: var(--light);">
                    Accuracy: ${model.accuracy}%
                </div>
            `;
            
            modelsGrid.appendChild(card);
        });
    }

    function displaySpeciesAnalysis(predictions, detectedSpecies) {
        speciesGrid.innerHTML = '';
        
        // Get all unique species from predictions
        const allSpecies = new Set();
        Object.values(predictions).forEach(prediction => {
            allSpecies.add(prediction.species);
        });

        // Calculate average confidence for each species
        const speciesConfidence = {};
        allSpecies.forEach(species => {
            const confidences = Object.values(predictions)
                .filter(p => p.species === species)
                .map(p => p.confidence);
            speciesConfidence[species] = confidences.reduce((a, b) => a + b, 0) / confidences.length;
        });

        // Create species cards
        Object.entries(speciesConfidence).forEach(([species, avgConfidence]) => {
            const speciesInfo = speciesData[species];
            const card = document.createElement('div');
            card.className = `species-card ${species === detectedSpecies ? 'high-confidence' : ''}`;
            
            card.innerHTML = `
                <img src="${speciesInfo.image}" alt="${speciesInfo.name}" onerror="this.src='https://via.placeholder.com/60?text=🐠'">
                <h4>${speciesInfo.name}</h4>
                <div class="species-confidence ${getConfidenceClass(avgConfidence)}">
                    ${avgConfidence.toFixed(1)}%
                </div>
            `;
            
            speciesGrid.appendChild(card);
        });
    }

    function getConfidenceClass(confidence) {
        if (confidence >= 80) return 'prediction-high';
        if (confidence >= 60) return 'prediction-medium';
        return 'prediction-low';
    }

    // Initialize with placeholder data for model cards
    function initializeModelCards() {
        modelsGrid.innerHTML = '';
        Object.entries(modelPerformance).forEach(([key, model]) => {
            const card = document.createElement('div');
            card.className = 'model-card';
            card.innerHTML = `
                <div class="model-icon">
                    <i class="${model.icon}"></i>
                </div>
                <div class="model-name">${model.name}</div>
                <div class="model-accuracy" style="color: var(--light);">
                    ${model.accuracy}%
                </div>
                <div class="model-confidence">Accuracy</div>
            `;
            modelsGrid.appendChild(card);
        });
    }

    // Initialize the page
    initializeModelCards();
});