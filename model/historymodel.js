import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Food from './foodmodel.js';
import Users from "./usermodel.js";

const { DataTypes } = Sequelize;

const History = db.define(
  'history',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    foodID: {
      type: DataTypes.INTEGER,
      references: {
        model: Food,
        key: 'id',
      },
    },
    label: {
      type: DataTypes.STRING,
    },
    date: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: 'id',
      },
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

Food.hasMany(History, { foreignKey: 'foodID' });
History.belongsTo(Food, { as: 'food', foreignKey: 'foodID' });

Users.hasMany(History, { foreignKey: 'userId' });
History.belongsTo(Users, { foreignKey: 'userId' });

export default History;
