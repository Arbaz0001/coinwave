import React, { useState } from 'react';

const PasswordInput = ({ 
  label, 
  id, 
  name, 
  value, 
  onChange, 
  onBlur,
  error, 
  placeholder,
  showStrength = false 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '', width: '0%' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const widths = ['20%', '40%', '60%', '80%', '100%'];
    
    return {
      strength: strength,
      label: labels[strength - 1] || 'Very Weak',
      color: colors[strength - 1] || 'bg-red-500',
      width: widths[strength - 1] || '20%'
    };
  };

  const strengthInfo = showStrength ? getPasswordStrength(value) : null;

  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-semibold text-black mb-2">
        {label}
        <span className="text-red-400 ml-1">*</span>
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-12 bg-gray-800 border-2 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-white placeholder-gray-400 ${
            error 
              ? 'border-red-500 bg-red-900/20 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M21.536 15.536L8.464 8.464" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      
      {showStrength && value && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Password Strength</span>
            <span className={`text-xs font-medium ${
              strengthInfo.strength <= 2 ? 'text-red-400' : 
              strengthInfo.strength <= 3 ? 'text-yellow-400' : 
              strengthInfo.strength <= 4 ? 'text-blue-400' : 'text-green-400'
            }`}>
              {strengthInfo.label}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${strengthInfo.color}`}
              style={{ width: strengthInfo.width }}
            ></div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 flex items-center text-red-400 text-sm">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default PasswordInput;