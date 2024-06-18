import express from 'express';
import { getUsers, Register, Login, updateUser } from '../controllers/Users.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { refreshToken } from '../controllers/RefreshToken.js';
import { getAllHistory, getHistoryByDate, postHistory } from '../controllers/History.js';
import { getPredictHistory, getUserDailyIntake, predictCal, recFood, updatePredictData } from '../controllers/Predict.js';
import { calculateTargetCalories, postTarget } from '../controllers/Target.js';

const router = express.Router();

router.post('/register', Register);
router.post('/login', Login);
router.post('/addFood', verifyToken, postHistory);
router.post('/targetData', verifyToken, calculateTargetCalories);
router.post('/recommend', verifyToken, recFood);
router.post('/target', verifyToken, postTarget);

router.get('/historyPredict',verifyToken, getPredictHistory);
router.get('/allhistory',verifyToken, getAllHistory);
router.get('/predictCal', verifyToken, predictCal);
router.get('/token', refreshToken);
router.get('/users', verifyToken, getUsers);
router.get('/history', verifyToken, getHistoryByDate);
// router.get('/bebas',verifyToken, predictCal);
// router.get('/dailyreport', verifyToken, getUserDailyIntake);

router.put('/updateUser', verifyToken, updateUser);
router.put('/updatePredict',verifyToken, updatePredictData);

export default router;
