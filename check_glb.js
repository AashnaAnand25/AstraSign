const fs = require('fs');
const glb = fs.readFileSync('public/models/astronaut.glb');
// find the JSON chunk in GLB
const jsonChunkLength = glb.readUInt32LE(12);
const jsonChunkType = glb.readUInt32LE(16);
if (jsonChunkType === 0x4E4F534A) {
  const jsonStr = glb.toString('utf8', 20, 20 + jsonChunkLength);
  const json = JSON.parse(jsonStr);
  console.log('Animations:', json.animations ? json.animations.map(a => a.name) : 'none');
} else {
  console.log('No JSON chunk found');
}
