import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

export interface ASLDetection {
  label: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ModelConfig {
  modelType: 'mobilenet' | 'yolov8' | 'resnet50' | 'efficientnet' | 'inception' | 'vgg16' | 'densenet';
  inputSize: number;
  confidenceThreshold: number;
}

class ASLModelService {
  private model: tf.LayersModel | tf.GraphModel | null = null;
  private mobilenetModel: mobilenet.MobileNet | null = null;
  private isLoaded = false;
  private currentConfig: ModelConfig = {
    modelType: 'mobilenet',
    inputSize: 224,
    confidenceThreshold: 0.7
  };

  // ASL sign labels (common signs)
  private readonly ASL_LABELS = [
    'hello', 'help', 'yes', 'no', 'thank', 'please', 'sorry', 'love',
    'nice', 'meet', 'how', 'you', 'emergency', 'deaf', 'assistance',
    'me', 'go', 'class', 'name', 'need', 'good', 'morning', 'night',
    'your', 'school', 'work', 'water', 'food', 'home', 'car', 'book',
    'friend', 'family', 'mother', 'father', 'sister', 'brother',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
  ];

  async loadModel(config?: Partial<ModelConfig>): Promise<void> {
    if (config) {
      this.currentConfig = { ...this.currentConfig, ...config };
    }

    try {
      switch (this.currentConfig.modelType) {
        case 'mobilenet':
          await this.loadMobileNet();
          break;
        case 'resnet50':
          await this.loadResNet50();
          break;
        case 'efficientnet':
          await this.loadEfficientNet();
          break;
        case 'inception':
          await this.loadInceptionV3();
          break;
        case 'vgg16':
          await this.loadVGG16();
          break;
        case 'densenet':
          await this.loadDenseNet121();
          break;
        case 'yolov8':
        default:
          await this.loadYOLOv8();
          break;
      }
      this.isLoaded = true;
      console.log(`✅ ${this.currentConfig.modelType} model loaded successfully`);
    } catch (error) {
      console.error(`❌ Failed to load ${this.currentConfig.modelType} model:`, error);
      throw error;
    }
  }

  private async loadMobileNet(): Promise<void> {
    console.log('Loading MobileNetV2 model...');
    this.mobilenetModel = await mobilenet.load({
      version: 2,
      alpha: 1.0,
    });
  }

  private async loadYOLOv8(): Promise<void> {
    console.log('Loading YOLOv8 model...');
    // Note: YOLOv8 would need to be converted to TensorFlow.js format
    // For now, we'll use a placeholder implementation
    this.model = await tf.loadLayersModel('/models/yolov8-asl/model.json');
  }

  private async loadResNet50(): Promise<void> {
    console.log('Loading ResNet50 model...');
    this.model = await tf.loadLayersModel('/models/resnet50-asl/model.json');
  }

  private async loadEfficientNet(): Promise<void> {
    console.log('Loading EfficientNetB0 model...');
    this.model = await tf.loadLayersModel('/models/efficientnet-asl/model.json');
  }

  private async loadInceptionV3(): Promise<void> {
    console.log('Loading InceptionV3 model...');
    this.model = await tf.loadLayersModel('/models/inception-asl/model.json');
  }

  private async loadVGG16(): Promise<void> {
    console.log('Loading VGG16 model...');
    this.model = await tf.loadLayersModel('/models/vgg16-asl/model.json');
  }

  private async loadDenseNet121(): Promise<void> {
    console.log('Loading DenseNet121 model...');
    this.model = await tf.loadLayersModel('/models/densenet-asl/model.json');
  }

  async predictASLSign(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<ASLDetection[]> {
    if (!this.isLoaded) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      let predictions: ASLDetection[] = [];

      if (this.currentConfig.modelType === 'mobilenet' && this.mobilenetModel) {
        predictions = await this.predictWithMobileNet(imageElement);
      } else if (this.model) {
        predictions = await this.predictWithCustomModel(imageElement);
      }

      // Filter by confidence threshold and map to ASL labels
      return predictions
        .filter(pred => pred.confidence >= this.currentConfig.confidenceThreshold)
        .map(pred => ({
          ...pred,
          label: this.mapToASLLabel(pred.label)
        }))
        .filter(pred => pred.label !== 'unknown');
    } catch (error) {
      console.error('Prediction failed:', error);
      throw error;
    }
  }

  private async predictWithMobileNet(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<ASLDetection[]> {
    if (!this.mobilenetModel) {
      throw new Error('MobileNet model not loaded');
    }

    const predictions = await this.mobilenetModel.classify(imageElement);
    
    return predictions.map(pred => ({
      label: pred.className,
      confidence: pred.probability,
      boundingBox: undefined // MobileNet doesn't provide bounding boxes
    }));
  }

  private async predictWithCustomModel(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<ASLDetection[]> {
    if (!this.model) {
      throw new Error('Custom model not loaded');
    }

    // Preprocess the image
    const preprocessed = tf.browser.fromPixels(imageElement)
      .resizeBilinear([this.currentConfig.inputSize, this.currentConfig.inputSize])
      .div(255.0)
      .expandDims(0);

    // Make prediction
    const predictions = await this.model.predict(preprocessed) as tf.Tensor;
    const data = await predictions.data();

    // Convert to ASLDetection format
    const results: ASLDetection[] = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i] > this.currentConfig.confidenceThreshold) {
        results.push({
          label: this.ASL_LABELS[i] || `sign_${i}`,
          confidence: data[i]
        });
      }
    }

    // Clean up tensors
    preprocessed.dispose();
    predictions.dispose();

    return results;
  }

  private mapToASLLabel(originalLabel: string): string {
    // Map ImageNet labels to ASL signs
    const labelMap: { [key: string]: string } = {
      'stop sign': 'stop',
      'hand': 'help',
      'person': 'you',
      'book': 'book',
      'car': 'car',
      'house': 'home',
      'food': 'food',
      'water': 'water'
    };

    // Check if it's already an ASL label
    if (this.ASL_LABELS.includes(originalLabel.toLowerCase())) {
      return originalLabel.toLowerCase();
    }

    // Try to map known labels
    return labelMap[originalLabel.toLowerCase()] || 'unknown';
  }

  async trainModel(
    trainingData: number[][][][],
    labels: number[][],
  ): Promise<tf.History> {
    if (!this.model || !(this.model instanceof tf.LayersModel)) {
      throw new Error('Model not loaded for training or is not a LayersModel');
    }

    // Convert training data to tensors
    const xs = tf.tensor4d(trainingData);
    const ys = tf.tensor2d(labels);

    // Compile model for training
    this.model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    // Train the model
    const history = await this.model.fit(xs, ys, {
      epochs: 10,
      batchSize: 32,
      validationSplit: 0.2
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();

    return history;
  }

  async saveModel(name: string): Promise<void> {
    if (!this.model) {
      throw new Error('No model to save');
    }

    await this.model.save(`localstorage://${name}`);
    console.log(`Model saved as ${name}`);
  }

  async loadSavedModel(name: string): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(`localstorage://${name}`);
      this.isLoaded = true;
      console.log(`Loaded saved model: ${name}`);
    } catch (error) {
      console.error('Failed to load saved model:', error);
      throw error;
    }
  }

  getModelInfo(): { isLoaded: boolean; config: ModelConfig; availableLabels: string[] } {
    return {
      isLoaded: this.isLoaded,
      config: this.currentConfig,
      availableLabels: this.ASL_LABELS
    };
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.mobilenetModel = null;
    this.isLoaded = false;
  }
}

export const aslModelService = new ASLModelService();
