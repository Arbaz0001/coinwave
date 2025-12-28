import React, { useState, useRef, useEffect } from 'react';
import { countryCodes } from '../utils/countryCodes';

const PhoneInput = ({ value, onChange, error, onBlur }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countryCodes.filter(country =>
    country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm)
  );

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchTerm('');
    const fullNumber = country.code+ phoneNumber;
    onChange({ target: { name: 'phone', value: fullNumber } });
  };

  const handlePhoneNumberChange = (e) => {
    const number = e.target.value.replace(/[^\d]/g, '');
    setPhoneNumber(number);
    const fullNumber = selectedCountry.code + number;
    onChange({ target: { name: 'phone', value: fullNumber } });
  };

  return (
    <div className="mb-6">
      <label htmlFor="phone" className="block text-sm font-semibold text-black mb-2">
        Phone Number
        <span className="text-red-400 ml-1">*</span>
      </label>
      <div className="flex">
        {/* Country Code Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center px-4 py-3 bg-gray-800 border-2 rounded-l-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
              error 
                ? 'border-red-500 bg-red-900/20 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <span className="text-xl mr-2">{selectedCountry.flag}</span>
            <span className="text-white text-sm font-medium mr-2">{selectedCountry.code}</span>
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border-2 border-gray-600 rounded-xl shadow-2xl max-h-64 overflow-hidden z-50">
              <div className="p-3 border-b border-gray-600">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="overflow-y-auto max-h-48">
                {filteredCountries.map((country, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 flex items-center text-sm text-white transition-colors duration-200"
                  >
                    <span className="text-lg mr-3">{country.flag}</span>
                    <span className="font-medium mr-3 text-blue-400">{country.code}</span>
                    <span className="text-gray-300 truncate">{country.country}</span>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="px-4 py-3 text-gray-400 text-sm">No countries found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          id="phone"
          name="phone"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          onBlur={onBlur}
          placeholder="Enter phone number"
          className={`w-full flex-1 px-4 py-3 bg-gray-800 border-2 border-l-0 rounded-r-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-white placeholder-gray-400 ${
            error 
              ? 'border-red-500 bg-red-900/20 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
        />
      </div>
      
      {error && (
        <div className="mt-2 flex items-center text-red-400 text-sm">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      {value && !error && (
        <div className="mt-2 flex items-center text-green-400 text-sm">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Valid phone number: {value}
        </div>
      )}
    </div>
  );
};

export default PhoneInput;