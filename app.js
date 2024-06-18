import express from 'express';
import dotenv from 'dotenv';
import db from './config/Database.js';
import cookieParser from 'cookie-parser';
import Users from './model/usermodel.js';
import History from './model/historymodel.js';
import Predict from './model/prediksimodel.js';
import router from './routes/index.js';
import Historycal from './model/historycalmodel.js';
import Target from './model/targetmodel.js';
import Targetcal from './model/targetcalmodel.js';
dotenv.config();
const app = express();

try {
  await db.authenticate();
  console.log('Database connected');
  await Users.sync();
  await Predict.sync();
  await History.sync();
  await Historycal.sync();
  await Target.sync();
  await Targetcal.sync();
} catch (error) {
  console.error(error);
}

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
