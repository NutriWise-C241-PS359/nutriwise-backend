import { Sequelize } from 'sequelize';
import db from '../config/Database.js';

const { DataTypes } = Sequelize;

const Target = db.define(
  'target',
  {
    id: {
      type: DataTypes.INTEGER,
    },
    targetberatbadan: {
      type: DataTypes.DOUBLE,
    },
    userID: {
      type: DataTypes.INTEGER,
    },
    startdate: {
      type: DataTypes.DATE,
    },
    enddate: {
      type: DataTypes.DATE,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Target;
