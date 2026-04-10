import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Speech from 'expo-speech';

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [highContrast, setHighContrast] = useState(true);
  const [largeText, setLargeText] = useState(true);
  const [bigCursor, setBigCursor] = useState(false);

  const speak = (text) => {
    if (soundEnabled && text) {
      Speech.speak(text, { pitch: 1.2, rate: 0.9, language: 'en-US' });
    }
  };

  const theme = highContrast
    ? {
        background: '#0A1929',
        surface: '#132F4C',
        primary: '#FFFFFF',
        secondary: '#64B5F6',
        text: '#FFFFFF',
        textSecondary: '#B0BEC5',
        accent: '#FF5252',
      }
    : {
        background: '#FFFFFF',
        surface: '#F5F5F5',
        primary: '#0A1929',
        secondary: '#1976D2',
        text: '#212121',
        textSecondary: '#757575',
        accent: '#FF5252',
      };

  const fontSize = largeText ? 18 : 14;
  const titleSize = largeText ? 24 : 20;
  const headingSize = largeText ? 20 : 16;

  return (
    <AccessibilityContext.Provider
      value={{
        soundEnabled,
        setSoundEnabled,
        highContrast,
        setHighContrast,
        largeText,
        setLargeText,
        bigCursor,
        setBigCursor,
        speak,
        theme,
        fontSize,
        titleSize,
        headingSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};