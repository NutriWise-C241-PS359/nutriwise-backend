import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './usermodel.js';

const { DataTypes } = Sequelize;

const Historycal = db.define(
  'historycal',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cal: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
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

Users.hasMany(Historycal, { foreignKey: 'userId' });
Historycal.belongsTo(Users, { foreignKey: 'userId' });

export default Historycal;
