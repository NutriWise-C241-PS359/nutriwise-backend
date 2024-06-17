import express from 'express';
import { getUsers, Register, Login, updateUser, predictCal, recFood } from '../controllers/Users.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { refreshToken } from '../controllers/RefreshToken.js';
import { getAllHistory, getHistoryByDate, postHistory } from '../controllers/History.js';

const router = express.Router();

router.post('/register', Register);
router.post('/login', Login);
router.post('/predictCal', predictCal);
router.post('/newHistory', postHistory);

router.get('/recommend', recFood);
router.get('/token', refreshToken);
router.get('/users', verifyToken, getUsers);
router.get('/history', getHistoryByDate);

router.put('/updateUser', verifyToken, updateUser);

export default router;
