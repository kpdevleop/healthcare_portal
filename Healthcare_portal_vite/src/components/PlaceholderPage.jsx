import React from 'react';
import { Clock, Construction } from 'lucide-react';

const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <Construction className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {title || 'Coming Soon'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {description || 'This feature is under development and will be available soon.'}
        </p>
        
        <div className="flex items-center justify-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-2" />
          <span>Feature in development</span>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;