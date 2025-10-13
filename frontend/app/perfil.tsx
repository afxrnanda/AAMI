import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeContext } from '../themeContext';
import Header from '../components/Header';

interface Usuario {
  nome: string;
  email: string;
  cargo: string;
  registro_profissional?: string;
  telefone?: string;
}

export default function Perfil() {
  const { temaEscuro } = useThemeContext();
  const [userData, setUserData] = useState<Usuario | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editUserData, setEditUserData] = useState<Usuario | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verificarAutenticacao = async () => {
      const token = await AsyncStorage.getItem('token');
      const usuario = await AsyncStorage.getItem('usuario');

      if (!token || !usuario) {
        router.replace('/login');
      }
    };

    verificarAutenticacao();
  }, []);

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const userString = await AsyncStorage.getItem('usuario');
        if (userString) {
          const user = JSON.parse(userString);
          setUserData(user);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    carregarUsuario();
  }, []);

  const handleLogout = () => {
    setModalVisible(true);
  };

  const handleLogoutConfirm = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
    setModalVisible(false);
    router.replace('/login');
  };

  const handleEditarPerfil = () => {
    setEditUserData(userData);
    setEditModalVisible(true);
  };

  const handleCancelarEdicao = () => {
    setEditModalVisible(false);
    setEditUserData(userData);
  };

  const handleSalvarEdicao = async () => {
    if (!editUserData) return;
    setSavingEdit(true);
    try {
      await AsyncStorage.setItem('usuario', JSON.stringify(editUserData));
      setUserData(editUserData);
      setEditModalVisible(false);
    } catch (error) {
      alert('Erro ao salvar dados.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, temaEscuro && styles.containerDark]}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <Header title="Perfil"/>

        <View style={[styles.header, temaEscuro && styles.headerDark]}>
          {userData ? (
            <>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userData.nome.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <Text style={[styles.userName, temaEscuro && styles.textLight]}>{userData.nome}</Text>
              <Text style={[styles.userRole, temaEscuro && styles.textMutedLight]}>{userData.cargo}</Text>
            </>
          ) : (
            <Text style={[styles.userName, temaEscuro && styles.textLight]}>Carregando...</Text>
          )}
        </View>

        {userData && (
          <View style={[styles.section, temaEscuro && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, temaEscuro && styles.textLight]}>Informações Pessoais</Text>

            {[
              { label: 'Nome', value: userData.nome },
              { label: 'Email', value: userData.email },
              { label: 'Cargo', value: userData.cargo },
              { label: 'Registro Profissional', value: userData.registro_profissional || 'N/A' },
              { label: 'Telefone', value: userData.telefone || 'N/A' },
            ].map(({ label, value }) => (
              <View key={label} style={[styles.infoItem, temaEscuro && styles.infoItemDark]}>
                <Text style={[styles.infoLabel, temaEscuro && styles.textMutedLight]}>{label}</Text>
                <Text style={[styles.infoValue, temaEscuro && styles.textLight]}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.section, temaEscuro && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, temaEscuro && styles.textLight]}>Ações</Text>

          <TouchableOpacity style={styles.actionButton} onPress={handleEditarPerfil}>
            <Text style={styles.actionButtonText}>Editar Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.configButton]}
            onPress={() => router.push('/configuracoes')}
          >
            <Text style={styles.actionButtonText}>Configurações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.actionButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, temaEscuro && styles.modalContainerDark]}>
              <Text style={[styles.modalTitle, temaEscuro && styles.textLight]}>Deseja sair?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={[styles.modalCancel, temaEscuro && styles.textMutedLight]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogoutConfirm}>
                  <Text style={styles.modalConfirm}>Sair</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={handleCancelarEdicao}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, temaEscuro && styles.modalContainerDark]}>
              <Text style={[styles.modalTitle, temaEscuro && styles.textLight]}>Editar Perfil</Text>
              {editUserData && (
                <>
                  <ScrollView style={{ width: '100%' }}>
                    <View style={{ marginBottom: 10 }}>
                      <Text style={[styles.infoLabel, temaEscuro && styles.textMutedLight]}>Nome</Text>
                      <TextInput
                        style={[styles.editInput, temaEscuro && styles.editInputDark]}
                        value={editUserData.nome}
                        onChangeText={text => setEditUserData({ ...editUserData, nome: text })}
                      />
                    </View>
                    <View style={{ marginBottom: 10 }}>
                      <Text style={[styles.infoLabel, temaEscuro && styles.textMutedLight]}>Email</Text>
                      <TextInput
                        style={[styles.editInput, temaEscuro && styles.editInputDark]}
                        value={editUserData.email}
                        onChangeText={text => setEditUserData({ ...editUserData, email: text })}
                        keyboardType="email-address"
                      />
                    </View>
                    <View style={{ marginBottom: 10 }}>
                      <Text style={[styles.infoLabel, temaEscuro && styles.textMutedLight]}>Telefone</Text>
                      <TextInput
                        style={[styles.editInput, temaEscuro && styles.editInputDark]}
                        value={editUserData.telefone || ''}
                        onChangeText={text => setEditUserData({ ...editUserData, telefone: text })}
                        keyboardType="phone-pad"
                      />
                    </View>
                    <View style={{ marginBottom: 10 }}>
                      <Text style={[styles.infoLabel, temaEscuro && styles.textMutedLight]}>Registro Profissional</Text>
                      <TextInput
                        style={[styles.editInput, temaEscuro && styles.editInputDark]}
                        value={editUserData.registro_profissional || ''}
                        onChangeText={text => setEditUserData({ ...editUserData, registro_profissional: text })}
                      />
                    </View>
                  </ScrollView>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={handleCancelarEdicao} style={{ marginRight: 10 }}>
                      <Text style={[styles.modalCancel, temaEscuro && styles.textMutedLight]}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSalvarEdicao} disabled={savingEdit}>
                      <Text style={[styles.modalConfirm, savingEdit && { color: '#aaa' }]}>
                        {savingEdit ? 'Salvando...' : 'Salvar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Navbar fixa */}
      <View style={styles.navContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/perfil')}>
            <Ionicons name="person" size={24} color="#FFFFFF" />
            <Text style={styles.navText}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/notificacoes')}>
            <Ionicons name="notifications" size={24} color="#FFFFFF" />
            <Text style={styles.navText}>Notificações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/leito/lista_leitos')}>
            <Ionicons name="bed" size={24} color="#FFFFFF" />
            <Text style={styles.navText}>Leitos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/configuracoes')}>
            <Ionicons name="settings" size={24} color="#FFFFFF" />
            <Text style={styles.navText}>Config</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    marginBottom: 10,
  },
  headerDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#444',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#134F71',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionDark: {
    backgroundColor: '#1E1E1E',
    shadowOpacity: 0.3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  textLight: {
    color: '#fff',
  },
  textMutedLight: {
    color: '#aaa',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoItemDark: {
    borderBottomColor: '#333',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  editInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    color: '#333',
    fontSize: 16,
    marginTop: 5,
  },
  editInputDark: {
    backgroundColor: '#333',
    color: '#fff',
  },
  actionButton: {
    backgroundColor: '#134F71',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  configButton: {
    backgroundColor: '#2E7D32',
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#D32F2F',
    marginBottom: 12,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000088',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalContainerDark: {
    backgroundColor: '#222',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
    padding: 10,
  },
  modalConfirm: {
    fontSize: 16,
    color: '#FF3B30',
    padding: 10,
    fontWeight: 'bold',
  },
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#134F71',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  navButton: {
    alignItems: 'center',
    paddingHorizontal: 8,
    flex: 1,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
});