export interface ASLSign {
  id: string;
  word: string;
  category: 'alphabet' | 'number' | 'common' | 'emergency' | 'family' | 'daily';
  description: string;
  handshape: string;
  movement: string;
  location: string;
  videoUrl?: string;
  imageUrl?: string;
  sigmlData?: string;
}

export interface TrainingExample {
  id: string;
  signId: string;
  imageData: ImageData;
  landmarks?: number[]; // MediaPipe hand landmarks
  label: string;
}

class ASLSignsDatabase {
  private signs: Map<string, ASLSign> = new Map();
  private trainingExamples: TrainingExample[] = [];

  constructor() {
    this.initializeSigns();
  }

  private initializeSigns(): void {
    const defaultSigns: ASLSign[] = [
      // Alphabet
      { id: 'a', word: 'A', category: 'alphabet', description: 'Fist with thumb on side', handshape: 'fist', movement: 'none', location: 'chest' },
      { id: 'b', word: 'B', category: 'alphabet', description: 'Fingers extended together, thumb tucked', handshape: 'flat', movement: 'none', location: 'chest' },
      { id: 'c', word: 'C', category: 'alphabet', description: 'Curved hand shape', handshape: 'curved', movement: 'none', location: 'chest' },
      { id: 'd', word: 'D', category: 'alphabet', description: 'Index finger up, other fingers curved', handshape: 'pointing', movement: 'none', location: 'chest' },
      { id: 'e', word: 'E', category: 'alphabet', description: 'Fingers bent at knuckles, thumb tucked', handshape: 'claw', movement: 'none', location: 'chest' },
      { id: 'f', word: 'F', category: 'alphabet', description: 'Thumb and index finger touch, others up', handshape: 'circle', movement: 'none', location: 'chest' },
      { id: 'g', word: 'G', category: 'alphabet', description: 'Index and thumb extended parallel', handshape: 'parallel', movement: 'none', location: 'chest' },
      { id: 'h', word: 'H', category: 'alphabet', description: 'Index and middle fingers extended parallel', handshape: 'parallel', movement: 'none', location: 'chest' },
      { id: 'i', word: 'I', category: 'alphabet', description: 'Pinky finger up, others down', handshape: 'pinky', movement: 'none', location: 'chest' },
      { id: 'j', word: 'J', category: 'alphabet', description: 'Pinky finger draws J shape', handshape: 'pinky', movement: 'drawing', location: 'chest' },
      { id: 'k', word: 'K', category: 'alphabet', description: 'Index and middle fingers up, thumb between', handshape: 'split', movement: 'none', location: 'chest' },
      { id: 'l', word: 'L', category: 'alphabet', description: 'Thumb and index finger extended at right angle', handshape: 'L-shape', movement: 'none', location: 'chest' },
      { id: 'm', word: 'M', category: 'alphabet', description: 'Three fingers down on thumb', handshape: 'folded', movement: 'none', location: 'chest' },
      { id: 'n', word: 'N', category: 'alphabet', description: 'Two fingers down on thumb', handshape: 'folded', movement: 'none', location: 'chest' },
      { id: 'o', word: 'O', category: 'alphabet', description: 'Fingers and thumb form O shape', handshape: 'circle', movement: 'none', location: 'chest' },
      { id: 'p', word: 'P', category: 'alphabet', description: 'Like K but facing down', handshape: 'split', movement: 'none', location: 'chest' },
      { id: 'q', word: 'Q', category: 'alphabet', description: 'Like G but facing down', handshape: 'parallel', movement: 'none', location: 'chest' },
      { id: 'r', word: 'R', category: 'alphabet', description: 'Index and middle fingers crossed', handshape: 'crossed', movement: 'none', location: 'chest' },
      { id: 's', word: 'S', category: 'alphabet', description: 'Fist with thumb over fingers', handshape: 'fist', movement: 'none', location: 'chest' },
      { id: 't', word: 'T', category: 'alphabet', description: 'Thumb between index and middle fingers', handshape: 'tucked', movement: 'none', location: 'chest' },
      { id: 'u', word: 'U', category: 'alphabet', description: 'Index and middle fingers up together', handshape: 'parallel-up', movement: 'none', location: 'chest' },
      { id: 'v', word: 'V', category: 'alphabet', description: 'Index and middle fingers spread apart', handshape: 'victory', movement: 'none', location: 'chest' },
      { id: 'w', word: 'W', category: 'alphabet', description: 'Index, middle, ring fingers up', handshape: 'three-up', movement: 'none', location: 'chest' },
      { id: 'x', word: 'X', category: 'alphabet', description: 'Index finger bent at knuckle', handshape: 'hooked', movement: 'none', location: 'chest' },
      { id: 'y', word: 'Y', category: 'alphabet', description: 'Thumb and pinky extended', handshape: 'horns', movement: 'none', location: 'chest' },
      { id: 'z', word: 'Z', category: 'alphabet', description: 'Index finger draws Z shape', handshape: 'pointing', movement: 'drawing', location: 'chest' },

      // Common words
      { id: 'hello', word: 'HELLO', category: 'common', description: 'Hand to forehead, then outward', handshape: 'flat', movement: 'wave', location: 'forehead' },
      { id: 'help', word: 'HELP', category: 'common', description: 'Fist on palm of other hand', handshape: 'fist', movement: 'lift', location: 'palm' },
      { id: 'yes', word: 'YES', category: 'common', description: 'Fist nods up and down', handshape: 'fist', movement: 'nod', location: 'chest' },
      { id: 'no', word: 'NO', category: 'common', description: 'Index and middle fingers wave', handshape: 'victory', movement: 'wave', location: 'nose' },
      { id: 'thank', word: 'THANK', category: 'common', description: 'Hand moves from chin forward', handshape: 'flat', movement: 'forward', location: 'chin' },
      { id: 'please', word: 'PLEASE', category: 'common', description: 'Hand circles on chest', handshape: 'flat', movement: 'circular', location: 'chest' },
      { id: 'sorry', word: 'SORRY', category: 'common', description: 'Fist circles on chest', handshape: 'fist', movement: 'circular', location: 'chest' },
      { id: 'love', word: 'LOVE', category: 'common', description: 'Arms crossed over chest', handshape: 'flat', movement: 'cross', location: 'chest' },
      { id: 'nice', word: 'NICE', category: 'common', description: 'Hands brush forward', handshape: 'flat', movement: 'brush', location: 'chest' },
      { id: 'meet', word: 'MEET', category: 'common', description: 'Index fingers meet', handshape: 'pointing', movement: 'meet', location: 'chest' },
      { id: 'how', word: 'HOW', category: 'common', description: 'Fingers wiggle', handshape: 'claw', movement: 'wiggle', location: 'chest' },
      { id: 'you', word: 'YOU', category: 'common', description: 'Index finger points', handshape: 'pointing', movement: 'point', location: 'forward' },

      // Emergency
      { id: 'emergency', word: 'EMERGENCY', category: 'emergency', description: 'Both hands wave', handshape: 'flat', movement: 'wave', location: 'chest' },
      { id: 'deaf', word: 'DEAF', category: 'emergency', description: 'Index finger moves from ear to mouth', handshape: 'pointing', movement: 'arc', location: 'face' },
      { id: 'assistance', word: 'ASSISTANCE', category: 'emergency', description: 'Both hands up', handshape: 'flat', movement: 'raise', location: 'chest' },

      // Family
      { id: 'mother', word: 'MOTHER', category: 'family', description: 'Thumb touches chin', handshape: 'thumb', movement: 'tap', location: 'chin' },
      { id: 'father', word: 'FATHER', category: 'family', description: 'Thumb touches forehead', handshape: 'thumb', movement: 'tap', location: 'forehead' },
      { id: 'sister', word: 'SISTER', category: 'family', description: 'L-shape moves from chin down', handshape: 'L-shape', movement: 'down', location: 'chin' },
      { id: 'brother', word: 'BROTHER', category: 'family', description: 'L-shape moves from forehead down', handshape: 'L-shape', movement: 'down', location: 'forehead' },
      { id: 'family', word: 'FAMILY', category: 'family', description: 'F-hands circle', handshape: 'F-shape', movement: 'circular', location: 'chest' },

      // Daily life
      { id: 'home', word: 'HOME', category: 'daily', description: 'Hand touches chin, then touches cheek', handshape: 'flat', movement: 'touch-touch', location: 'face' },
      { id: 'school', word: 'SCHOOL', category: 'daily', description: 'Clapping hands', handshape: 'flat', movement: 'clap', location: 'chest' },
      { id: 'work', word: 'WORK', category: 'daily', description: 'Fist pounds other palm', handshape: 'fist', movement: 'pound', location: 'palm' },
      { id: 'water', word: 'WATER', category: 'daily', description: 'W-shape taps chin', handshape: 'W-shape', movement: 'tap', location: 'chin' },
      { id: 'food', word: 'FOOD', category: 'daily', description: 'Fingers to mouth', handshape: 'cluster', movement: 'bring', location: 'mouth' },
      { id: 'car', word: 'CAR', category: 'daily', description: 'Hands turn steering wheel', handshape: 'grip', movement: 'rotate', location: 'chest' },
      { id: 'book', word: 'BOOK', category: 'daily', description: 'Hands open like book', handshape: 'flat', movement: 'open', location: 'chest' },
      { id: 'friend', word: 'FRIEND', category: 'daily', description: 'Linked index fingers', handshape: 'pointing', movement: 'link', location: 'chest' },

      // Pronouns and basic
      { id: 'me', word: 'ME', category: 'common', description: 'Index finger points to chest', handshape: 'pointing', movement: 'point', location: 'chest' },
      { id: 'go', word: 'GO', category: 'common', description: 'Index fingers point forward', handshape: 'pointing', movement: 'forward', location: 'chest' },
      { id: 'class', word: 'CLASS', category: 'daily', description: 'Both hands form C-shape', handshape: 'C-shape', movement: 'none', location: 'chest' },
      { id: 'name', word: 'NAME', category: 'common', description: 'Two fingers tap forehead twice', handshape: 'two-fingers', movement: 'double-tap', location: 'forehead' },
      { id: 'need', word: 'NEED', category: 'common', description: 'Hand moves down chest', handshape: 'claw', movement: 'down', location: 'chest' },
      { id: 'good', word: 'GOOD', category: 'common', description: 'Hand moves from mouth outward', handshape: 'flat', movement: 'outward', location: 'mouth' },
      { id: 'morning', word: 'MORNING', category: 'daily', description: 'Arm rises like sun', handshape: 'flat', movement: 'arc-up', location: 'side' },
      { id: 'night', word: 'NIGHT', category: 'daily', description: 'Hand moves down like sunset', handshape: 'flat', movement: 'arc-down', location: 'side' },
      { id: 'your', word: 'YOUR', category: 'common', description: 'Hand points outward', handshape: 'flat', movement: 'point', location: 'forward' }
    ];

    defaultSigns.forEach(sign => {
      this.signs.set(sign.id, sign);
    });
  }

