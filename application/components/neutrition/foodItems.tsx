export type FoodItem = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export const dummyFoods: FoodItem[] = [
  // Indian Breakfast Items
  { id: '1', name: 'Idli', calories: 39, protein: 2, carbs: 8, fats: 0.2 },
  { id: '2', name: 'Dosa', calories: 168, protein: 3, carbs: 30, fats: 3.7 },
  { id: '3', name: 'Upma', calories: 250, protein: 5, carbs: 40, fats: 8 },
  { id: '4', name: 'Poha', calories: 180, protein: 4, carbs: 32, fats: 5 },
  { id: '5', name: 'Paratha', calories: 300, protein: 6, carbs: 45, fats: 10 },
  { id: '6', name: 'Aloo Paratha', calories: 320, protein: 7, carbs: 50, fats: 11 },
  { id: '7', name: 'Chole Bhature', calories: 450, protein: 12, carbs: 65, fats: 15 },
  { id: '8', name: 'Pongal', calories: 210, protein: 6, carbs: 30, fats: 7 },
  { id: '9', name: 'Masala Dosa', calories: 350, protein: 7, carbs: 60, fats: 8 },
  { id: '10', name: 'Appam', calories: 120, protein: 2, carbs: 22, fats: 2 },

  // Indian Curries & Gravies
  { id: '11', name: 'Paneer Butter Masala', calories: 320, protein: 12, carbs: 20, fats: 22 },
  { id: '12', name: 'Dal Tadka', calories: 180, protein: 9, carbs: 24, fats: 5 },
  { id: '13', name: 'Palak Paneer', calories: 290, protein: 15, carbs: 18, fats: 20 },
  { id: '14', name: 'Chicken Curry', calories: 340, protein: 30, carbs: 8, fats: 20 },
  { id: '15', name: 'Mutton Curry', calories: 400, protein: 32, carbs: 5, fats: 28 },
  { id: '16', name: 'Rajma', calories: 230, protein: 12, carbs: 35, fats: 5 },
  { id: '17', name: 'Sambar', calories: 150, protein: 8, carbs: 22, fats: 4 },
  { id: '18', name: 'Bhindi Masala', calories: 140, protein: 4, carbs: 15, fats: 8 },
  { id: '19', name: 'Aloo Gobi', calories: 180, protein: 5, carbs: 20, fats: 9 },
  { id: '20', name: 'Chana Masala', calories: 210, protein: 11, carbs: 30, fats: 5 },

  // Rice Varieties
  { id: '21', name: 'Plain Rice', calories: 130, protein: 2, carbs: 28, fats: 0.3 },
  { id: '22', name: 'Biryani', calories: 450, protein: 22, carbs: 60, fats: 15 },
  { id: '23', name: 'Curd Rice', calories: 200, protein: 6, carbs: 30, fats: 5 },
  { id: '24', name: 'Lemon Rice', calories: 250, protein: 4, carbs: 35, fats: 10 },
  { id: '25', name: 'Tomato Rice', calories: 260, protein: 5, carbs: 40, fats: 8 },

  // Roti/Naan/Indian Breads
  { id: '26', name: 'Chapati', calories: 120, protein: 3, carbs: 20, fats: 3 },
  { id: '27', name: 'Naan', calories: 270, protein: 7, carbs: 45, fats: 6 },
  { id: '28', name: 'Tandoori Roti', calories: 150, protein: 4, carbs: 25, fats: 3 },

  // Snacks
  { id: '29', name: 'Samosa', calories: 260, protein: 5, carbs: 32, fats: 12 },
  { id: '30', name: 'Pakora', calories: 200, protein: 4, carbs: 25, fats: 10 },
  { id: '31', name: 'Murukku', calories: 180, protein: 3, carbs: 20, fats: 10 },
  { id: '32', name: 'Pani Puri', calories: 150, protein: 2, carbs: 22, fats: 5 },

  // Desserts
  { id: '33', name: 'Gulab Jamun', calories: 175, protein: 2, carbs: 30, fats: 6 },
  { id: '34', name: 'Rasgulla', calories: 106, protein: 2, carbs: 25, fats: 0.5 },
  { id: '35', name: 'Kheer', calories: 200, protein: 6, carbs: 35, fats: 5 },

  // Beverages
  { id: '36', name: 'Masala Chai', calories: 90, protein: 2, carbs: 15, fats: 3 },
  { id: '37', name: 'Lassi', calories: 250, protein: 8, carbs: 35, fats: 8 },
  { id: '38', name: 'Buttermilk', calories: 60, protein: 3, carbs: 8, fats: 2 },

  // Protein Sources
  { id: '39', name: 'Paneer', calories: 265, protein: 18, carbs: 5, fats: 20 },
  { id: '40', name: 'Tofu', calories: 144, protein: 15, carbs: 3, fats: 9 },

  // Add remaining 560 items (international foods, fruits, vegetables, etc.)

  // Examples:
  { id: '41', name: 'Quinoa', calories: 120, protein: 4, carbs: 21, fats: 2 },
  { id: '42', name: 'Broccoli', calories: 55, protein: 5, carbs: 11, fats: 0.5 },
  { id: '43', name: 'Almonds', calories: 170, protein: 6, carbs: 6, fats: 15 },
  { id: '44', name: 'Pasta', calories: 220, protein: 7, carbs: 43, fats: 1.3 },
  { id: '45', name: 'Pizza', calories: 285, protein: 12, carbs: 36, fats: 10 },

  { id: '46', name: 'Poha', calories: 250, protein: 5, carbs: 50, fats: 5 },
  { id: '47', name: 'Upma', calories: 230, protein: 6, carbs: 45, fats: 4 },
  { id: '48', name: 'Idli', calories: 39, protein: 2, carbs: 8, fats: 0.1 },
  { id: '49', name: 'Dosa', calories: 168, protein: 3, carbs: 30, fats: 4 },
  { id: '50', name: 'Sambar', calories: 150, protein: 6, carbs: 22, fats: 4 },
  { id: '51', name: 'Rajma', calories: 260, protein: 15, carbs: 40, fats: 2 },
  { id: '52', name: 'Chole', calories: 270, protein: 14, carbs: 42, fats: 5 },
  { id: '53', name: 'Dal Tadka', calories: 180, protein: 9, carbs: 24, fats: 6 },
  { id: '54', name: 'Paneer Bhurji', calories: 300, protein: 15, carbs: 10, fats: 22 },
  { id: '55', name: 'Palak Paneer', calories: 240, protein: 12, carbs: 14, fats: 16 },
  { id: '56', name: 'Aloo Paratha', calories: 320, protein: 6, carbs: 45, fats: 12 },
  { id: '57', name: 'Curd Rice', calories: 280, protein: 8, carbs: 45, fats: 7 },
  { id: '58', name: 'Khichdi', calories: 250, protein: 10, carbs: 40, fats: 5 },
  { id: '59', name: 'Masala Oats', calories: 200, protein: 7, carbs: 35, fats: 3 },
  { id: '60', name: 'Pongal', calories: 280, protein: 8, carbs: 45, fats: 7 },
  { id: '61', name: 'Ragi Mudde', calories: 220, protein: 4, carbs: 48, fats: 1 },
  { id: '62', name: 'Vegetable Pulao', calories: 270, protein: 6, carbs: 48, fats: 6 },
  { id: '63', name: 'Fish Curry', calories: 250, protein: 25, carbs: 5, fats: 12 },
  { id: '64', name: 'Mutton Curry', calories: 340, protein: 28, carbs: 6, fats: 22 },
  { id: '65', name: 'Chicken Tikka', calories: 270, protein: 30, carbs: 5, fats: 12 },
  { id: '66', name: 'Tandoori Roti', calories: 120, protein: 4, carbs: 22, fats: 2 },
  { id: '67', name: 'Baingan Bharta', calories: 180, protein: 5, carbs: 20, fats: 10 },
  { id: '68', name: 'Bhindi Fry', calories: 160, protein: 3, carbs: 18, fats: 10 },
  { id: '69', name: 'Mixed Vegetable Curry', calories: 220, protein: 5, carbs: 28, fats: 9 },
  { id: '70', name: 'Methi Thepla', calories: 150, protein: 4, carbs: 25, fats: 4 },
  { id: '71', name: 'Gobi Paratha', calories: 280, protein: 7, carbs: 45, fats: 8 },
  { id: '72', name: 'Vegetable Sandwich', calories: 240, protein: 8, carbs: 40, fats: 6 },
  { id: '73', name: 'Egg Bhurji', calories: 200, protein: 14, carbs: 4, fats: 14 },
  { id: '74', name: 'Dal Makhani', calories: 320, protein: 12, carbs: 32, fats: 18 },
  { id: '75', name: 'Kadhi', calories: 190, protein: 7, carbs: 22, fats: 8 },
  { id: '76', name: 'Gajar Halwa', calories: 280, protein: 6, carbs: 45, fats: 10 },
  { id: '77', name: 'Chicken Biryani', calories: 360, protein: 25, carbs: 45, fats: 12 },
  { id: '78', name: 'Mutton Biryani', calories: 420, protein: 28, carbs: 45, fats: 18 },
  { id: '79', name: 'Pani Puri', calories: 250, protein: 5, carbs: 40, fats: 10 },
  { id: '80', name: 'Chaat', calories: 300, protein: 8, carbs: 50, fats: 8 },
  { id: '81', name: 'Rasgulla', calories: 150, protein: 4, carbs: 30, fats: 2 },
  { id: '82', name: 'Gulab Jamun', calories: 190, protein: 3, carbs: 30, fats: 7 },
  { id: '83', name: 'Kaju Katli', calories: 160, protein: 5, carbs: 20, fats: 8 },
  { id: '84', name: 'Besan Laddu', calories: 200, protein: 6, carbs: 25, fats: 10 },
  { id: '85', name: 'Thalipeeth', calories: 250, protein: 8, carbs: 35, fats: 8 },
  { id: '86', name: 'Lassi', calories: 220, protein: 6, carbs: 28, fats: 8 },
  { id: '87', name: 'Buttermilk', calories: 60, protein: 3, carbs: 8, fats: 2 },
  { id: '88', name: 'Sprouts Salad', calories: 120, protein: 9, carbs: 18, fats: 1 },
  { id: '89', name: 'Moong Dal Chilla', calories: 180, protein: 12, carbs: 22, fats: 4 },
  { id: '90', name: 'Sabudana Khichdi', calories: 330, protein: 5, carbs: 60, fats: 10 },
  { id: '91', name: 'Dhokla', calories: 180, protein: 7, carbs: 30, fats: 4 },
  { id: '92', name: 'Chana Chaat', calories: 200, protein: 12, carbs: 30, fats: 4 },
  { id: '93', name: 'Vegetable Soup', calories: 90, protein: 3, carbs: 18, fats: 2 },
  { id: '94', name: 'Sweet Corn', calories: 150, protein: 5, carbs: 30, fats: 1 },
  { id: '95', name: 'Papaya', calories: 60, protein: 0.6, carbs: 15, fats: 0.1 },
  { id: '96', name: 'Guava', calories: 90, protein: 2, carbs: 20, fats: 1 },
  { id: '97', name: 'Pomegranate', calories: 130, protein: 3, carbs: 30, fats: 1 },
  { id: '98', name: 'Chikoo', calories: 140, protein: 0.5, carbs: 35, fats: 1 },
  { id: '99', name: 'Coconut Water', calories: 45, protein: 0.5, carbs: 9, fats: 0 },
  { id: '100', name: 'Tender Coconut', calories: 80, protein: 1, carbs: 15, fats: 1 },
  { id: '101', name: 'Whey Protein (1 scoop)', calories: 120, protein: 24, carbs: 2, fats: 1 },
  { id: '102', name: 'Casein Protein (1 scoop)', calories: 110, protein: 23, carbs: 3, fats: 1 },
  { id: '103', name: 'Peanut Butter (1 tbsp)', calories: 95, protein: 4, carbs: 3, fats: 8 },
  { id: '104', name: 'Almonds (10 pieces)', calories: 70, protein: 3, carbs: 2, fats: 6 },
  { id: '105', name: 'Walnuts (5 halves)', calories: 65, protein: 1.5, carbs: 1.5, fats: 6 },
  { id: '106', name: 'Oats (50g)', calories: 190, protein: 7, carbs: 34, fats: 3 },
  { id: '107', name: 'Quinoa (50g)', calories: 120, protein: 4, carbs: 21, fats: 2 },
  { id: '108', name: 'Chia Seeds (1 tbsp)', calories: 60, protein: 2, carbs: 5, fats: 4 },
  { id: '109', name: 'Greek Yogurt (200g)', calories: 120, protein: 10, carbs: 6, fats: 4 },
  { id: '110', name: 'Tofu (100g)', calories: 76, protein: 8, carbs: 2, fats: 4 },
  { id: '111', name: 'Salmon (100g)', calories: 208, protein: 22, carbs: 0, fats: 13 },
  { id: '112', name: 'Tuna (100g)', calories: 130, protein: 28, carbs: 0, fats: 1 },
  { id: '113', name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fats: 3 },
  { id: '114', name: 'Egg (1 large)', calories: 70, protein: 6, carbs: 0.5, fats: 5 },
  { id: '115', name: 'Brown Rice (100g)', calories: 111, protein: 2.6, carbs: 23, fats: 0.9 },
  { id: '116', name: 'Sweet Potato (100g)', calories: 86, protein: 2, carbs: 20, fats: 0.1 },
  { id: '117', name: 'Avocado (100g)', calories: 160, protein: 2, carbs: 9, fats: 15 },
  { id: '118', name: 'Broccoli (100g)', calories: 34, protein: 2.8, carbs: 6.6, fats: 0.4 },
  { id: '119', name: 'Spinach (100g)', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4 },
  { id: '120', name: 'Cottage Cheese (100g)', calories: 98, protein: 11, carbs: 3, fats: 4.3 },
  { id: '121', name: 'Protein Bar', calories: 200, protein: 20, carbs: 20, fats: 7 },
  { id: '122', name: 'Granola Bar', calories: 130, protein: 3, carbs: 24, fats: 3 },
  { id: '123', name: 'Olive Oil (1 tbsp)', calories: 120, protein: 0, carbs: 0, fats: 14 },
  { id: '124', name: 'Coconut Oil (1 tbsp)', calories: 117, protein: 0, carbs: 0, fats: 14 },
  { id: '125', name: 'Cheddar Cheese (30g)', calories: 120, protein: 7, carbs: 1, fats: 10 },
  { id: '126', name: 'Mozzarella (30g)', calories: 85, protein: 6, carbs: 1, fats: 6 },
  { id: '127', name: 'Pizza (1 slice)', calories: 285, protein: 12, carbs: 36, fats: 10 },
  { id: '128', name: 'Burger', calories: 350, protein: 20, carbs: 40, fats: 15 },
  { id: '129', name: 'French Fries (100g)', calories: 312, protein: 3.4, carbs: 41, fats: 15 },
  { id: '130', name: 'Pasta (100g)', calories: 131, protein: 5, carbs: 25, fats: 1.1 },
  { id: '131', name: 'Ice Cream (100g)', calories: 207, protein: 3.5, carbs: 24, fats: 11 },
  { id: '132', name: 'Dark Chocolate (30g)', calories: 170, protein: 2, carbs: 13, fats: 12 },
  { id: '133', name: 'Popcorn (50g)', calories: 180, protein: 3, carbs: 36, fats: 4 },
  { id: '134', name: 'Nachos (100g)', calories: 325, protein: 6, carbs: 52, fats: 12 },
  { id: '135', name: 'Burrito', calories: 320, protein: 15, carbs: 40, fats: 12 },
  { id: '136', name: 'Sushi (6 pcs)', calories: 200, protein: 12, carbs: 30, fats: 3 },
  { id: '137', name: 'Kimchi', calories: 15, protein: 1, carbs: 3, fats: 0.2 },
  { id: '138', name: 'Miso Soup', calories: 40, protein: 3, carbs: 5, fats: 1 },
  { id: '139', name: 'Ramen', calories: 400, protein: 12, carbs: 60, fats: 12 },
  { id: '140', name: 'Falafel', calories: 333, protein: 13, carbs: 31, fats: 17 },
  { id: '141', name: 'Hummus (2 tbsp)', calories: 70, protein: 2, carbs: 4, fats: 5 },
  { id: '142', name: 'Shawarma', calories: 300, protein: 20, carbs: 30, fats: 10 },
  { id: '143', name: 'Caesar Salad', calories: 200, protein: 7, carbs: 10, fats: 15 },
  { id: '144', name: 'Green Smoothie', calories: 150, protein: 5, carbs: 30, fats: 1 },
  { id: '145', name: 'Protein Shake', calories: 200, protein: 30, carbs: 10, fats: 5 },
  { id: '146', name: 'Matcha Latte', calories: 140, protein: 5, carbs: 20, fats: 3 },
  { id: '147', name: 'Churros (2 pcs)', calories: 220, protein: 3, carbs: 25, fats: 12 },
  { id: '148', name: 'Tacos', calories: 200, protein: 12, carbs: 20, fats: 8 },
  { id: '149', name: 'Donut', calories: 300, protein: 4, carbs: 45, fats: 15 },
  { id: '150', name: 'Brownie', calories: 250, protein: 3, carbs: 35, fats: 12 },



  // Continue until 600...
];
