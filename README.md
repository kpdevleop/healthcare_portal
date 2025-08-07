# Healthcare Portal

A comprehensive healthcare management system with separate backend and frontend applications.

## 🏗️ Project Structure

```
healthcare_portal/
├── backend/          # Spring Boot REST API
└── frontend/         # React + Vite Frontend
```

## 🚀 Quick Start

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📁 Backend

- **Framework**: Spring Boot 3.x
- **Database**: MySQL
- **Security**: JWT Authentication
- **API Documentation**: Swagger/OpenAPI

### Features
- User Authentication & Authorization
- Role-based Access Control (Admin, Doctor, Patient)
- Appointment Management
- Medical Records
- Doctor Schedules
- Feedback System
- Department Management

## 🎨 Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios

### Features
- Responsive Design
- Role-based Dashboards
- Real-time Updates
- Form Validation
- Error Handling
- Modern UI/UX

## 🔐 Authentication

The system supports three user roles:

- **Admin**: Full system access
- **Doctor**: Patient management, schedules, medical records
- **Patient**: Appointments, feedback, medical records

## 🛠️ Development

### Prerequisites
- Java 17+
- Node.js 16+
- MySQL 8.0+

### Environment Setup
1. Clone the repository
2. Set up MySQL database
3. Configure backend `application.properties`
4. Install frontend dependencies

## 📝 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- API Docs: `http://localhost:8080/v3/api-docs`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **kpdevleop** - Initial work
- **kp-agni** - Contributions

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- React team for the frontend library
- Tailwind CSS for the utility-first CSS framework 