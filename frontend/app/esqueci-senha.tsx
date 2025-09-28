import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEnviarEmail = async () => {
    if (!email) {
      Alert.alert('Erro', 'Digite seu email');
      return;
    }

    setLoading(true);
    try {
      // Aqui você implementaria a lógica de recuperação de senha com Supabase
      console.log('Enviando email de recuperação para:', email);
      
      // Simular envio bem-sucedido
      setTimeout(() => {
        Alert.alert(
          'Email enviado', 
          'Verifique sua caixa de entrada para redefinir sua senha.',
          [{ text: 'OK', onPress: () => router.push('/confirmacao-senha') }] 
        );
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar email. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.waveContainer}>
        <Svg height="270" width="100%" viewBox="0 0 1440 150" preserveAspectRatio="none">
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

      <Text style={styles.title}>Recuperar Senha</Text>
      
      <Text style={styles.description}>
        Digite seu email e enviaremos um link para redefinir sua senha.
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleEnviarEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Enviando...' : 'Enviar email'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.linkButton}
        onPress={() => router.back()}
      >
        <Text style={styles.linkText}>Voltar ao login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  waveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    zIndex: 1,
    marginTop: 60,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#134F71',
    marginBottom: 8,
    fontWeight: '500',
  },
  description: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    fontSize: 16,
    lineHeight: 22,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 10,
    marginBottom: 10,
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 14,
  },
}); 