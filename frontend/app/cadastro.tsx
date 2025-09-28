import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [cargo, setCargo] = useState('');
  const [registroProfissional, setRegistroProfissional] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();
  const API_URL = 'http://localhost:3000';

  const showErrorModal = (message: string) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha || !cargo || !registroProfissional || !telefone) {
      showErrorModal('Preencha todos os campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showErrorModal('E-mail inválido');
      return;
    }

    if (senha !== confirmarSenha) {
      showErrorModal('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          cargo,
          registro_profissional: registroProfissional,
          telefone
        })
      });

      if (response.ok) {
        setModalVisible(true);
      } else {
        const data = await response.json();
        showErrorModal(data.erro || 'Falha no cadastro');
      }
    } catch (error) {
      showErrorModal('Não foi possível conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
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

        <View style={styles.content}>
          <Text style={styles.title}>Criar Conta</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cargo</Text>
            <TextInput
              style={styles.input}
              placeholder="Cargo"
              value={cargo}
              onChangeText={setCargo}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Registro Profissional</Text>
            <TextInput
              style={styles.input}
              placeholder="Registro Profissional"
              value={registroProfissional}
              onChangeText={setRegistroProfissional}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCadastro}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.linkText}>Já tem conta? Faça login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de sucesso */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          router.replace('/perfil');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cadastro Concluído</Text>
            <Text style={styles.modalText}>Sua conta foi criada com sucesso!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                router.replace('/perfil');
              }}
            >
              <Text style={styles.modalButtonText}>Ir para o perfil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de erro */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Erro</Text>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    color: '#134F71',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#134F71',
    paddingVertical: 18,
    borderRadius: 10,
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
  linkButton: {
    padding: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#134F71',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#134F71',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#134F71',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
