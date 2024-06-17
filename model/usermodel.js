import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Users = db.define(
  "users",
  {
    name: {
      type: DataTypes.STRING,
    },
    username: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    usia: {
      type: DataTypes.DOUBLE,
    },
    gender: {
      type: DataTypes.BOOLEAN,
    },
    tinggibadan: {
      type: DataTypes.DOUBLE,
    },
    beratbadan: {
      type: DataTypes.DOUBLE,
    },
    aktivitas: {
      type: DataTypes.STRING,
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
