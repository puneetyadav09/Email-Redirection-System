import React, { useState } from 'react';
import { Mail, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Play } from 'lucide-react';

// Set your backend URL here
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState({
    sourceEmail: '',
    appPassword: '',
    fallbackEmail: '',
    departments: []
  });
  const [errors, setErrors] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const addDepartment = () => {
    const newDepartment = {
      id: Date.now().toString(),
      name: '',
      email: ''
    };
    setConfig(prev => ({
      ...prev,
      departments: [...prev.departments, newDepartment]
    }));
  };

  const removeDepartment = (id) => {
    setConfig(prev => ({
      ...prev,
      departments: prev.departments.filter(dept => dept.id !== id)
    }));
  };

  const updateDepartment = (id, field, value) => {
    setConfig(prev => ({
      ...prev,
      departments: prev.departments.map(dept =>
        dept.id === id ? { ...dept, [field]: value } : dept
      )
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!config.sourceEmail) newErrors.sourceEmail = 'Source email is required';
      if (!config.appPassword) newErrors.appPassword = 'App password is required';
      if (config.sourceEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.sourceEmail)) {
        newErrors.sourceEmail = 'Please enter a valid email address';
      }
    }

    if (step === 2) {
      if (config.departments.length === 0) {
        newErrors.departments = 'At least one department is required';
      } else {
        config.departments.forEach((dept, index) => {
          if (!dept.name) newErrors[`dept_${index}_name`] = 'Department name is required';
          if (!dept.email) newErrors[`dept_${index}_email`] = 'Department email is required';
          if (dept.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dept.email)) {
            newErrors[`dept_${index}_email`] = 'Please enter a valid email address';
          }
        });
      }
    }

    if (step === 3) {
      if (!config.fallbackEmail) newErrors.fallbackEmail = 'Fallback email is required';
      if (config.fallbackEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.fallbackEmail)) {
        newErrors.fallbackEmail = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const startSystem = async () => {
    setIsRunning(true);
    try {

      const departmentListObject = {};
      config.departments.forEach(dept => {
        departmentListObject[dept.name.toLowerCase()] = dept.email;
      });

      const payload = {
        email: config.sourceEmail,
        password: config.appPassword,
        fallbackEmail: config.fallbackEmail,
        departmentList: departmentListObject
      };

      const response = await fetch(`${BACKEND_URL}/process-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Email redirected successfully!');
      } else {
        const error = await response.text();
        alert('Failed to start system: ' + error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setIsRunning(false);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
            step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-1 transition-all duration-300 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Configuration</h2>
        <p className="text-gray-600">Enter your source email credentials</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Source Email Address
        </label>
        <input
          type="email"
          value={config.sourceEmail}
          onChange={(e) => setConfig(prev => ({ ...prev, sourceEmail: e.target.value }))}
          className={`w-full px-4 py-3 rounded-lg border transition-colors ${
            errors.sourceEmail ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
          } focus:outline-none focus:ring-4`}
          placeholder="your-email@gmail.com"
        />
        {errors.sourceEmail && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.sourceEmail}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          App Password
        </label>
        <input
          type="password"
          value={config.appPassword}
          onChange={(e) => setConfig(prev => ({ ...prev, appPassword: e.target.value }))}
          className={`w-full px-4 py-3 rounded-lg border transition-colors ${
            errors.appPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
          } focus:outline-none focus:ring-4`}
          placeholder="Enter your app password"
        />
        {errors.appPassword && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.appPassword}
          </p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Use an app-specific password for better security
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Department Setup</h2>
        <p className="text-gray-600">Configure departments for email categorization</p>
      </div>

      {errors.departments && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {errors.departments}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {config.departments.map((dept, index) => (
          <div key={dept.id} className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-800">Department {index + 1}</h3>
              <button
                onClick={() => removeDepartment(dept.id)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={dept.name}
                  onChange={(e) => updateDepartment(dept.id, 'name', e.target.value)}
                  className={`w-full px-3 py-2 rounded border transition-colors ${
                    errors[`dept_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                  placeholder="e.g., Sales, Support, HR"
                />
                {errors[`dept_${index}_name`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`dept_${index}_name`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Email
                </label>
                <input
                  type="email"
                  value={dept.email}
                  onChange={(e) => updateDepartment(dept.id, 'email', e.target.value)}
                  className={`w-full px-3 py-2 rounded border transition-colors ${
                    errors[`dept_${index}_email`] ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                  placeholder="department@company.com"
                />
                {errors[`dept_${index}_email`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`dept_${index}_email`]}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addDepartment}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Department
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Fallback Configuration</h2>
        <p className="text-gray-600">Set default email for uncategorized messages</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Fallback Email
        </label>
        <input
          type="email"
          value={config.fallbackEmail}
          onChange={(e) => setConfig(prev => ({ ...prev, fallbackEmail: e.target.value }))}
          className={`w-full px-4 py-3 rounded-lg border transition-colors ${
            errors.fallbackEmail ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
          } focus:outline-none focus:ring-4`}
          placeholder="fallback@company.com"
        />
        {errors.fallbackEmail && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.fallbackEmail}
          </p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Emails that don't match any department criteria will be sent here
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Emails are analyzed using AI to determine the best department match</li>
          <li>• Keywords help improve categorization accuracy</li>
          <li>• Unmatched emails automatically go to the fallback address</li>
          <li>• All attachments (images, PDFs, documents) are preserved</li>
        </ul>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuration Summary</h2>
        <p className="text-gray-600">Review your settings and start the system</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="font-medium text-gray-800 mb-2">Source Email</h3>
          <p className="text-gray-600">{config.sourceEmail}</p>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-2">Departments ({config.departments.length})</h3>
          <div className="space-y-2">
            {config.departments.map((dept, index) => (
              <div key={dept.id} className="bg-gray-50 rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{dept.name}</p>
                    <p className="text-sm text-gray-600">{dept.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-2">Fallback Email</h3>
          <p className="text-gray-600">{config.fallbackEmail}</p>
        </div>
      </div>

      <button
        onClick={startSystem}
        disabled={isRunning}
        className={`w-full py-4 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center ${
          isRunning 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl'
        }`}
      >
        {isRunning ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Starting System...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            Start Email Redirection System
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <Mail className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Email Redirection System</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderStepIndicator()}

          <div className="max-w-2xl mx-auto">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Navigation */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="flex justify-center mt-8 pt-6 border-t">
              <button
                onClick={prevStep}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Edit
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;