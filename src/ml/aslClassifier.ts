import * as tf from '@tensorflow/tfjs';
import { getTrainingData, getLabels } from '@/data/aslTrainingData';

export class ASLClassifier {
  private model: tf.LayersModel | null = null;
  private labels: string[] = [];
  private isInitialized = false;

  constructor() {
    this.labels = getLabels();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing ASL ML model...');
    
    // Create neural network model
    this.model = tf.sequential({
      layers: [
        // Input layer - 63 features (21 landmarks × 3 coords) + additional features
        tf.layers.dense({ inputShape: [68], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        
        // Hidden layers
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.1 }),
        
        // Output layer - number of classes
        tf.layers.dense({ units: this.labels.length, activation: 'softmax' })
      ]
    });

    // Compile model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    // Train the model
    await this.trainModel();
    
    this.isInitialized = true;
    console.log('ASL ML model initialized successfully!');
  }

  private async trainModel(): Promise<void> {
    const { features, labels } = getTrainingData();
    
    // Convert to tensors
    const featuresTensor = tf.tensor2d(features);
    const labelsTensor = tf.oneHot(tf.tensor1d(labels.map(l => this.labels.indexOf(l))), this.labels.length);
    
    console.log(`Training on ${features.length} samples...`);
    
    // Train the model
    const history = await this.model.fit(featuresTensor, labelsTensor, {
      epochs: 50,
      batchSize: 8,
      validationSplit: 0.2,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}, accuracy = ${logs?.acc?.toFixed(4)}`);
          }
        }
      }
    });

    console.log('Training completed!');
    
    // Clean up tensors
    featuresTensor.dispose();
    labelsTensor.dispose();
  }

  async predict(landmarks: number[][]): Promise<{ label: string; confidence: number }> {
    if (!this.isInitialized || !this.model) {
      throw new Error('Model not initialized');
    }

    // Extract features from landmarks
    const features = this.extractFeatures(landmarks);
    const featuresTensor = tf.tensor2d([features]);
    
    // Make prediction
    const prediction = this.model.predict(featuresTensor) as tf.Tensor;
    const probabilities = await prediction.data();
    
    // Find the label with highest probability
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));
    const confidence = probabilities[maxIndex];
    const label = this.labels[maxIndex];
    
    // Clean up
    featuresTensor.dispose();
    prediction.dispose();
    
    return { label, confidence };
  }

  private extractFeatures(landmarks: number[][]): number[] {
    const features: number[] = [];
    
    // Flatten landmarks (21 × 3 = 63 features)
    landmarks.forEach(landmark => {
      features.push(...landmark);
    });
    
    // Add relative distances between key points
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    
    // Distances from wrist to fingertips
    features.push(
      Math.sqrt(Math.pow(thumbTip[0] - wrist[0], 2) + Math.pow(thumbTip[1] - wrist[1], 2)),
      Math.sqrt(Math.pow(indexTip[0] - wrist[0], 2) + Math.pow(indexTip[1] - wrist[1], 2)),
      Math.sqrt(Math.pow(middleTip[0] - wrist[0], 2) + Math.pow(middleTip[1] - wrist[1], 2)),
      Math.sqrt(Math.pow(ringTip[0] - wrist[0], 2) + Math.pow(ringTip[1] - wrist[1], 2)),
      Math.sqrt(Math.pow(pinkyTip[0] - wrist[0], 2) + Math.pow(pinkyTip[1] - wrist[1], 2))
    );
    
    return features;
  }

  // Simple rule-based classifier as fallback
  classifyByRules(landmarks: number[][]): { label: string; confidence: number } {
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // Calculate finger extensions
    const fingerExtensions = [
      Math.sqrt(Math.pow(thumbTip[1] - wrist[1], 2)),
      Math.sqrt(Math.pow(indexTip[1] - wrist[1], 2)),
      Math.sqrt(Math.pow(middleTip[1] - wrist[1], 2)),
      Math.sqrt(Math.pow(ringTip[1] - wrist[1], 2)),
      Math.sqrt(Math.pow(pinkyTip[1] - wrist[1], 2))
    ];

    // Rule-based classification
    if (wrist[1] < 0.3) { // Hand is high (HELLO gesture)
      return { label: 'HELLO', confidence: 0.8 };
    }
    
    if (wrist[1] > 0.6) { // Hand is at chest level (THANK gesture)
      return { label: 'THANK', confidence: 0.8 };
    }
    
    if (wrist[0] < 0.4) { // Hand is crossed (LOVE gesture)
      return { label: 'LOVE', confidence: 0.7 };
    }

    // Classify letters based on finger positions
    const extendedFingers = fingerExtensions.filter(ext => ext > 0.15).length;
    
    if (extendedFingers === 0) {
      return { label: 'A', confidence: 0.7 }; // Fist
    } else if (extendedFingers === 5) {
      return { label: 'B', confidence: 0.7 }; // Flat hand
    } else if (extendedFingers === 1 && fingerExtensions[1] > 0.15) {
      return { label: 'D', confidence: 0.6 }; // Pointing index
    } else if (extendedFingers === 2 && fingerExtensions[1] > 0.15 && fingerExtensions[2] > 0.15) {
      return { label: 'V', confidence: 0.6 }; // Peace sign
    } else if (extendedFingers === 3 && fingerExtensions[1] > 0.15 && fingerExtensions[2] > 0.15 && fingerExtensions[3] > 0.15) {
      return { label: 'W', confidence: 0.6 }; // Three fingers
    } else if (extendedFingers === 1 && fingerExtensions[4] > 0.15) {
      return { label: 'I', confidence: 0.6 }; // Pinky up
    }

    return { label: 'UNKNOWN', confidence: 0.1 };
  }

  async classify(landmarks: number[][]): Promise<{ label: string; confidence: number }> {
    try {
      // Try ML model first
      if (this.isInitialized && this.model) {
        return await this.predict(landmarks);
      }
    } catch (error) {
      console.warn('ML prediction failed, using rules:', error);
    }
    
    // Fallback to rule-based classification
    return this.classifyByRules(landmarks);
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isInitialized = false;
  }
}

// Singleton instance
export const aslClassifier = new ASLClassifier();
