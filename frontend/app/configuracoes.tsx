import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView, } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeContext } from '../themeContext';
import CustomModal from '../components/CustomModal';
import Header from '../components/Header';

export default function Configuracoes() {
  const [notificacoes, setNotificacoes] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const { temaEscuro, toggleTema } = useThemeContext();
  const router = useRouter();

  const handleSobre = () => {
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, temaEscuro && styles.containerDark]}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <Header title="Configurações" />

        <View style={[styles.section, temaEscuro && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, temaEscuro && styles.textDark]}>Notificações</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, temaEscuro && styles.textDark]}>
                Notificações Gerais
              </Text>
              <Text style={[styles.settingDescription, temaEscuro && styles.textMutedDark]}>
                Receber notificações do sistema
              </Text>
            </View>
            <Switch
              value={notificacoes}
              onValueChange={setNotificacoes}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notificacoes ? '#007AFF' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.section, temaEscuro && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, temaEscuro && styles.textDark]}>Aparência</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, temaEscuro && styles.textDark]}>
                Tema Escuro
              </Text>
              <Text style={[styles.settingDescription, temaEscuro && styles.textMutedDark]}>
                Usar tema escuro
              </Text>
            </View>
            <Switch
              value={temaEscuro}
              onValueChange={toggleTema}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={temaEscuro ? '#007AFF' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.section, temaEscuro && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, temaEscuro && styles.textDark]}>Sistema</Text>

          <TouchableOpacity style={styles.settingButton} onPress={handleSobre}>
            <Text style={[styles.settingButtonText, temaEscuro && styles.textDarkButton]}>
              Sobre
            </Text>
          </TouchableOpacity>
        </View>

        <CustomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Sobre o App"
          closeText="Entendido"
        >
          <Text style={{ color: temaEscuro ? '#fff' : '#333' }}>
            Sistema de Gestão Hospitalar{'\n'}
            Versão 1.0.0{'\n\n'}
            Desenvolvido para o Projeto Integrador 2
          </Text>
        </CustomModal>
      </ScrollView>

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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    marginTop: 40,
    color: '#134F71',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textDarkButton: {
    color: '#68BEF1',
  },
  textMutedDark: {
    color: '#AAAAAA',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#134F71',
  },
  sectionDark: {
    backgroundColor: '#1E1E1E',
    borderLeftColor: '#68BEF1',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#134F71',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  settingButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingButtonDark: {
    borderBottomColor: '#333333',
  },
  settingButtonText: {
    fontSize: 16,
    color: '#134F71',
    fontWeight: '500',
  },
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#134F71',
    width: '100%',
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
    flex: 1,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  backButton: {
    position: 'absolute',
    top: 35,
    left: 20,
    zIndex: 10,
    backgroundColor: 'f5f5f5',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
