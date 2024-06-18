// import { predictCalories } from '../services/loadModel.js';
// import TargetCal from '../model/targetcalmodel.js';

// export const calculateTargetCalories = async (req, res) => {
//   try {
//     const { userId } = req.user;
//     const { age, gender, activityLevel, height, currentWeight, targetWeight, duration } = req.body;

//     if (!age || !gender || !activityLevel || !height || !currentWeight || !targetWeight || !duration) {
//       return res.status(400).json({ message: 'All input fields are required.' });
//     }

//     // Calculate daily calories for current weight
//     const currentCalories = await predictCalories(currentWeight, height, age, gender, activityLevel);

//     // Calculate daily calories for target weight
//     const targetCalories = await predictCalories(targetWeight, height, age, gender, activityLevel);

//     // Calculate daily calorie deficit or surplus needed
//     const dailyCalorieChange = (targetCalories - currentCalories) / duration;

//     // Initialize lists
//     let dailyCaloriesList = [];
//     let macronutrientsList = [];

//     // Push initial current calories and macronutrients
//     dailyCaloriesList.push({
//       day: new Date().toISOString().slice(0, 10),
//       calories: currentCalories,
//       protein: (currentCalories * 0.15) / 4, // Protein in grams
//       carbs: (currentCalories * 0.65) / 4, // Carbs in grams
//       fats: (currentCalories * 0.2) / 9, // Fats in grams
//     });

//     // Calculate daily calories and macronutrients for each day
//     for (let i = 0; i < duration - 1; i++) {
//       const previousDayCalories = dailyCaloriesList[i].calories;
//       const dailyCalories = previousDayCalories + dailyCalorieChange;
//       const proteinGrams = (dailyCalories * 0.15) / 4; // Protein in grams
//       const carbsGrams = (dailyCalories * 0.65) / 4; // Carbs in grams
//       const fatsGrams = (dailyCalories * 0.2) / 9; // Fats in grams
//       const currentDate = new Date();
//       currentDate.setDate(currentDate.getDate() + (i + 1));

//       // Push to daily calories list
//       dailyCaloriesList.push({
//         day: currentDate.toISOString().slice(0, 10),
//         calories: dailyCalories,
//         protein: proteinGrams,
//         carbs: carbsGrams,
//         fats: fatsGrams,
//       });

//       // Push to macronutrients list
//       macronutrientsList.push({
//         day: currentDate.toISOString().slice(0, 10),
//         calories: dailyCalories,
//         protein: proteinGrams,
//         carbs: carbsGrams,
//         fats: fatsGrams,
//       });
//     }

//     await TargetCal.destroy({
//       where: {
//         userId: userId, // Assuming req.user.userId contains the logged-in user's ID
//       },
//     });

//     for (let i = 0; i < dailyCaloriesList.length; i++) {
//       await TargetCal.create({
//         calories: dailyCaloriesList[i].calories,
//         protein: dailyCaloriesList[i].protein,
//         carbs: dailyCaloriesList[i].carbs,
//         fats: dailyCaloriesList[i].fats,
//         date: dailyCaloriesList[i].day,
//         userId: userId,
//       });
//     }

//     res.status(200).json({
//       status: 'Success',
//       message: 'Successfully calculated target calories and macronutrients',
//       currentCalories,
//       targetCalories,
//       dailyCalorieChange,
//       dailyCaloriesList,
//       macronutrientsList,
//     });
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

import Target from '../model/targetmodel.js';
import { predictCalories } from '../services/loadModel.js';
import TargetCal from '../model/targetcalmodel.js';

export const calculateTargetCalories = async (req, res) => {
  try {
    const { userId } = req.user;
    const { age, gender, activityLevel, height, currentWeight, targetWeight, duration } = req.body;

    if (!age || !gender || !activityLevel || !height || !currentWeight || !targetWeight || !duration) {
      return res.status(400).json({ message: 'All input fields are required.' });
    }

    // Calculate daily calories for current weight
    const currentCalories = await predictCalories(currentWeight, height, age, gender, activityLevel);

    // Calculate daily calories for target weight
    const targetCalories = await predictCalories(targetWeight, height, age, gender, activityLevel);

    // Calculate daily calorie deficit or surplus needed
    const dailyCalorieChange = (targetCalories - currentCalories) / duration;

    // Initialize lists
    let dailyCaloriesList = [];
    let macronutrientsList = [];

    // Push initial current calories
    dailyCaloriesList.push({
      day: new Date().toISOString().slice(0, 10),
      calories: currentCalories,
    });

    // Calculate daily calories for each day
    for (let i = 0; i < duration - 1; i++) {
      const previousDayCalories = dailyCaloriesList[i].calories;
      const dailyCalories = previousDayCalories + dailyCalorieChange;
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + (i + 1));

      // Push to daily calories list
      dailyCaloriesList.push({
        day: currentDate.toISOString().slice(0, 10),
        calories: dailyCalories,
      });
    }

    // Calculate meal calories based on daily calories distribution
    const mealCalories = dailyCaloriesList.map((dayCalories) => ({
      day: dayCalories.day,
      breakfast: dayCalories.calories * 0.3,
      lunch: dayCalories.calories * 0.4,
      dinner: dayCalories.calories * 0.3,
    }));

    // Function to calculate macronutrients based on given calories
    const calculateMacronutrients = (calories) => ({
      carbohydrates: (calories * 0.65) / 4,
      fats: (calories * 0.2) / 9,
      proteins: (calories * 0.15) / 4,
    });

    // Calculate macronutrients for each meal
    macronutrientsList = mealCalories.map((dayMeals) => ({
      day: dayMeals.day,
      breakfast: calculateMacronutrients(dayMeals.breakfast),
      lunch: calculateMacronutrients(dayMeals.lunch),
      dinner: calculateMacronutrients(dayMeals.dinner),
    }));

    // Delete existing target calories for the user
    await TargetCal.destroy({
      where: {
        userId: userId,
      },
    });

    // Save new target calories and macronutrients to database
    for (let i = 0; i < dailyCaloriesList.length; i++) {
      await TargetCal.create({
        dailyCalories: dailyCaloriesList[i].calories,
        calorieB: mealCalories[i].breakfast,
        carbohydratesB: macronutrientsList[i].breakfast.carbohydrates,
        fatsB: macronutrientsList[i].breakfast.fats,
        proteinsB: macronutrientsList[i].breakfast.proteins,
        calorieL: mealCalories[i].lunch,
        carbohydratesL: macronutrientsList[i].lunch.carbohydrates,
        fatsL: macronutrientsList[i].lunch.fats,
        proteinsL: macronutrientsList[i].lunch.proteins,
        calorieD: mealCalories[i].dinner,
        carbohydratesD: macronutrientsList[i].dinner.carbohydrates,
        fatsD: macronutrientsList[i].dinner.fats,
        proteinsD: macronutrientsList[i].dinner.proteins,
        userId: userId,
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'Successfully calculated target calories and macronutrients',
      currentCalories,
      targetCalories,
      dailyCalorieChange,
      dailyCaloriesList,
      macronutrientsList,
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const postTarget = async (req, res) => {
  try {
    const { userId } = req.user;
    const { targetberatbadan, duration } = req.body;

    // mengecek data input
    if (!targetberatbadan || !duration) {
      return res.status(400).json({
        status: 'Error',
        message: 'Target weight and duration are required.',
      });
    }

    const newTarget = await Target.create({
      targetberatbadan: targetberatbadan,
      userId: userId,
      duration: duration,
    });

    res.status(201).json({
      status: 'Success',
      message: 'Target weight added successfully',
      target: newTarget,
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};
