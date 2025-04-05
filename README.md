# ⚠️ Warning: Execute with Caution ⚠️

**Do not execute unverified commands in your terminal. Executing database operations or server commands without proper backups can result in data loss. Always ensure you understand the commands before running them.**

## Disclaimer

We are not responsible for any data loss or system issues that may occur from using this software. It is highly recommended that you:
1. Back up your database before running migrations
2. Review all configuration files
3. Understand the system requirements before installation

---

# Gym Management System
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/Django-4.2+-green.svg)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org)

A full-stack gym management solution with:
- Django REST backend
- Next.js admin dashboard
- React Native mobile app
- Expo for cross-platform development

## System Requirements

- Python 3.8+
- Node.js 16+
- npm/yarn
- PostgreSQL (recommended) or SQLite
- Expo CLI (for mobile)
- ngrok (for local testing)

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/AjithCodeCraft/Gym_Management_app.git
cd Gym_Management_app
```

### 2. Backend
```bash
cd backend
```

#### Create and activate virtual environment
```bash
python -m venv venv
```
```bash
source venv/bin/activate  # Linux/macOS
```
```bash
venv\Scripts\activate     # Windows
```

#### Install requirements
```bash
pip install -r requirements.txt
```

### 3. Run Backend Server
```bash
 python manage.py runserver
```
### 4. Frontend Setup (Admin/Trainer)
```bash
cd ../frontend
npm install
npm run dev
```


### 5.ngrok Configuration (For Mobile Testing)

```bash 
ngrok http 8000
```

After running ngrok:

Update application/api/axios.js with your ngrok URL:

Copy
NGROK: {
  baseURL: "YOUR_NGROK_URL/api",
  name: "ngrok",
}

- dont miss that /api while pasting the URL 


### 6. Mobile App Setup
```bash
cd ../application
npm install
npx expo start
```

## 📱 Running the App on Your Mobile Device

To run this app on your mobile device using Expo Go:
### **Method 1: QR Code (WiFi/Hotspot)**

1. **Install Expo Go**  
   Download the Expo Go app on your iOS or Android device.

2. **Scan the QR Code** 
   - Scan the QR code that appears in your terminal with Expo Go

### 🔧 Troubleshooting

If the app doesn't load:

- **Same Network**  
  Ensure your computer and phone are on the **same WiFi network**

- **Alternative Connections**  
  - Try **USB tethering** (connect phone via USB and enable tethering)
  - Or use your phone's **mobile hotspot** for both devices

- **Refresh**  
  Press `r` in the terminal to reload the app



### **Method 2: USB Connection (Recommended for Reliability)**
1. **Enable USB Debugging**:
   - **Android**:  
     - Go to `Settings > About Phone` and tap "Build Number" 7 times  
     - Enable `Developer Options` in Settings  
     - Turn on `USB Debugging`  
   
2. Run:  
  just press on 'a' in terminal 

