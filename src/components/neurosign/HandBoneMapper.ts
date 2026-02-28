// Maps MediaPipe hand landmarks to 3D avatar bones
export interface HandBones {
  wrist: THREE.Bone;
  thumbMetacarpal: THREE.Bone;
  thumbProximal: THREE.Bone;
  thumbIntermediate: THREE.Bone;
  thumbDistal: THREE.Bone;
  indexMetacarpal: THREE.Bone;
  indexProximal: THREE.Bone;
  indexIntermediate: THREE.Bone;
  indexDistal: THREE.Bone;
  middleMetacarpal: THREE.Bone;
  middleProximal: THREE.Bone;
  middleIntermediate: THREE.Bone;
  middleDistal: THREE.Bone;
  ringMetacarpal: THREE.Bone;
  ringProximal: THREE.Bone;
  ringIntermediate: THREE.Bone;
  ringDistal: THREE.Bone;
  pinkyMetacarpal: THREE.Bone;
  pinkyProximal: THREE.Bone;
  pinkyIntermediate: THREE.Bone;
  pinkyDistal: THREE.Bone;
}

export class HandBoneMapper {
  private bones: HandBones;
  private avatar: THREE.Group;

  constructor(avatar: THREE.Group) {
    this.avatar = avatar;
    this.initializeBones();
  }

  // Initialize hand bones (simplified but working)
  private initializeBones() {
    // Create bones for each finger segment
    this.bones = {
      wrist: new THREE.Bone(),
      thumbMetacarpal: new THREE.Bone(),
      thumbProximal: new THREE.Bone(),
      thumbIntermediate: new THREE.Bone(),
      thumbDistal: new THREE.Bone(),
      indexMetacarpal: new THREE.Bone(),
      indexProximal: new THREE.Bone(),
      indexIntermediate: new THREE.Bone(),
      indexDistal: new THREE.Bone(),
      middleMetacarpal: new THREE.Bone(),
      middleProximal: new THREE.Bone(),
      middleIntermediate: new THREE.Bone(),
      middleDistal: new THREE.Bone(),
      ringMetacarpal: new THREE.Bone(),
      ringProximal: new THREE.Bone(),
      ringIntermediate: new THREE.Bone(),
      ringDistal: new THREE.Bone(),
      pinkyMetacarpal: new THREE.Bone(),
      pinkyProximal: new THREE.Bone(),
      pinkyIntermediate: new THREE.Bone(),
      pinkyDistal: new THREE.Bone(),
    };
  }

  // Map MediaPipe landmarks to 3D bone positions
  updateHandPose(landmarks: number[][]) {
    if (!landmarks || landmarks.length === 0) return;

    // MediaPipe landmark indices (0-20)
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const thumbMP = landmarks[2];
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const indexMP = landmarks[5];
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const middleMP = landmarks[9];
    const ringTip = landmarks[16];
    const ringPIP = landmarks[14];
    const ringMP = landmarks[13];
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];
    const pinkyMP = landmarks[17];

    // Convert normalized coordinates to 3D space
    const scale = 0.1; // Adjust scale as needed
    const offset = { x: 0, y: 0, z: 0 };

    // Update wrist position
    this.updateBonePosition(this.bones.wrist, wrist, scale, offset);

    // Update thumb bones
    this.updateBoneChain([
      this.bones.thumbMetacarpal,
      this.bones.thumbProximal,
      this.bones.thumbIntermediate,
      this.bones.thumbDistal
    ], [thumbMP, thumbIP, thumbTip], scale, offset);

    // Update index finger bones
    this.updateBoneChain([
      this.bones.indexMetacarpal,
      this.bones.indexProximal,
      this.bones.indexIntermediate,
      this.bones.indexDistal
    ], [indexMP, indexPIP, indexTip], scale, offset);

    // Update middle finger bones
    this.updateBoneChain([
      this.bones.middleMetacarpal,
      this.bones.middleProximal,
      this.bones.middleIntermediate,
      this.bones.middleDistal
    ], [middleMP, middlePIP, middleTip], scale, offset);

    // Update ring finger bones
    this.updateBoneChain([
      this.bones.ringMetacarpal,
      this.bones.ringProximal,
      this.bones.ringIntermediate,
      this.bones.ringDistal
    ], [ringMP, ringPIP, ringTip], scale, offset);

