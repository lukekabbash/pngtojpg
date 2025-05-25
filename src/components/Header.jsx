import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../App';

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-12 relative"
    >
      {/* Dark Mode Toggle - positioned outside the border */}
      <button
        onClick={toggleDarkMode}
        className={`absolute top-0 right-4 p-3 border-2 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
            : 'bg-white border-gray-400 text-black hover:bg-gray-100'
        }`}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      {/* Newspaper-style header border */}
      <div className={`border-t-4 border-b-4 py-8 mb-8 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-800'
      }`}>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center mb-6"
        >
          <div className="mr-4">
            <svg className="w-12 h-12 text-red-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div>
            <svg className={`w-8 h-8 ${isDarkMode ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          
          <div className="ml-4">
            <svg className="w-12 h-12 text-red-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-6xl md:text-7xl font-black mb-4 font-times uppercase tracking-wider"
        >
          <span className={`${isDarkMode ? 'text-white' : 'text-black'}`}>
            PNG to JPG
          </span>
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className={`border-t-2 border-b-2 py-2 mb-6 ${
            isDarkMode ? 'border-red-800' : 'border-red-800'
          }`}
        >
          <h2 className={`text-2xl md:text-3xl font-bold font-times uppercase tracking-widest ${
            isDarkMode ? 'text-red-700' : 'text-red-800'
          }`}>
            Image Converter
          </h2>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className={`text-lg max-w-2xl mx-auto font-times font-semibold ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Transform your high-resolution PNG images into optimized 1920×1080 JPG files 
          with aggressive compression that maximizes file size reduction while preserving quality.
        </motion.p>
      </div>
    </motion.header>
  );
};

export default Header; 