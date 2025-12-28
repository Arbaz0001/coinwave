import React from 'react';

const FormInput = ({ 
  label, 
  type = 'text', 
  id, 
  name, 
  value, 
  onChange, 
  onBlur,
  error, 
  placeholder,
  required = false,
  className = '' 
}) => {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-semibold text-black mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-gray-800 border-2 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-white placeholder-gray-400 ${
          error 
            ? 'border-red-500 bg-red-900/20 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-600 hover:border-gray-500'
        } ${className}`}
        required={required}
      />
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

export default FormInput;