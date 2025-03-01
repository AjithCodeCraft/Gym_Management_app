import axios from 'axios';

const API_KEY = 'YOUR_API_KEY'; // Replace with your MyFitnessPal API key

export const fetchFoodData = async (query) => {
  try {
    const response = await axios.get(
      `https://myfitnesspal2.p.rapidapi.com/food/search?query=${query}`,
      {
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'myfitnesspal2.p.rapidapi.com',
        },
      }
    );
    return response.data.results; // Adjust based on API response structure
  } catch (error) {
    console.error('Error fetching food data:', error);
    return [];
  }
};