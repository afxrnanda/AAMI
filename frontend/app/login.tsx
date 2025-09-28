import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import CustomModal from '../components/CustomModal';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const router = useRouter();

  const API_URL = 'http://localhost:3000';// ou IP real na rede se estiver testando no celular

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      showModal('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        showModal('Erro', data.erro || 'Falha no login');
        return;
      }

      const { token, usuario } = data;

      // Armazena no AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('usuario', JSON.stringify(usuario));

      showModal('Bem-vindo', `Olá, ${usuario.nome.split(' ')[0]}`);
      setTimeout(() => {
        setModalVisible(false);
        router.replace('/perfil');
      }, 2000);

    } catch (error) {
      console.error('Erro na requisição:', error);
      showModal('Erro', 'Não foi possível conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        closeText="OK"
        buttonBackgroundColor="#134F71"
        modalBackgroundColor="#FFF"
        titleColor="#134F71"
      >
        <Text style={{ color: '#333', textAlign: 'center' }}>{modalMessage}</Text>
      </CustomModal>

      <View style={styles.waveContainer}>
        <Svg height="270" width="100%" viewBox="0 0 1440 160" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#0a2c3d" stopOpacity="1" />
              <Stop offset="30%" stopColor="#134F71" stopOpacity="1" /> 
              <Stop offset="100%" stopColor="#68BEF1" stopOpacity="1" /> 
            </LinearGradient>
          </Defs>
          <Path
            fill="url(#grad)"
            d="M0,160L60,150C120,140,240,120,360,113.3C480,
            107,600,117,720,120C840,123,960,120,1080,113.3C1200,
            107,1320,100,1380,96.7L1440,93L1440,0L1380,0C1320,0,1200,
            0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          />
        </Svg>
      </View>
      <View style={styles.header}>
        <Text style={styles.welcome}>Bem</Text>
        <Text style={styles.welcome}>Vindo(a)</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>E-MAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>SENHA</Text>
        <View style={styles.senhaContainer}>
          <TextInput
            style={styles.senhaInput}
            placeholder="Digite sua senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!mostrarSenha}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          {senha.length > 0 && (
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
              <Ionicons
                name={mostrarSenha ? 'eye' : 'eye-off'}
                size={24}
                color="#134F71"
                style={{ paddingHorizontal: 10 }}
              />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => router.push('/esqueci-senha')}
        >
          <Text style={styles.forgotPasswordText}>ESQUECEU SUA SENHA?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.orText}>ou</Text>
        
        <TouchableOpacity 
          style={styles.signupButton}
          onPress={() => router.push('/cadastro')}
        >
          <Text style={styles.signupText}>Cadastro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 30,
  },
  waveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 0, 
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    zIndex: 1, 
    marginTop: 50,
  },
  inputContainer: {
    marginTop: 40, 
  },
  wave: {
    width: '100%',
  },
  header: {
    marginTop: 50, 
    marginBottom: 40,
    zIndex: 1,
  },
  welcome: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white', 
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 18,
    color: '#134F72',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 25,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  senhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 25,
  },
  senhaInput: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#134F71',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#134F71',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#134F71',
    fontSize: 16,
    marginVertical: 10,
  },
  signupButton: {
    backgroundColor: 'white',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#134F71',
  },
  signupText: {
    color: '#134F71',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
