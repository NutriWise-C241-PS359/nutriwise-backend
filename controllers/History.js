import History from '../model/historymodel.js';
import HistoryCal from '../model/historycalmodel.js';
import Food from '../model/foodmodel.js';
import { Sequelize, Op } from 'sequelize';

export const getAllHistory = async (req, res) => {
  const { userId } = req.user;
  try {
    const history = await HistoryCal.findAll({
      where: { 
        userId: userId
      },
    });
    if (history === undefined) {
      res.status(400).json({
        status: 'Error',
        message: `History is not exist!`,
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'Successfully fetch all history',
      history,
    });
  } catch (error) {
    console.log(`Error: ${error.message}`);
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
    });
  }
};

export const getTotalCaloriesByDate = async (req, res) => {
  const { userId } = req.user;
  const { date } = req.body;

  try {
    // Menggunakan Sequelize untuk menghitung total kalori pada tanggal tertentu
    const totalCalories = await History.findAll({
      attributes: [
        'date',
        [Sequelize.fn('SUM', Sequelize.col('food.energy')), 'totalCalories']
      ],
      where: {
        userId: userId,
        date: {
          [Op.like]: `${date}%`
        }
      },
      include: [
        {
          model: Food,
          as: 'food',
          attributes: [] // Tidak perlu mengambil atribut dari tabel food
        },
      ],
      group: ['date']
    });

    if (totalCalories.length === 0) {
      return res.status(200).json({
        status: 'Error',
        message: `No food history found for date ${date}`,
        history: [],
      });
    }

    const result = totalCalories.map(entry => ({
      date: entry.date,
      totalCalories: entry.get('totalCalories')
    }));

    res.status(200).json({
      status: 'Success',
      message: 'Successfully fetched total calories',
      history: result,
    });
  } catch (error) {
    console.error('Error fetching total calories', error);
    res.status(500).json({
      status: 'Error',
      message: 'Error fetching data',
      error,
    });
  }
};

export const getHistoryByDate = async (req, res) => {
  const { userId } = req.user;

  try {
    const { date, label } = req.body;
    // console.log(date);

    // Gunakan LIKE untuk mencocokkan sebagian tanggal
    const history = await History.findAll({
      where: {
        userId: userId ,
        date: {
          [Op.like]: `${date}%`,
        },
        label: label,
      },
      include: [
        {
          model: Food,
          as: 'food',
          attributes: ['name', 'carbohydrates', 'protein', 'fats', 'energy'],
        },
      ],
    });

    if (history.length === 0) {
      return res.status(200).json({
        status: 'Error',
        message: `No food history found for ${label}`,
        data: [],
      });
    }

    // console.log(JSON.stringify(history, null, 2));
    res.status(200).json({
      status: 'Succes',
      data: history,
    });
  } catch (error) {
    // console.error('Error fetching data', error);
    res.status(500).json({
      status: 'Error',
      message: 'Error fetching data',
      error,
    });
  }
};

export const postHistory = async (req, res) => {
  const { userId } = req.user;
  try {
    const { foodID, label, date } = req.body;

    const food = await Food.findByPk(foodID);

    if (!food) {
      return res.status(404).json({
        status: 'Error',
        message: 'Food not found',
      });
    }

    const newHistory = await History.create({
      userId: userId,
      foodID: foodID,
      label: label,
      date: date,
    });
    
    let historyCal = await HistoryCal.findOne({
      where: {
        userId: userId,
        date: date,
      },
    });

    if (historyCal) {
      // Jika ada, tambahkan kalori dari makanan baru ke nilai kalori yang ada
      historyCal.cal = parseFloat(historyCal.cal) + parseFloat(food.energy);
      await historyCal.save();
    } else {
      // Jika tidak ada, buat entri baru di tabel HistoryCal
      historyCal = await HistoryCal.create({
        cal: food.energy,
        date: date,
        userId: userId,
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'sucessfull add history',
      newHistory,
      historyCal,
    });
  } catch (error) {
    console.log(`Error : ${error.message}`);
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
    });
  }
};
