import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./usermodel.js";

const { DataTypes } = Sequelize;

const Predict = db.define(
  "predict",
  {
    dailyCalories: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    calorieB: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    carbohydratesB: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    fatsB: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    proteinsB: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    calorieL: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    carbohydratesL: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    fatsL: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    proteinsL: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    calorieD: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    carbohydratesD: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    fatsD: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    proteinsD: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    addCalorieB: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      allowNull: true,
    },
    addCalorieL: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      allowNull: true,
    },
    addCalorieD: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      allowNull: true,
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

Users.hasMany(Predict, { foreignKey: 'userId' });
Predict.belongsTo(Users, { foreignKey: 'userId' });

export default Predict;