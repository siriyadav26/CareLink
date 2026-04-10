import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const COLORS = {
  bg: '#f0edf6',
  surface: '#ece8f3',
  raised: '#f7f4fc',
  orchid: '#9b72cf',
  lavender: '#b39ddb',
  iris: '#7c6bc4',
  lilac: '#d1c4e9',
  textPrimary: '#3d2c6e',
  textSecondary: '#8b7ab8',
  shadow: '#c8c0dc',
  highlight: '#ffffff',
  danger: '#e57373',
  success: '#a8d8b9',
};

export const neu = (d = 6) => ({
  shadowColor: COLORS.shadow,
  shadowOffset: { width: d, height: d },
  shadowOpacity: 0.5,
  shadowRadius: d * 1.5,
  elevation: d,
});

export const AccessibilityProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [bigCursor, setBigCursor] = useState(false);

  const speak = (text) => {
    if (soundEnabled && text) {
      Speech.speak(text, { pitch: 1.2, rate: 0.9, language: 'en-US' });
    }
  };

  const theme = {
    background: COLORS.bg,
    surface: COLORS.surface,
    primary: COLORS.orchid,
    secondary: COLORS.iris,
    text: COLORS.textPrimary,
    textSecondary: COLORS.textSecondary,
    accent: COLORS.orchid,
  };

  const fontSize = largeText ? 20 : 16;
  const titleSize = largeText ? 28 : 24;
  const headingSize = largeText ? 24 : 20;

  const elements = React.useRef({});

  const registerElement = (id, layout, label) => {
    elements.current[id] = { layout, label };
  };

  const unregisterElement = (id) => {
    delete elements.current[id];
  };

  return (
    <AccessibilityContext.Provider
      value={{
        soundEnabled,
        setSoundEnabled,
        largeText,
        setLargeText,
        bigCursor,
        setBigCursor,
        speak,
        theme,
        COLORS,
        neu,
        fontSize,
        titleSize,
        headingSize,
        registerElement,
        unregisterElement,
        elements,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};