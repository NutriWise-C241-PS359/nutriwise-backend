import Users from '../model/usermodel.js';
import { predictCalories } from '../services/loadModel.js';
import recommendFood from '../services/recommendFood.js';
import Predict from '../model/prediksimodel.js';

export const getUserDailyIntake = async (req, res) => {
  const { userID } = req.user;

  if (!userID) {
    return res.status(400).json({
      status: 'Error',
      message: 'Missing user ID',
    });
  }
  try {
    // Query untuk mendapatkan data berdasarkan userID
    const records = await Predict.findAll({
      where: { userID },
    });

    // Inisialisasi objek hasil
    const result = {
      dailycalorie: 0,
      breakfast: [],
      lunch: [],
      dinner: [],
    };

    // Proses setiap record untuk membangun struktur JSON
    records.forEach((record) => {
      const { calorie, carbs, protein, label } = record.dataValues;
      result.dailycalorie += calorie;

      const meal = {
        calorie,
        carbs,
        protein,
      };

      if (label === 'breakfast') {
        result.breakfast.push(meal);
      } else if (label === 'lunch') {
        result.lunch.push(meal);
      } else if (label === 'dinner') {
        result.dinner.push(meal);
      }
    });
    res.status(200).json({
      status: 'Success',
      message: 'Predictions retrieved successfully',
      result,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

export const getPredictHistory = async (req, res) => {
  const { userId } = req.user; 

  try {
    // Fetch prediction data for the user
    const temp = await Predict.findOne({ where: { userId } });

    if (!temp) {
      return res.status(404).json({
        status: 'Error',
        message: 'No prediction data found for the user',
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'Prediction data fetched successfully',
      temp,
    });
  } catch (error) {
    console.error('Error fetching prediction data:', error);
    res.status(500).json({
      status: 'Error',
      message: 'An error occurred while fetching prediction data',
    });
  }
};

export const predictCal = async (req, res) => {
  const { userId } = req.user;

  try {
    // Ambil data pengguna dari tabel Users
    const user = await Users.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        status: 'Error',
        message: 'User not found',
      });
    }
    // langsung ambil dari data user
    const { beratbadan, tinggibadan, usia, gender, aktivitas } = user;
    // const { beratbadan, tinggibadan, usia, gender, aktivitas } = req.body;

    // if (!beratbadan || !tinggibadan || !usia || !genderBinary || !aktivitas) {
    //   return res.status(400).json({
    //     status: 'Error',
    //     message: `Missing required user data ${beratbadan} ${tinggibadan} ${usia} ${genderBinary} ${aktivitas}`,
    //   });
    // }

    const dailyCalories = await predictCalories(beratbadan, tinggibadan, usia, gender, aktivitas);

    const mealCalories = {
      breakfast: dailyCalories * 0.3,
      lunch: dailyCalories * 0.4,
      dinner: dailyCalories * 0.3,
    };

    const calculateMacronutrients = (calories) => ({
      carbohydrates: (calories * 0.65) / 4,
      fats: (calories * 0.2) / 9,
      proteins: (calories * 0.15) / 4,
    });

    const result = {
      dailyCalories,
      breakfast: {
        calories: mealCalories.breakfast,
        macronutrients: calculateMacronutrients(mealCalories.breakfast),
      },
      lunch: {
        calories: mealCalories.lunch,
        macronutrients: calculateMacronutrients(mealCalories.lunch),
      },
      dinner: {
        calories: mealCalories.dinner,
        macronutrients: calculateMacronutrients(mealCalories.dinner),
      },
    };

    // Check if prediction data for the user already exists
    const existingReport = await Predict.findOne({ where: { userId } });

    if (existingReport) {
      // Update the existing prediction
      await Predict.update(
        {
          dailyCalories: result.dailyCalories,
          calorieB: result.breakfast.calories,
          carbohydratesB: result.breakfast.macronutrients.carbohydrates,
          proteinsB: result.breakfast.macronutrients.proteins,
          fatsB: result.breakfast.macronutrients.fats,
          calorieL: result.lunch.calories,
          carbohydratesL: result.lunch.macronutrients.carbohydrates,
          proteinsL: result.lunch.macronutrients.proteins,
          fatsL: result.lunch.macronutrients.fats,
          calorieD: result.dinner.calories,
          carbohydratesD: result.dinner.macronutrients.carbohydrates,
          proteinsD: result.dinner.macronutrients.proteins,
          fatsD: result.dinner.macronutrients.fats,
          addCalorieB: 0,
          addCalorieL: 0,
          addCalorieD: 0,
        },
        { where: { userId } }
      );
    } else {
      // Create a new prediction
      await Predict.create({
        userId,
        dailyCalories: result.dailyCalories,
        calorieB: result.breakfast.calories,
        carbohydratesB: result.breakfast.macronutrients.carbohydrates,
        proteinsB: result.breakfast.macronutrients.proteins,
        fatsB: result.breakfast.macronutrients.fats,
        calorieL: result.lunch.calories,
        carbohydratesL: result.lunch.macronutrients.carbohydrates,
        proteinsL: result.lunch.macronutrients.proteins,
        fatsL: result.lunch.macronutrients.fats,
        calorieD: result.dinner.calories,
        carbohydratesD: result.dinner.macronutrients.carbohydrates,
        proteinsD: result.dinner.macronutrients.proteins,
        fatsD: result.dinner.macronutrients.fats,
        addCalorieB: 0,
        addCalorieL: 0,
        addCalorieD: 0,
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'Calculate calorie successfully',
      result,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: error.message,
    });
  }
};

export const updatePredictData = async (req, res) => {
  const { userId } = req.user;
  const { dailyCalories, calorieB, carbohydratesB, fatsB, proteinsB, calorieL, carbohydratesL, fatsL, proteinsL, calorieD, carbohydratesD, fatsD, proteinsD, addCalorieB, addCalorieL, addCalorieD } = req.body;

  try {
    // Cek apakah ada data Predict berdasarkan userId yang sedang login
    const predictData = await Predict.findOne({ where: { userId } });

    if (!predictData) {
      return res.status(404).json({
        status: 'Error',
        message: `Predict data for userId ${userId} not found`,
      });
    }

    // Lakukan update data yang diperlukan
    await predictData.update({
      dailyCalories,
      calorieB,
      carbohydratesB,
      fatsB,
      proteinsB,
      calorieL,
      carbohydratesL,
      fatsL,
      proteinsL,
      calorieD,
      carbohydratesD,
      fatsD,
      proteinsD,
      addCalorieB,
      addCalorieL,
      addCalorieD,
    });

    res.status(200).json({
      status: 'Success',
      message: `Predict data for userId ${userId} updated successfully`,
      updatedPredictData: predictData,
    });
  } catch (error) {
    console.error('Error updating predict data:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
    });
  }
};

export const recFood = async (req, res) => {
  try {
    const { carbs, protein, fats, calorie } = req.body; // nilai makronutrien sudah diberikan dari pengguna

    const mealMacros = {
      carbs: parseFloat(carbs),
      protein: parseFloat(protein),
      fats: parseFloat(fats),
      calorie: parseFloat(calorie),
    };

    const recommendations = await recommendFood(mealMacros);
    res.status(200).json({
      status: 'Success',
      message: 'Food recommendation',
      result: recommendations,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: error.message,
    });
  }
};
