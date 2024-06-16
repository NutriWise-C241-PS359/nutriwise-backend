import { where } from 'sequelize';
import Users from '../model/usermodel.js'; // Pastikan path dan ekstensi file sudah benar
import jwt from 'jsonwebtoken';

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401); // Tidak ada refresh token

    const user = await Users.findAll({
      where: {
        refresh_token: refreshToken, // Cari pengguna berdasarkan refresh token
      },
    });

    if (!user[0]) return res.sendStatus(403); // Pengguna tidak ditemukan

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403); // Token tidak valid atau kadaluarsa

      // Ekstrak data pengguna dari hasil pencarian
      const { id: userId, name, username, usia, gender, tinggibadan, beratbadan } = user[0];

      // Buat access token baru
      const accessToken = jwt.sign({ userId, name, username, usia, gender, tinggibadan, beratbadan }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s' });

      res.json({ accessToken }); // Kirimkan access token baru sebagai respons
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // Pastikan mengirim respons jika terjadi kesalahan
  }
};
