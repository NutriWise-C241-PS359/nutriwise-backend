import { Sequelize } from 'sequelize';
import db from '../config/Database.js';

const { DataTypes } = Sequelize;

const Foods = db.define(
  'df',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    food: {
      type: DataTypes.STRING,
    },
    foodTranslated: {
      type: DataTypes.STRING,
    },
    carbohydrates: {
      type: DataTypes.DOUBLE,
    },
    protein: {
      type: DataTypes.DOUBLE,
    },
    fats: {
      type: DataTypes.BOOLEAN,
    },
    energy: {
      type: DataTypes.DOUBLE,
    },
    source: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Foods;
