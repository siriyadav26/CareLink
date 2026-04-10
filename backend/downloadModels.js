const fs = require('fs');
const path = require('path');
const https = require('https');

const modelDir = path.join(__dirname, 'faceModels');
if (!fs.existsSync(modelDir)) fs.mkdirSync(modelDir);

const models = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1'
];

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function main() {
  console.log('Downloading models...');
  for (const model of models) {
    console.log(`Downloading ${model}...`);
    try {
      await download(baseUrl + model, path.join(modelDir, model));
    } catch (e) {
      console.error(`Failed to download ${model}:`, e);
    }
  }
  console.log('Done!');
}

main();
