import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from "./usermodel.js";

const { DataTypes } = Sequelize;

const Target = db.define(
  'target',
  {
    targetberatbadan: {
      type: DataTypes.DOUBLE,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: 'id',
      },
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
  }
);

Users.hasMany(Target, { foreignKey: 'userId' });
Target.belongsTo(Users, { foreignKey: 'userId' });

export default Target;