  // Get all signs
  getAllSigns(): ASLSign[] {
    return Array.from(this.signs.values());
  }

  // Get sign by ID
  getSign(id: string): ASLSign | undefined {
    return this.signs.get(id);
  }

  // Get signs by category
  getSignsByCategory(category: ASLSign['category']): ASLSign[] {
    return this.getAllSigns().filter(sign => sign.category === category);
  }

  // Search signs by word
  searchSigns(query: string): ASLSign[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllSigns().filter(sign => 
      sign.word.toLowerCase().includes(lowerQuery) ||
      sign.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Add new sign
  addSign(sign: ASLSign): void {
    this.signs.set(sign.id, sign);
  }

  // Update existing sign
  updateSign(id: string, updates: Partial<ASLSign>): boolean {
    const existingSign = this.signs.get(id);
    if (!existingSign) return false;

    this.signs.set(id, { ...existingSign, ...updates });
    return true;
  }

  // Delete sign
  deleteSign(id: string): boolean {
    return this.signs.delete(id);
  }

  // Training data methods
  addTrainingExample(example: TrainingExample): void {
    this.trainingExamples.push(example);
  }

  getTrainingExamples(): TrainingExample[] {
    return this.trainingExamples;
  }

  getTrainingExamplesBySign(signId: string): TrainingExample[] {
    return this.trainingExamples.filter(example => example.signId === signId);
  }

  // Get training data for ML model
  getTrainingData(): { images: number[][][][]; labels: number[]; labelMap: Map<string, number> } {
    const labelMap = new Map<string, number>();
    let labelIndex = 0;
    
    // Create label mapping
    this.trainingExamples.forEach(example => {
      if (!labelMap.has(example.label)) {
        labelMap.set(example.label, labelIndex);
        labelIndex++;
      }
    });

    // Prepare training data
    const images: number[][][][] = [];
    const labels: number[] = [];

    this.trainingExamples.forEach(example => {
      // Convert ImageData to normalized tensor format
      const imageData = example.imageData;
      const imageArray: number[][][] = [];
      
      for (let y = 0; y < imageData.height; y++) {
        const row: number[][] = [];
        for (let x = 0; x < imageData.width; x++) {
          const i = (y * imageData.width + x) * 4;
          const pixel: number[] = [
            imageData.data[i] / 255.0,     // R
            imageData.data[i + 1] / 255.0, // G
            imageData.data[i + 2] / 255.0, // B
            imageData.data[i + 3] / 255.0  // A
          ];
          row.push(pixel);
        }
        imageArray.push(row);
      }
      
      images.push(imageArray);
      labels.push(labelMap.get(example.label) || 0);
    });

    return { images, labels, labelMap };
  }

  // Export database to JSON
  exportToJSON(): string {
    const data = {
      signs: Array.from(this.signs.values()),
      trainingExamples: this.trainingExamples.map(example => ({
        ...example,
        imageData: null // Don't export image data in JSON
      }))
    };
    return JSON.stringify(data, null, 2);
  }

  // Import database from JSON
  importFromJSON(jsonString: string): void {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.signs) {
        data.signs.forEach((sign: ASLSign) => {
          this.signs.set(sign.id, sign);
        });
      }
      
      if (data.trainingExamples) {
        // Note: imageData will be null, needs to be re-added
        this.trainingExamples = data.trainingExamples;
      }
    } catch (error) {
      console.error('Failed to import database:', error);
      throw error;
    }
  }

  // Get statistics
  getStatistics(): {
    totalSigns: number;
    signsByCategory: Record<string, number>;
    totalTrainingExamples: number;
    trainingExamplesBySign: Record<string, number>;
  } {
    const signsByCategory: Record<string, number> = {};
    const trainingExamplesBySign: Record<string, number> = {};

    this.getAllSigns().forEach(sign => {
      signsByCategory[sign.category] = (signsByCategory[sign.category] || 0) + 1;
    });

    this.trainingExamples.forEach(example => {
      trainingExamplesBySign[example.signId] = (trainingExamplesBySign[example.signId] || 0) + 1;
    });

    return {
      totalSigns: this.signs.size,
      signsByCategory,
      totalTrainingExamples: this.trainingExamples.length,
      trainingExamplesBySign
    };
  }
}

export const aslSignsDatabase = new ASLSignsDatabase();
