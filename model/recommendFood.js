import pool from '../config/Database.js';

async function recommendFood(mealMacros) {
  try {
    // Ambil semua data makanan dari database
    const [data] = await pool.query('SELECT id, name, carbohydrates, protein, fats, energy AS calorie FROM food');
    // console.log(data);

    // Hitung jarak (distance) untuk setiap makanan dalam foodDatabase
    data.forEach((food) => {
      const { carbohydrates, protein, fats, calorie } = food;
      const { carbs: mealCarbs, protein: mealProtein, fats: mealFats, calorie: mealCalorie } = mealMacros;

      // Hitung jarak menggunakan rumus Euclidean Distance
      const distance = Math.sqrt(Math.pow(carbohydrates - mealCarbs, 2) + Math.pow(protein - mealProtein, 2) + Math.pow(fats - mealFats, 2) + Math.pow(calorie - mealCalorie, 2));

      food.distance = distance; // Tambahkan properti distance ke objek food
    });

    // Urutkan berdasarkan distance (dari terkecil ke terbesar)
    data.sort((a, b) => a.distance - b.distance);

    // Ambil 10 rekomendasi teratas
    // const topRecommendations = data.slice(0, 10);

    return data;
  } catch (error) {
    console.error('Error recommending food:', error.message);
    throw error;
  }
}

export default recommendFood;
