import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

export default function NovaSenha() {
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleSalvar = () => {
    if (!senha || !confirmarSenha) {
      alert('Preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    // Lógica de redefinição aqui
    // Imagino que vá precisar mexer no banco tbm
    alert('Senha redefinida com sucesso!');
    router.replace('/login');
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

      <View style={styles.content}>
        <Text style={styles.title}>Nova Senha</Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="nova senha"
            secureTextEntry={!mostrarSenha}
            value={senha}
            onChangeText={setSenha}
          />
          {senha.length > 0 && (
            <TouchableOpacity onPress={() => setSenha('')}>
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="confirmar senha"
            secureTextEntry={!mostrarSenha}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />
          <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
            <Ionicons name={mostrarSenha ? 'eye-off' : 'eye'} size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSalvar}>
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    justifyContent: 'center',
    padding: 30,
    marginTop: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#134F71',
    textAlign: 'left',
    marginBottom: 30,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#134F71',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
