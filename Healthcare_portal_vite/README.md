# Healthcare Portal Frontend

A modern React.js frontend for the Healthcare Portal system, built with Vite, Tailwind CSS, and integrated with a Spring Boot backend.

## Features

### 🔐 Authentication
- Secure JWT-based authentication
- Role-based access control (Admin, Doctor, Patient)
- Protected routes and navigation
- Automatic token validation and refresh

### 👨‍⚕️ Admin Features
- **Department Management**: Create, edit, delete, and view departments
- **Appointment Management**: Manage all appointments with status updates
- **Doctor Schedule Management**: Create and manage doctor availability
- **Medical Records Management**: Comprehensive medical record handling
- **Feedback Management**: View and manage patient feedback
- **User Management**: Manage all system users

### 🏥 Doctor Features
- View and manage patient appointments
- Access patient medical records
- Manage personal schedule
- View patient feedback

### 👤 Patient Features
- Book appointments with doctors
- View personal medical records
- Provide feedback and ratings
- Manage personal information

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **State Management**: React Context API

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Running Spring Boot backend on `http://localhost:8080`

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Healthcare_portal_vite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── DashboardLayout.jsx
│   ├── ProtectedRoute.jsx
│   └── PlaceholderPage.jsx
├── context/            # React Context for state management
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── admin/          # Admin-specific pages
│   ├── doctor/         # Doctor-specific pages
│   ├── patient/        # Patient-specific pages
│   ├── dashboards/     # Dashboard pages
│   ├── SignInPage.jsx
│   ├── SignUpPage.jsx
│   ├── LandingPage.jsx
│   └── UnauthorizedPage.jsx
├── services/           # API services
│   └── api.js
├── App.jsx             # Main application component
├── main.jsx           # Application entry point
└── index.css          # Global styles
```

## API Integration

The frontend integrates with the Spring Boot backend through the following endpoints:

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/test-token` - Token validation

### Admin Endpoints
- `GET/POST/PUT/DELETE /api/departments` - Department management
- `GET/POST/PUT/DELETE /api/appointments/all` - Appointment management
- `GET/POST/PUT/DELETE /api/doctor-schedules/all` - Schedule management
- `GET/POST/PUT/DELETE /api/medical-records/all` - Medical records
- `GET/POST/PUT/DELETE /api/feedback/all` - Feedback management
- `GET/POST/PUT/DELETE /api/users/all` - User management

### Role-Based Endpoints
- `GET /api/appointments/my` - User's appointments
- `GET /api/medical-records/my` - User's medical records
- `GET /api/feedback/my` - User's feedback

## Environment Configuration

The application is configured to connect to the backend at `http://localhost:8080`. To change this:

1. Update the `BASE_URL` in `src/services/api.js`
2. Ensure CORS is properly configured on the backend

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication Flow

1. **Sign Up**: Users can register with role selection (Admin, Doctor, Patient)
2. **Sign In**: Users authenticate with email and password
3. **Token Management**: JWT tokens are automatically handled
4. **Route Protection**: Routes are protected based on user roles
5. **Auto-logout**: Expired tokens trigger automatic logout

## Role-Based Access

### Admin (`ROLE_ADMIN`)
- Full system access
- Manage all departments, appointments, schedules
- View all medical records and feedback
- User management capabilities

### Doctor (`ROLE_DOCTOR`)
- View assigned patients
- Manage personal schedule
- Access patient medical records
- View patient feedback

### Patient (`ROLE_PATIENT`)
- Book appointments
- View personal medical records
- Provide feedback
- Manage personal information

## Styling

The application uses Tailwind CSS with custom components:

- `.btn-primary` - Primary action buttons
- `.btn-secondary` - Secondary action buttons
- `.btn-outline` - Outline style buttons
- `.input-field` - Form input styling
- `.card` - Card container styling
- `.gradient-bg` - Gradient background

## Error Handling

- Global error handling with toast notifications
- Form validation with real-time feedback
- Network error handling with retry mechanisms
- Authentication error handling with automatic logout

## Security Features

- JWT token-based authentication
- Automatic token refresh
- Protected routes
- Role-based access control
- Secure API communication
- Input validation and sanitization

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your web server

3. **Configure environment variables** for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.