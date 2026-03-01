// Simple hand gesture classifier for ASL recognition
import ASL_SIGNS from '@/data/realAslSigns';

export interface GestureResult {
  gesture: string;
  confidence: number;
  description: string;
}

export class SimpleHandClassifier {
  private isInitialized = false;

  async initialize(): Promise<void> {
    console.log('🤚 Initializing Simple Hand Classifier...');

    // Simple rule-based classifier - always works
    this.isInitialized = true;
    console.log('✅ Simple Hand Classifier ready!');
  }

  // Classify hand landmarks to ASL gesture
  classifyHand(landmarks: number[][]): GestureResult {
    if (!this.isInitialized) {
      throw new Error('Classifier not initialized');
    }

    try {
      // Extract key hand features
      const features = this.extractHandFeatures(landmarks);

      // Simple rule-based classification
      const gesture = this.classifyByRules(features);

      return gesture;
    } catch (error) {
      console.error('Hand classification error:', error);

      // Fallback to unknown
      return {
        gesture: 'UNKNOWN',
        confidence: 0.1,
        description: 'Could not classify gesture'
      };
    }
  }

  // Extract features from hand landmarks
  private extractHandFeatures(landmarks: number[][]): any {
    if (!landmarks || landmarks.length === 0) {
      return null;
    }

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    return {
      wrist: wrist,
      thumbTip: thumbTip,
      indexTip: indexTip,
      middleTip: middleTip,
      ringTip: ringTip,
      pinkyTip: pinkyTip,

      // Calculate distances
      thumbToIndex: this.distance(thumbTip, indexTip),
      indexToMiddle: this.distance(indexTip, middleTip),
      middleToRing: this.distance(middleTip, ringTip),
      ringToPinky: this.distance(ringTip, pinkyTip),

      // Calculate if fingers are extended
      thumbExtended: this.isFingerExtended(wrist, thumbTip, 0.15),
      indexExtended: this.isFingerExtended(wrist, indexTip, 0.12),
      middleExtended: this.isFingerExtended(wrist, middleTip, 0.12),
      ringExtended: this.isFingerExtended(wrist, ringTip, 0.12),
      pinkyExtended: this.isFingerExtended(wrist, pinkyTip, 0.12),

      // Hand orientation
      palmFacing: this.getPalmFacing(landmarks),
      handHeight: wrist[1] // Y coordinate
    };
  }

  // Calculate distance between two points
  private distance(point1: number[], point2: number[]): number {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Check if finger is extended
  private isFingerExtended(base: number[], tip: number[], threshold: number): boolean {
    return this.distance(base, tip) > threshold;
  }

  // Determine which way palm is facing
  private getPalmFacing(landmarks: number[][]): string {
    const wrist = landmarks[0];
    const middleMcp = landmarks[9]; // Middle finger base

    if (middleMcp[2] > wrist[2]) {
      return 'outward';
    } else {
      return 'inward';
    }
  }

  // Simple rule-based classification
  private classifyByRules(features: any): GestureResult {
    if (!features) {
      return {
        gesture: 'UNKNOWN',
        confidence: 0.1,
        description: 'No hand detected'
      };
    }

    // Rule 1: Fist (A, S, T)
    if (!features.indexExtended && !features.middleExtended &&
      !features.ringExtended && !features.pinkyExtended) {
      if (features.thumbExtended) {
        return {
          gesture: 'A',
          confidence: 0.8,
          description: ASL_SIGNS['A']?.description || 'Fist with thumb'
        };
      } else {
        return {
          gesture: 'S',
          confidence: 0.8,
          description: ASL_SIGNS['S']?.description || 'Closed fist'
        };
      }
    }

    // Rule 2: Flat hand (B, 5, HELLO)
    if (features.indexExtended && features.middleExtended &&
      features.ringExtended && features.pinkyExtended) {
      if (features.thumbExtended) {
        return {
          gesture: '5',
          confidence: 0.8,
          description: 'Open hand with thumb'
        };
      } else {
        return {
          gesture: 'B',
          confidence: 0.8,
          description: ASL_SIGNS['B']?.description || 'Flat hand'
        };
      }
    }

    // Rule 3: Pointing (I, D, P)
    if (features.indexExtended && !features.middleExtended &&
      !features.ringExtended && !features.pinkyExtended) {
      if (features.thumbExtended) {
        // Check if pointing down (P) or sideways (L/D)
        if (features.indexTip[1] > features.wrist[1]) {
          return {
            gesture: 'P',
            confidence: 0.8,
            description: ASL_SIGNS['P']?.description || 'Pointing down'
          };
        } else {
          return {
            gesture: 'L',
            confidence: 0.8,
            description: ASL_SIGNS['L']?.description || 'L shape hand'
          };
        }
      } else {
        return {
          gesture: 'D',
          confidence: 0.8,
          description: ASL_SIGNS['D']?.description || 'Pointing up (D)'
        };
      }
    }

    // Rule 3.1: Pinky only (I)
    if (!features.indexExtended && !features.middleExtended &&
      !features.ringExtended && features.pinkyExtended) {
      return {
        gesture: 'I',
        confidence: 0.8,
        description: ASL_SIGNS['I']?.description || 'Pinky up (I)'
      };
    }

    // Rule 4: U or V shape — index+middle up, ring+pinky down. U = fingers together, V = spread
    if (features.indexExtended && features.middleExtended &&
      !features.ringExtended && !features.pinkyExtended) {
      const fingersTogether = features.indexToMiddle < 0.06;
      return {
        gesture: fingersTogether ? 'U' : 'V',
        confidence: 0.8,
        description: fingersTogether
          ? (ASL_SIGNS['U']?.description || 'U: index and middle together')
          : (ASL_SIGNS['V']?.description || 'V shape hand')
      };
    }

    // Rule 6: C shape or O shape
    if (features.thumbExtended && !features.indexExtended) {
      // Check if thumb and index form circle
      if (features.thumbToIndex < 0.1) {
        return {
          gesture: 'O',
          confidence: 0.8,
          description: ASL_SIGNS['O']?.description || 'O shape hand'
        };
      } else {
        return {
          gesture: 'C',
          confidence: 0.8,
          description: ASL_SIGNS['C']?.description || 'C shape hand'
        };
      }
    }

    // Rule 7: W shape (W)
    if (features.indexExtended && features.middleExtended &&
      features.ringExtended && !features.pinkyExtended) {
      return {
        gesture: 'W',
        confidence: 0.8,
        description: ASL_SIGNS['W']?.description || 'W shape hand'
      };
    }

    // Rule 8: Y shape (Y)
    if (!features.indexExtended && !features.middleExtended &&
      !features.ringExtended && features.pinkyExtended && features.thumbExtended) {
      return {
        gesture: 'Y',
        confidence: 0.8,
        description: ASL_SIGNS['Y']?.description || 'Y shape hand'
      };
    }

    // Default: Unknown
    return {
      gesture: 'UNKNOWN',
      confidence: 0.3,
      description: 'Gesture not recognized'
    };
  }

  // Get ASL sign information
  getSignInfo(gesture: string): GestureResult | null {
    const signInfo = ASL_SIGNS[gesture];
    if (signInfo) {
      return {
        gesture: gesture,
        confidence: 1.0,
        description: signInfo.description
      };
    }
    return null;
  }
}

export default SimpleHandClassifier;
