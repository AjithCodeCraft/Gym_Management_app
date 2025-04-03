# Gym Management System

Welcome to the Gym Management System! This project aims to streamline gym operations, enhance user experience, and promote a healthier lifestyle through a centralized platform.


## Introduction

The Gym Management System is a comprehensive solution designed to address the challenges faced by gym owners, trainers, and members. By automating routine tasks and providing data-driven insights, the system enhances operational efficiency, improves user engagement, and promotes a healthier lifestyle.

## Features

### User Module
- Workout Tracking, Nutrition Management, Fitness Challenges, Subscription Management, Progress Dashboard, AI Chatbot, Community Interaction, Trainer Interaction, Notifications, Sleep Tracker, Facts of the Day, Profile Management

### Admin Module
- User Management, Trainer Attendance, Salary Management, Membership Management, Payment Management, Reports Generation, Trainer Assignment, Notifications

### Trainer Module
- Attendance Marking, Schedule Management, User Interaction, Salary Tracking, Profile Management

## Installation

### Prerequisites
- Python 3.8+
- Node.js 14+


### Steps

# Clone the Repository
git clone https://github.com/ajithcodecraft/gym_management_app.git
gym_management_app.git

# Set Up Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
cd Gym_Management_systen
python manage.py runserver

# Set Up Frontend
cd ../frontend
npm install
npm run dev

## Technologies Used

- Backend: Django
- Database: NeonDB
- Frontend: Next.js
- AI Integration: TensorFlow
- Payment Integration: Razorpay
- Real-Time Communication: Socket.io
- Notifications: Firebase Cloud Messaging (FCM)
- Third-Party APIs: USDA FoodData Central API, Healthline API

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
