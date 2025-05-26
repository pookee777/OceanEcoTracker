class EnvironmentalDashboard {
    constructor() {
        this.charts = {};
        this.model = null;
        this.webcam = null;
        this.isDetecting = false;
        this.timeLabels = [];
        this.maxDataPoints = 20;
        
        // Data arrays for charts
        this.phData = [];
        this.turbidityData = [];
        this.co2Data = [];
        this.captureData = [];
        this.plasticData = [];
        this.fuelData = [];
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.initializeCharts();
        await this.loadModel();
        this.updateInitialValues();
    }

    setupEventListeners() {
        // Water Quality Controls
        this.setupInputSync('ph-input', 'ph-slider', 'ph-display', this.updateWaterQuality.bind(this));
        this.setupInputSync('turbidity-input', 'turbidity-slider', 'turbidity-display', this.updateWaterQuality.bind(this));
        
        // CO2 Controls
        this.setupInputSync('co2-input', 'co2-slider', 'co2-display', this.updateCO2Data.bind(this));
        
        // Plastic Controls
        this.setupInputSync('plastic-input', 'plastic-slider', 'plastic-display', this.updatePlasticData.bind(this));
        
        // Detection Controls
        document.getElementById('start-detection').addEventListener('click', this.startDetection.bind(this));
        document.getElementById('stop-detection').addEventListener('click', this.stopDetection.bind(this));
    }

    setupInputSync(inputId, sliderId, displayId, callback) {
        const input = document.getElementById(inputId);
        const slider = document.getElementById(sliderId);
        const display = document.getElementById(displayId);

        const updateValue = (value) => {
            input.value = value;
            slider.value = value;
            display.textContent = value;
            if (callback) callback();
        };

        input.addEventListener('input', (e) => updateValue(e.target.value));
        slider.addEventListener('input', (e) => updateValue(e.target.value));
    }

    initializeCharts() {
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true
                }
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        };

        // Water Quality Chart
        this.charts.waterQuality = new Chart(document.getElementById('waterQualityChart'), {
            type: 'line',
            data: {
                labels: this.timeLabels,
                datasets: [
                    {
                        label: 'pH Level',
                        data: this.phData,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Turbidity (NTU)',
                        data: this.turbidityData,
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: {
                        ...chartOptions.scales.y,
                        title: {
                            display: true,
                            text: 'pH Level'
                        },
                        max: 14
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Turbidity (NTU)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });

        // CO2 Chart
        this.charts.co2 = new Chart(document.getElementById('co2Chart'), {
            type: 'line',
            data: {
                labels: this.timeLabels,
                datasets: [
                    {
                        label: 'CO₂ Concentration (ppm)',
                        data: this.co2Data,
                        borderColor: '#FF9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Algae Capture (g)',
                        data: this.captureData,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: {
                        ...chartOptions.scales.y,
                        title: {
                            display: true,
                            text: 'CO₂ (ppm)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Capture (g)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });

        // Fuel Chart
        this.charts.fuel = new Chart(document.getElementById('fuelChart'), {
            type: 'line',
            data: {
                labels: this.timeLabels,
                datasets: [
                    {
                        label: 'Plastic Collected (g)',
                        data: this.plasticData,
                        borderColor: '#9C27B0',
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Fuel Generated (mL)',
                        data: this.fuelData,
                        borderColor: '#F44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: {
                        ...chartOptions.scales.y,
                        title: {
                            display: true,
                            text: 'Plastic (g)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Fuel (mL)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    updateInitialValues() {
        this.updateWaterQuality();
        this.updateCO2Data();
        this.updatePlasticData();
    }

    updateWaterQuality() {
        const ph = parseFloat(document.getElementById('ph-input').value);
        const turbidity = parseFloat(document.getElementById('turbidity-input').value);
        
        this.addDataPoint(ph, turbidity, 'water');
        this.updateChart('waterQuality', [this.phData, this.turbidityData]);
    }

    updateCO2Data() {
        const co2 = parseFloat(document.getElementById('co2-input').value);
        const capture = (co2 / 1000) * 80; // Formula: (CO₂ / 1000) × 80g
        
        document.getElementById('co2-capture').textContent = capture.toFixed(1);
        
        this.addDataPoint(co2, capture, 'co2');
        this.updateChart('co2', [this.co2Data, this.captureData]);
    }

    updatePlasticData() {
        const plastic = parseFloat(document.getElementById('plastic-input').value);
        const fuel = plastic * 0.8; // Formula: plastic × 0.8 mL/g
        
        document.getElementById('fuel-generated').textContent = fuel.toFixed(1);
        
        this.addDataPoint(plastic, fuel, 'plastic');
        this.updateChart('fuel', [this.plasticData, this.fuelData]);
    }

    addDataPoint(value1, value2, type) {
        const now = new Date().toLocaleTimeString();
        
        // Update time labels
        this.timeLabels.push(now);
        if (this.timeLabels.length > this.maxDataPoints) {
            this.timeLabels.shift();
        }

        // Update data arrays based on type
        switch (type) {
            case 'water':
                this.phData.push(value1);
                this.turbidityData.push(value2);
                if (this.phData.length > this.maxDataPoints) {
                    this.phData.shift();
                    this.turbidityData.shift();
                }
                break;
            case 'co2':
                this.co2Data.push(value1);
                this.captureData.push(value2);
                if (this.co2Data.length > this.maxDataPoints) {
                    this.co2Data.shift();
                    this.captureData.shift();
                }
                break;
            case 'plastic':
                this.plasticData.push(value1);
                this.fuelData.push(value2);
                if (this.plasticData.length > this.maxDataPoints) {
                    this.plasticData.shift();
                    this.fuelData.shift();
                }
                break;
        }
    }

    updateChart(chartName, datasets) {
        if (this.charts[chartName]) {
            this.charts[chartName].data.labels = [...this.timeLabels];
            datasets.forEach((data, index) => {
                this.charts[chartName].data.datasets[index].data = [...data];
            });
            this.charts[chartName].update('none'); // Use 'none' for immediate update without animation
        }
    }

    async loadModel() {
        const modelStatus = document.getElementById('model-status');
        
        try {
            modelStatus.textContent = 'Loading AI model...';
            modelStatus.className = 'model-status loading';
            
            // Load the model from the local files
            const modelURL = './model/model.json';
            const metadataURL = './model/metadata.json';
            
            this.model = await tmImage.load(modelURL, metadataURL);
            
            modelStatus.textContent = 'AI model ready for plastic detection';
            modelStatus.className = 'model-status ready';
            
        } catch (error) {
            console.error('Error loading model:', error);
            modelStatus.textContent = 'Error loading AI model. Please check model files.';
            modelStatus.className = 'model-status error';
        }
    }

    async startDetection() {
        if (!this.model) {
            alert('AI model not loaded yet. Please wait for model to load.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 224, height: 224 } 
            });
            
            const video = document.getElementById('webcam');
            video.srcObject = stream;
            
            this.isDetecting = true;
            document.getElementById('start-detection').style.display = 'none';
            document.getElementById('stop-detection').style.display = 'inline-flex';
            document.getElementById('detection-status').textContent = 'Detecting...';
            
            this.detectLoop();
            
        } catch (error) {
            console.error('Error accessing webcam:', error);
            alert('Error accessing webcam. Please ensure camera permissions are granted.');
        }
    }

    stopDetection() {
        this.isDetecting = false;
        
        const video = document.getElementById('webcam');
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        
        document.getElementById('start-detection').style.display = 'inline-flex';
        document.getElementById('stop-detection').style.display = 'none';
        document.getElementById('detection-status').textContent = 'Stopped';
        document.getElementById('confidence-score').textContent = '0%';
    }

    async detectLoop() {
        if (!this.isDetecting || !this.model) return;
        
        const video = document.getElementById('webcam');
        
        if (video.readyState === 4) {
            try {
                const predictions = await this.model.predict(video);
                
                // Find the plastic prediction
                const plasticPrediction = predictions.find(p => p.className === 'Plastic');
                
                if (plasticPrediction) {
                    const confidence = Math.round(plasticPrediction.probability * 100);
                    document.getElementById('confidence-score').textContent = `${confidence}%`;
                    
                    if (confidence > 70) {
                        document.getElementById('detection-status').textContent = 'Plastic Detected!';
                        
                        // Auto-increment plastic if enabled
                        if (document.getElementById('auto-increment').checked) {
                            const currentPlastic = parseFloat(document.getElementById('plastic-input').value);
                            const newPlastic = currentPlastic + 1;
                            
                            document.getElementById('plastic-input').value = newPlastic;
                            document.getElementById('plastic-slider').value = newPlastic;
                            document.getElementById('plastic-display').textContent = newPlastic;
                            
                            this.updatePlasticData();
                        }
                    } else {
                        document.getElementById('detection-status').textContent = 'No Plastic Detected';
                    }
                }
                
            } catch (error) {
                console.error('Error during prediction:', error);
            }
        }
        
        // Continue detection loop
        setTimeout(() => this.detectLoop(), 1000); // Check every second
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EnvironmentalDashboard();
});

// Handle page visibility change to pause/resume detection
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.dashboard && window.dashboard.isDetecting) {
        // Optionally pause detection when tab is not visible
        console.log('Page hidden, detection continues...');
    }
});
