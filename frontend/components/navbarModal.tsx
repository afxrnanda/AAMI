import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NavbarComModal() {
  const router = useRouter();

  return (
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

        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="bed" size={24} color="#FFFFFF" />
          <Text style={styles.navText}>Leitos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/configuracoes')}>
          <Ionicons name="settings" size={24} color="#FFFFFF" />
          <Text style={styles.navText}>Config</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 2,
    left: 20,
    right: 20,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 79, 113, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  navButton: {
    alignItems: 'center',
    padding: 5,
  },
  navText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
});
