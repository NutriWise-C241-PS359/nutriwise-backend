import fs from 'fs';
import tf from '@tensorflow/tfjs-node';
import axios from 'axios';

let model;
let scalingConfig;

const minMaxRanges = {
  Age: { min: 0, max: 100 },
  Height: { min: 100, max: 250 },
  Weight: { min: 30, max: 150 },
};

const oneHotCategories = {
  Gender: ['1', '0'],
};

const ordinalCategories = {
  Activities: ['0', '1', '2', '3', '4'],
};

async function loadScalingConfig() {
  if (!scalingConfig) {
    try {
      // Ganti dengan URL yang merujuk ke file JSON konfigurasi scaling
      const scalingConfigUrl = process.env.SCALING_CONFIG;

      if (!scalingConfigUrl) {
        throw new Error('SCALING_CONFIG_URL environment variable is not set.');
      }

      const response = await axios.get(scalingConfigUrl);

      scalingConfig = response.data;
      console.log('Scaling configuration loaded successfully.');
    } catch (error) {
      console.error('Error loading scaling configuration:', error);
      throw error;
    }
  }
  return scalingConfig;
}

async function loadModel() {
  if (!model) {
    try {
      model = await tf.loadLayersModel(process.env.MODEL_URL);
      console.log(model.summary());
      console.log('Model loaded successfully.');
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    }
  }
  return model;
}

function minMaxScale(value, feature) {
  const range = minMaxRanges[feature];
  return (value - range.min) / (range.max - range.min);
}

function oneHotEncode(value, feature) {
  const categories = oneHotCategories[feature];
  return categories.map((cat) => (cat === value ? 1 : 0));
}

function ordinalEncode(value, feature) {
  const categories = ordinalCategories[feature];
  return categories.indexOf(value);
}

function transformFeature(transformer_type, value, feature) {
  switch (transformer_type) {
    case 'MinMaxScaler':
      return minMaxScale(value, feature);
    case 'OneHotEncoder':
      return oneHotEncode(value, feature);
    case 'OrdinalEncoder':
      return ordinalEncode(value, feature);
    default:
      throw new Error(`Unknown transformer type: ${transformer_type}`);
  }
}

async function transformInput(weight, height, age, gender, activityLevel) {
  await loadScalingConfig();

  const input = [];
  const transformers = scalingConfig.transformers;

  for (const transformer of transformers) {
    const { transformer_type, features } = transformer;

    features.forEach((feature) => {
      let transformedValue;
      switch (feature) {
        case 'Weight':
          transformedValue = transformFeature(transformer_type, weight, feature);
          break;
        case 'Height':
          transformedValue = transformFeature(transformer_type, height, feature);
          break;
        case 'Age':
          transformedValue = transformFeature(transformer_type, age, feature);
          break;
        case 'Gender':
          transformedValue = transformFeature(transformer_type, gender, feature);
          break;
        case 'Activities':
          transformedValue = transformFeature(transformer_type, activityLevel, feature);
          break;
        default:
          throw new Error(`Unknown feature: ${feature}`);
      }

      if (Array.isArray(transformedValue)) {
        input.push(...transformedValue);
      } else {
        input.push(transformedValue);
      }
    });
  }

  return input;
}

async function predictCalories(weight, height, age, gender, activityLevel) {
  await loadModel();

  const transformedInput = await transformInput(weight, height, age, gender, activityLevel);
  const inputTensor = tf.tensor2d([transformedInput]);

  const prediction = model.predict(inputTensor);
  const dailyCalories = prediction.dataSync()[0];

  return dailyCalories;
}

export { loadModel, predictCalories };
