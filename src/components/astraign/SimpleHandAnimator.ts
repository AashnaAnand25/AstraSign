// Simple hand animator using CSS transforms (no Three.js needed)
export interface HandPose {
  fingers: {
    thumb: number; // 0-1 (0=curled, 1=extended)
    index: number;
    middle: number;
    ring: number;
    pinky: number;
  };
  wrist: {
    x: number;
    y: number;
  };
}

export class SimpleHandAnimator {
  private handElement: HTMLElement | null = null;

  constructor(handElementId: string) {
    this.handElement = document.getElementById(handElementId);
  }

  // Apply ASL pose to hand
  applyASLPose(sign: string): void {
    if (!this.handElement) return;

    const poses = {
      'A': () => this.setFist(),
      'B': () => this.setFlatHand(),
      'C': () => this.setCShape(),
      'D': () => this.setDShape(),
      'E': () => this.setFlatHand(),
      'F': () => this.setFShape(),
      'G': () => this.setFist(),
      'H': () => this.setFlatHand(),
      'I': () => this.setIShape(),
      'J': () => this.setJShape(),
      'K': () => this.setKShape(),
      'L': () => this.setLShape(),
      'M': () => this.setMShape(),
      'N': () => this.setNShape(),
      'O': () => this.setOShape(),
      'P': () => this.setPShape(),
      'Q': () => this.setQShape(),
      'R': () => this.setRShape(),
      'S': () => this.setFist(),
      'T': () => this.setTShape(),
      'U': () => this.setUShape(),
      'V': () => this.setVShape(),
      'W': () => this.setWShape(),
      'X': () => this.setXShape(),
      'Y': () => this.setYShape(),
      'Z': () => this.setZShape(),
      'HELLO': () => this.setHello(),
      'THANK': () => this.setThank(),
      'PLEASE': () => this.setPlease(),
      'YES': () => this.setYes(),
      'NO': () => this.setNo(),
    };

    const poseFunction = poses[sign as keyof typeof poses];
    if (poseFunction) {
      poseFunction();
      return true;
    }
    
    return false;
  }

  // Set finger positions (0=curled, 1=extended)
  private setFingers(thumb: number, index: number, middle: number, ring: number, pinky: number) {
    if (!this.handElement) return;

    const fingers = [
      this.handElement.querySelector('.thumb') as HTMLElement,
      this.handElement.querySelector('.index') as HTMLElement,
      this.handElement.querySelector('.middle') as HTMLElement,
      this.handElement.querySelector('.ring') as HTMLElement,
      this.handElement.querySelector('.pinky') as HTMLElement,
    ];

    const positions = [
      `${thumb * 90}deg`,
      `${index * 90}deg`,
      `${middle * 90}deg`,
      `${ring * 90}deg`,
      `${pinky * 90}deg`,
    ];

    fingers.forEach((finger, i) => {
      if (finger && positions[i]) {
        finger.style.transform = `rotateX(${positions[i]}) translateY(${finger ? '0px' : '-20px'})`;
        finger.style.transition = 'transform 0.3s ease';
      }
    });
  }

  // ASL letter poses
  private setFist() {
    this.setFingers(0.2, 0.2, 0.2, 0.2);
  }

  private setFlatHand() {
    this.setFingers(1, 1, 1, 1);
  }

  private setCShape() {
    this.setFingers(0.3, 0.3, 1, 1);
  }

  private setDShape() {
    this.setFingers(1, 0.3, 1, 1);
  }

  private setFShape() {
    this.setFingers(0.3, 1, 1, 1);
  }

  private setIShape() {
    this.setFingers(1, 1, 1, 0.2);
  }

  private setJShape() {
    this.setFingers(1, 1, 1, 0.2);
  }

  private setKShape() {
    this.setFingers(1, 1, 0.3, 1);
  }

  private setLShape() {
    this.setFingers(1, 0.3, 1, 0.2);
  }

  private setMShape() {
    this.setFingers(0.3, 0.3, 0.3, 0.3);
  }

  private setNShape() {
    this.setFingers(0.3, 0.3, 0.3, 0.3);
  }

  private setOShape() {
    this.setFingers(0.3, 0.3, 0.3, 0.3);
  }

  private setPShape() {
    this.setFingers(1, 1, 1, 0.2);
  }

  private setQShape() {
    this.setFingers(1, 0.3, 1, 0.2);
  }

  private setRShape() {
    this.setFingers(0.3, 1, 0.3, 0.3);
  }

  private setTShape() {
    this.setFingers(0.3, 0.3, 0.3, 0.3);
  }

  private setUShape() {
    this.setFingers(0.3, 0.3, 0.3, 0.3);
  }

  private setVShape() {
    this.setFingers(0.3, 1, 1, 0.2);
  }

  private setWShape() {
    this.setFingers(1, 1, 1, 1);
  }

  private setXShape() {
    this.setFingers(0.3, 1, 1, 0.2);
  }

  private setYShape() {
    this.setFingers(0.3, 0.3, 0.3, 0.3);
  }

  private setZShape() {
    this.setFingers(0.3, 0.3, 0.3, 0.3);
  }

  private setHello() {
    this.setFlatHand();
    // Add wave animation
    if (this.handElement) {
      this.handElement.style.animation = 'wave 1s ease-in-out infinite';
    }
  }

  private setThank() {
    this.setFlatHand();
    // Position near chin
    if (this.handElement) {
      this.handElement.style.transform = 'translateY(-50px)';
    }
  }

  private setPlease() {
    this.setFlatHand();
    // Circular motion
    if (this.handElement) {
      this.handElement.style.animation = 'circle 1s ease-in-out';
    }
  }

  private setYes() {
    this.setFist();
    // Nodding motion
    if (this.handElement) {
      this.handElement.style.animation = 'nod 0.5s ease-in-out 2';
    }
  }

  private setNo() {
    this.setFlatHand();
    // Head shake
    if (this.handElement) {
      this.handElement.style.animation = 'shake 0.5s ease-in-out';
    }
  }
}

export default SimpleHandAnimator;