    // Update pinky finger bones
    this.updateBoneChain([
      this.bones.pinkyMetacarpal,
      this.bones.pinkyProximal,
      this.bones.pinkyIntermediate,
      this.bones.pinkyDistal
    ], [pinkyMP, pinkyPIP, pinkyTip], scale, offset);
  }

  // Update a chain of bones
  private updateBoneChain(bones: THREE.Bone[], points: number[][], scale: number, offset: { x: number, y: number, z: number }) {
    bones.forEach((bone, index) => {
      if (points[index]) {
        const point = points[index];
        const position = new THREE.Vector3(
          (point[0] - 0.5) * scale + offset.x,
          -(point[1] - 0.5) * scale + offset.y,
          point[2] * scale + offset.z
        );
        bone.position.copy(position);
      }
    });
  }

  // Apply ASL sign poses to bones
  applyASLPose(sign: string) {
    const poses = {
      'A': () => this.makeFist(),
      'B': () => this.makeFlatHand(),
      'C': () => this.makeCShape(),
      'D': () => this.makeDShape(),
      'E': () => this.makeFlatHand(),
      'F': () => this.makeFShape(),
      'G': () => this.makeFist(),
      'H': () => this.makeFlatHand(),
      'I': () => this.makeIShape(),
      'J': () => this.makeJShape(),
      'K': () => this.makeKShape(),
      'L': () => this.makeLShape(),
      'M': () => this.makeMShape(),
      'N': () => this.makeNShape(),
      'O': () => this.makeOShape(),
      'P': () => this.makePShape(),
      'Q': () => this.makeQShape(),
      'R': () => this.makeRShape(),
      'S': () => this.makeFist(),
      'T': () => this.makeTShape(),
      'U': () => this.makeUShape(),
      'V': () => this.makeVShape(),
      'W': () => this.makeWShape(),
      'X': () => this.makeXShape(),
      'Y': () => this.makeYShape(),
      'Z': () => this.makeZShape(),
      'HELLO': () => this.makeHello(),
      'THANK': () => this.makeThank(),
      'PLEASE': () => this.makePlease(),
      'YES': () => this.makeYes(),
      'NO': () => this.makeNo(),
    };

    const poseFunction = poses[sign as keyof typeof poses];
    if (poseFunction) {
      poseFunction();
      return true;
    }
    
    return false;
  }

  // ASL letter poses
  private makeFist() {
    // Close all fingers
    this.curlFinger(this.bones.thumbDistal, 0.8);
    this.curlFinger(this.bones.indexDistal, 0.8);
    this.curlFinger(this.bones.middleDistal, 0.8);
    this.curlFinger(this.bones.ringDistal, 0.8);
    this.curlFinger(this.bones.pinkyDistal, 0.8);
  }

  private makeFlatHand() {
    // Extend all fingers
    this.curlFinger(this.bones.thumbDistal, 0.1);
    this.curlFinger(this.bones.indexDistal, 0.1);
    this.curlFinger(this.bones.middleDistal, 0.1);
    this.curlFinger(this.bones.ringDistal, 0.1);
    this.curlFinger(this.bones.pinkyDistal, 0.1);
  }

  private makeCShape() {
    // C shape: thumb and index form circle
    this.curlFinger(this.bones.thumbDistal, 0.1);
    this.curlFinger(this.bones.indexDistal, 0.1);
    this.curlFinger(this.bones.middleDistal, 0.8);
    this.curlFinger(this.bones.ringDistal, 0.8);
    this.curlFinger(this.bones.pinkyDistal, 0.8);
  }

  private makeLShape() {
    // L shape: thumb and index extended
    this.curlFinger(this.bones.thumbDistal, 0.1);
    this.curlFinger(this.bones.indexDistal, 0.1);
    this.curlFinger(this.bones.middleDistal, 0.8);
    this.curlFinger(this.bones.ringDistal, 0.8);
    this.curlFinger(this.bones.pinkyDistal, 0.8);
  }

  private makeVShape() {
    // V shape: index and middle extended
    this.curlFinger(this.bones.thumbDistal, 0.8);
    this.curlFinger(this.bones.indexDistal, 0.1);
    this.curlFinger(this.bones.middleDistal, 0.1);
    this.curlFinger(this.bones.ringDistal, 0.8);
    this.curlFinger(this.bones.pinkyDistal, 0.8);
  }

  private makeHello() {
    // Wave motion
    this.makeFlatHand();
    // Add wave animation logic here
  }

  private makeThank() {
    // From chin outward motion
    this.makeFlatHand();
    // Position near chin
  }

  // Helper method to curl finger
  private curlFinger(bone: THREE.Bone, amount: number) {
    if (bone) {
      // Simple rotation to simulate curling
      bone.rotation.x = amount;
    }
  }

  // Get all bones for external access
  getAllBones(): HandBones {
    return this.bones;
  }
}
