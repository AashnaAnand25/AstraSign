# 3D Avatar Integration for AstraSign

## Overview
This implementation adds 3D avatar capabilities to the AstraSign app, inspired by sign.mt's architecture. The system now supports both voice-to-ASL and text-to-ASL translation with 3D avatar visualization.

## Features Added

### 1. 3D Avatar System
- **React Three Fiber Integration**: Uses @react-three/fiber for 3D rendering
- **Avatar3D Component**: Handles 3D avatar with ASL handshape animations
- **AvatarScene Component**: Provides the 3D environment with lighting and controls
- **Fallback Visualization**: Works even without a 3D model file

### 2. Enhanced Input Methods
- **Voice Input**: Original voice recognition functionality
- **Text Input**: New text-to-ASL translation capability
- **Input Mode Toggle**: Switch between voice and text modes
- **Real-time Translation**: Both inputs translate to ASL letter sequences

### 3. ASL Handshape Mapping
- **Complete Alphabet**: A-Z letter to viseme mappings
- **Smooth Animations**: Morph target transitions for handshapes
- **Letter Cycling**: Automatic progression through letters
- **Visual Feedback**: Current letter and progress indicators

## Architecture

### Translation Pipeline (inspired by sign.mt)
1. **Input Processing**: Voice or text input
2. **Text Normalization**: Clean and prepare text
3. **Letter Extraction**: Convert to ASL letter sequence
4. **Pose Generation**: Map letters to handshapes
5. **3D Rendering**: Display via avatar animation

### Components
- `Avatar3D.tsx`: Core 3D avatar with ASL animations
- `AvatarScene.tsx`: 3D scene setup and environment
- `VoiceToSign.tsx`: Enhanced with dual input modes and 3D integration

## Usage

### Text Input Mode
1. Toggle to "Text" mode
2. Type text in the input field
3. Click "Translate to ASL"
4. Watch the 3D avatar sign each letter

### Voice Input Mode
1. Toggle to "Voice" mode
2. Click the microphone button
3. Speak naturally
4. Avatar animates the recognized letters

## Technical Details

### Dependencies Added
- `@react-three/fiber@^8.17.6`: React renderer for Three.js
- `@react-three/drei@^9.111.3`: Helpers and utilities
- `three@^0.167.1`: Core 3D graphics library

### 3D Model Setup
1. Place your GLB avatar model in `/public/models/avatar.glb`
2. Use Ready Player Me or other avatar sources
3. The system falls back to basic 3D shapes if no model is found

### ASL Mapping
The system maps letters to visemes for handshape animation:
- A-Z complete alphabet coverage
- Smooth morph target transitions
- 1.5 second duration per letter
- Automatic letter cycling

## Future Enhancements

### Immediate Improvements
1. **Real 3D Models**: Add proper avatar GLB files
2. **More Complex Signs**: Beyond single letters to full words
3. **SignWriting Integration**: Use sign.mt's SignWriting approach
4. **Gesture Recognition**: For sign-to-voice translation

### Advanced Features
1. **Full Body Signing**: Torso, facial expressions, body language
2. **Multiple Avatars**: Different signer options
3. **Speed Control**: Adjustable signing speed
4. **Learning Mode**: Educational features for ASL learning

## Integration with sign.mt Pipeline

This implementation follows sign.mt's architecture:
- **Input**: Voice/text → Normalized text
- **Translation**: Text → ASL letters (simplified from SignWriting)
- **Rendering**: Letters → 3D avatar poses
- **Output**: Animated 3D avatar signing

## Troubleshooting

### 3D Model Not Loading
- Check if `/public/models/avatar.glb` exists
- Verify the model file format (GLB/GLTF)
- The app will use fallback visualization if model is missing

### Performance Issues
- 3D rendering can be resource intensive
- Consider device capabilities
- Fallback mode available for low-end devices

### Animation Not Working
- Check Three.js console for errors
- Verify morph target dictionaries
- Ensure proper viseme mappings

## License
This integration maintains the same license as the original AstraSign project.
