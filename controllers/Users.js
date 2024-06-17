import Users from '../model/usermodel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { predictCalories } from '../model/loadModel.js';
import recommendFood from '../model/recommendFood.js';

export const getUsers = async (req, res) => {
  try {
    const loggedInUsername = req.user.username;
    const loggedInUser = await Users.findOne({
      where: { username: loggedInUsername },
      attributes: ['name', 'username', 'usia', 'gender', 'tinggibadan', 'beratbadan', 'aktivitas'],
    });

    if (loggedInUser) {
      res.status(200).json({
        status: 'Success',
        user: loggedInUser,
      });
    } else {
      res.status(404).json({
        status: 'Error',
        message: 'User not found',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'Error',
      message: 'An error occurred',
    }); // Mengirimkan respons 500 jika terjadi kesalahan
  }
};

// Fungsi untuk mendaftarkan pengguna baru
export const Register = async (req, res) => {
  const { name, username, password, usia, gender, tinggibadan, beratbadan, aktivitas } = req.body;

  try {
    // Cek apakah username sudah ada
    const existingUser = await Users.findOne({
      where: { username },
    });

    if (existingUser) {
      // Jika username sudah ada, kembalikan error dengan status 400
      return res.status(400).json({
        status: 'Error',
        message: `User with username ${username} already exist!`,
      });
    }

    // Enkripsi password
    const salt = await bcrypt.genSalt();
    const hashpassword = await bcrypt.hash(password, salt);

    // Buat user baru
    await Users.create({
      name,
      username,
      password: hashpassword,
      usia,
      gender,
      tinggibadan,
      beratbadan,
      aktivitas,
    });

    // Return response sebagai teks biasa dengan newline setelah status
    res.status(200).json({
      status: 'Success',
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'Error',
      message: 'Registration failed due to an internal error.',
    });
  }
};

// Fungsi untuk login pengguna
export const Login = async (req, res) => {
  try {
    // Mencari user berdasarkan username
    const user = await Users.findOne({
      where: {
        username: req.body.username,
      },
    });

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(404).json({
        status: 'Error',
        message: `User with username ${req.body.username} not found!`,
      });
    }

    // Memeriksa apakah password sesuai
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.status(400).json({
        status: 'Error',
        message: 'Wrong password!',
      });
    }

    // Jika password cocok, buat token dan kirimkan respons
    const userId = user.id;
    const name = user.name;
    const username = user.username;
    const usia = user.usia;
    const gender = user.gender;
    const tinggibadan = user.tinggibadan;
    const beratbadan = user.beratbadan;
    const aktivitas = user.aktivitas;
    const accessToken = jwt.sign({ userId, name, username, usia, gender, tinggibadan, beratbadan, aktivitas }, process.env.ACCESS_TOKEN_SECRET);
    const refreshToken = jwt.sign({ userId, name, username, usia, gender, tinggibadan, beratbadan, aktivitas }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '1d',
    });

    // Update refresh token di database
    await Users.update(
      { refresh_token: refreshToken },
      {
        where: {
          id: userId,
        },
      }
    );

    // Mengatur cookie untuk refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 100,
      secure: true,
    });

    // Mengirimkan respons dalam format teks yang diinginkan
    res.status(200).json({
      status: 'success',
      message: 'User login successfully',
      user: {
        name,
        token: accessToken,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'Error',
      message: 'An internal error occurred during login.',
    });
  }
};

export const updateUser = async (req, res) => {
  const { tinggibadan, beratbadan, usia, gender, aktivitas } = req.body;
  const { userId } = req.user; // Mengambil userId dari token pengguna yang sedang login

  try {
    // Cari pengguna berdasarkan userId
    const user = await Users.findByPk(userId);

    // Jika pengguna tidak ditemukan
    if (!user) {
      return res.status(404).json({
        status: 'Error',
        message: 'User not found!',
      });
    }

    // Update data pengguna dengan data baru jika tersedia
    user.gender = gender || user.gender;
    user.usia = usia || usia.gender;
    user.tinggibadan = tinggibadan || user.tinggibadan;
    user.beratbadan = beratbadan || user.beratbadan;
    user.aktivitas = aktivitas || user.aktivitas;

    // Simpan perubahan ke database
    await user.save();

    // Mengirimkan respons yang diformat secara manual dalam bentuk teks
    res.status(200).json({
      status: 'Success',
      message: 'Profile updated successfully!',
      user: {
        name: user.name,
        username: user.username,
        usia: user.usia,
        gender: user.gender,
        tinggibadan: user.tinggibadan,
        beratbadan: user.beratbadan,
        aktivitas: user.aktivitas,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'Error',
      message: 'An error occurred while updating profile',
    });
  }
};

export const predictCal = async (req, res) => {
  const { weight, height, age, gender, activityLevel } = req.body;

  if (!weight || !height || !age || !gender || !activityLevel) {
    return res.status(400).json({
      status: 'Error',
      message: 'Missing required fields',
    });
  }

  try {
    const dailyCalories = await predictCalories(weight, height, age, gender, activityLevel);

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
      result: recommendations
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: error.message,
    });
  }
};
