import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Users = db.define(
  "users",
  {
    name: {
      type: DataTypes.STRING,
    },username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    usia: {
      type: DataTypes.INTEGER,
      defaultValue: 0, 
      allowNull: true, 
    },
    gender: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, 
      allowNull: true, 
    },

    tinggibadan: {
      type: DataTypes.DOUBLE,
      defaultValue: 0, 
      allowNull: true, 
    },
    beratbadan: {
      type: DataTypes.DOUBLE,
      defaultValue: 0, 
      allowNull: true, 
    },
    aktivitas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true, 
    },
    refresh_token: {
      type: DataTypes.TEXT,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Users;