# Real Estate Frontend (React)

A modern React application for browsing and managing real estate properties.

## Features

- Property listing with search and filters
- Property detail pages with image gallery
- User authentication (Email/Password + Phone OTP)
- Admin dashboard for property management
- Inquiry system for contacting builders

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the client folder:
   ```bash
   cd client
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a \`.env\` file from \`.env.example\`:
   ```bash
   cp .env.example .env
   ```
5. Update the \`.env\` file with your API URL

## Running the Application

### Development
```bash
npm start
```
The app will run on http://localhost:3000

### Production Build
```bash
npm run build
```

## Project Structure

```
client/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminLayout.js
│   │   ├── auth/
│   │   │   └── ProtectedRoute.js
│   │   ├── layout/
│   │   │   ├── Navbar.js
│   │   │   └── Footer.js
│   │   └── property/
│   │       ├── PropertyCard.js
│   │       ├── PropertyFilter.js
│   │       └── InquiryForm.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminProperties.js
│   │   │   ├── AdminPropertyForm.js
│   │   │   └── AdminInquiries.js
│   │   ├── HomePage.js
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── PropertiesPage.js
│   │   └── PropertyDetailPage.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── .env.example
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## API Endpoints Used

- \`POST /api/auth/register\` - User registration
- \`POST /api/auth/send-otp\` - Send OTP to phone
- \`POST /api/auth/verify-otp\` - Verify OTP
- \`GET /api/properties\` - Get all properties
- \`GET /api/properties/:id\` - Get property details
- \`POST /api/inquiries\` - Submit inquiry
- \`GET /api/admin/*\` - Admin routes (protected)
