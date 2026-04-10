import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

export default function CustomCursor({ children }) {
  const acc = useAccessibility();
  const lastCheck = React.useRef(0);
  const pos = React.useRef(new Animated.ValueXY({ x: -100, y: -100 })).current;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const lastSpoken = React.useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (acc.bigCursor) {
        document.body.style.cursor = 'none';
        const handleMouseMove = (e) => {
          opacity.setValue(1);
          pos.setValue({ x: e.clientX, y: e.clientY });

          // Hover-to-speak logic for Web
          if (acc.soundEnabled) {
            const element = document.elementFromPoint(e.clientX, e.clientY);
            if (element) {
              const target = element.closest('button, [role="button"], [aria-label], a') || element;
              const text = target.getAttribute('aria-label') || target.innerText || target.placeholder;
              
              if (text && text.trim() && text !== lastSpoken.current) {
                const cleanText = text.split('\n')[0].trim();
                acc.speak(cleanText);
                lastSpoken.current = text;
              } else if (!text) {
                lastSpoken.current = null;
              }
            }
          }
        };
        const handleMouseLeave = () => {
          opacity.setValue(0);
          lastSpoken.current = null;
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseleave', handleMouseLeave);
          document.body.style.cursor = 'auto';
        };
      } else {
        document.body.style.cursor = 'auto';
        opacity.setValue(0);
        lastSpoken.current = null;
      }
    }
  }, [acc.bigCursor, acc.soundEnabled, acc.speak]);

  const handleTouch = (e) => {
    if (!acc.bigCursor || Platform.OS === 'web') return;
    const { pageX, pageY } = e.nativeEvent;
    opacity.setValue(1);
    pos.setValue({ x: pageX, y: pageY });

    // Mobile Hover-to-Scan logic
    const now = Date.now();
    if (acc.soundEnabled && acc.elements?.current && now - lastCheck.current > 100) {
      lastCheck.current = now;
      let found = null;
      
      // Use direct ref access to avoid ReferenceErrors
      const registry = acc.elements.current;
      for (const id in registry) {
        const { layout, label } = registry[id];
        // Add a small buffer (5px) for easier hit detection
        if (pageX >= layout.x - 5 && pageX <= layout.x + layout.width + 5 &&
            pageY >= layout.y - 5 && pageY <= layout.y + layout.height + 5) {
          found = label;
          break;
        }
      }

      if (found && found !== lastSpoken.current) {
        acc.speak(found);
        lastSpoken.current = found;
      } else if (!found) {
        lastSpoken.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!acc.bigCursor || Platform.OS === 'web') return;
    lastSpoken.current = null;
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View 
      style={styles.container} 
      onStartShouldSetResponder={() => acc.bigCursor}
      onMoveShouldSetResponder={() => acc.bigCursor}
      onResponderMove={handleTouch}
      onResponderRelease={handleTouchEnd}
    >
      {children}
      {acc.bigCursor && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.cursor,
            {
              opacity: opacity,
              transform: [
                { translateX: Animated.add(pos.x, -30) },
                { translateY: Animated.add(pos.y, -30) },
              ],
            },
          ]}
        >
          <View style={styles.cursorOuter} />
          <View style={styles.cursorInner} />
          <View style={styles.crosshairH} />
          <View style={styles.crosshairV} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cursor: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cursorOuter: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#9b72cf',
    backgroundColor: 'rgba(155, 114, 207, 0.15)',
  },
  cursorInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9b72cf',
  },
  crosshairH: {
    position: 'absolute',
    width: 44,
    height: 2,
    backgroundColor: '#9b72cf',
  },
  crosshairV: {
    position: 'absolute',
    width: 2,
    height: 44,
    backgroundColor: '#9b72cf',
  },
});
