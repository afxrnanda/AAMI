import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Onda ao fundo */}
      <View style={styles.waveContainer}>
        <Svg height="750" width="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#0a2c3d" stopOpacity="1" />
              <Stop offset="30%" stopColor="#134F71" stopOpacity="1" />
              <Stop offset="100%" stopColor="#68BEF1" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Path
            fill="url(#grad)"
            transform="scale(1, -1) translate(0, -320)"
            d="M0,160L60,150C120,140,240,120,360,113.3C480,
            107,600,117,720,120C840,123,960,120,1080,113.3C1200,
            107,1320,100,1380,96.7L1440,93L1440,0L1380,0C1320,0,1200,
            0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          />
        </Svg>
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/image.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Botões */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>LOG-IN →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupButton} onPress={() => router.push('/cadastro')}>
          <Text style={styles.signupText}>CADASTRO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waveContainer: {
    position: 'absolute',
    bottom: -100,
    width: '100%',
    zIndex: 0,
  },
  logoContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  logo: {
    width: 250, 
    height: 250,
  },
  buttonContainer: {
    flex: 2,
    width: '80%',
    justifyContent: 'flex-start',
    marginBottom: 40,
    zIndex: 2,
  },
  loginButton: {
    backgroundColor: '#ffffff',
    borderColor: '#134F71',
    borderWidth: 2,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#134F71',
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#134F71',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
