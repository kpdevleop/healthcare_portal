import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  Users, 
  Calendar, 
  Stethoscope, 
  Activity,
  ArrowRight,
  CheckCircle,
  Star,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LandingPage = () => {
  const { isAuthenticated, user, logout, clearSession } = useAuth();
  
  const features = [
    {
      icon: <Heart className="h-8 w-8 text-accent-500" />,
      title: "Patient Care",
      description: "Comprehensive patient management with medical history tracking and appointment scheduling."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-500" />,
      title: "Secure & Private",
      description: "HIPAA compliant platform ensuring your medical data is protected with enterprise-grade security."
    },
    {
      icon: <Users className="h-8 w-8 text-secondary-500" />,
      title: "Multi-Role Access",
      description: "Tailored interfaces for patients, doctors, and administrators with role-based permissions."
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary-500" />,
      title: "Smart Scheduling",
      description: "Intelligent appointment booking system with automated reminders and calendar integration."
    },
    {
      icon: <Stethoscope className="h-8 w-8 text-accent-500" />,
      title: "Digital Health Records",
      description: "Complete electronic health records accessible to authorized healthcare providers."
    },
    {
      icon: <Activity className="h-8 w-8 text-secondary-500" />,
      title: "Real-time Monitoring",
      description: "Track vital signs, medication adherence, and health metrics in real-time."
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      content: "This platform has revolutionized how I manage my patients. The interface is intuitive and saves me hours every day.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Patient",
      content: "Booking appointments and accessing my health records has never been easier. Highly recommended!",
      rating: 5
    },
    {
      name: "Lisa Rodriguez",
      role: "Hospital Administrator",
      content: "The administrative tools are comprehensive and user-friendly. Perfect for managing our healthcare facility.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">HealthCare Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {user?.firstName || 'User'}
                  </span>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary text-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Modern Healthcare
              <span className="text-gradient block">Management System</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in animation-delay-200">
              Streamline your healthcare experience with our comprehensive platform designed for patients, 
              doctors, and administrators. Secure, efficient, and user-friendly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-400">
              <Link
                to="/signup"
                className="btn-primary text-lg px-8 py-3 inline-flex items-center"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/signin"
                className="btn-outline text-lg px-8 py-3"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with modern technology and healthcare best practices in mind
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:shadow-xl transition-shadow duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="text-xl font-semibold text-gray-900 ml-3">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-based Access Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tailored for Every User
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Different interfaces and features designed specifically for each role
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Patient Card */}
            <div className="card text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Patients</h3>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary-500 mr-2" />
                  <span>Book appointments online</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary-500 mr-2" />
                  <span>Access medical records</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary-500 mr-2" />
                  <span>Prescription management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary-500 mr-2" />
                  <span>Health tracking tools</span>
                </li>
              </ul>
              <Link to="/signup?role=patient" className="btn-primary w-full">
                Join as Patient
              </Link>
            </div>

            {/* Doctor Card */}
            <div className="card text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Doctors</h3>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary-500 mr-2" />
                  <span>Manage patient records</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary-500 mr-2" />
                  <span>Schedule management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary-500 mr-2" />
                  <span>Digital prescriptions</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-secondary-500 mr-2" />
                  <span>Clinical decision support</span>
                </li>
              </ul>
              <Link to="/signup?role=doctor" className="btn-secondary w-full">
                Join as Doctor
              </Link>
            </div>


          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trusted by healthcare professionals and patients worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals and patients who trust our platform
          </p>
          <Link
            to="/signup"
            className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center text-lg"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Heart className="h-8 w-8 text-primary-400" />
              <span className="ml-2 text-xl font-bold">HealthCare Portal</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 HealthCare Portal. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;