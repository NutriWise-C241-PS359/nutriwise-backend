import tf from '@tensorflow/tfjs-node';

let model;

async function loadModel() {
  if (!model) {
    try {
      model = await tf.loadLayersModel('file://model/model.json');
      console.log(model.summary());
      console.log('Model loaded successfully.');
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    }
  }
  return model;
}

async function predictCalories(weight, height, age, gender, activityLevel, calorie) {
  await loadModel();

  const inputTensor = tf.tensor2d([[weight, height, age, gender === 'male' ? 1 : 0, activityLevel, calorie]]);
  const prediction = model.predict(inputTensor);
  const dailyCalories = prediction.dataSync()[0];

  return dailyCalories;
}

export { loadModel, predictCalories };