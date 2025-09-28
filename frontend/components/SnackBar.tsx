import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

type SnackBarProps = {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  type?: 'success' | 'error' | 'info';
};

const SnackBar = ({ message, visible, onDismiss, duration = 3000, type = 'info' }: SnackBarProps) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        hideSnackBar();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideSnackBar = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: getBackgroundColor(), pointerEvents: 'box-none' }]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default SnackBar; 