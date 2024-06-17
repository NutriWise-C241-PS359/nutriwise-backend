import History from '../model/historymodel.js';
import Foods from '../model/foodmodel.js';

export const getAllHistory = async (req, res) => {
  try {
    const history = await History.findAll();
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

export const getHistoryByDate = async (req, res) => {
  try {
    const { date } = req.body; // Mengambil parameter date dari URL
    console.log(`Date parameter: ${date}`);

    const history = await History.findAll({
      where: {
        date: `${date}` 
      },
      include: [
        {
          model: Foods,
          as: 'food',
          attributes: ['name','carbohydrates','protein','fats','energy'],
        },
      ],
    });

    if (history.length === 0) {
      return res.status(404).json({
        status: 'Error',
        message: 'No history found for the given date',
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'Successfully fetched history by date',
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

export const postHistory = async (req, res) => {
  try {
    const { foodID, label, date } = req.body;

    const newHistory = await History.create({
      foodID: foodID,
      label: label,
      date: date,
    });

    res.status(200).json({
      status: 'Success',
      message: 'sucessfull add history',
      newHistory,
    });
  } catch (error) {
    console.log(`Error : ${error.message}`);
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
    });
  }
};
