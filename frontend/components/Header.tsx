import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useThemeContext } from '../themeContext';

interface HeaderProps {
  title?: string;
  onMarcarLidas?: () => void;
  onLimpar?: () => void;
}

export default function Header({ title, onMarcarLidas, onLimpar }: HeaderProps) {
  const { temaEscuro } = useThemeContext();

  return (
    <View style={[styles.header, temaEscuro && styles.headerDark]}>
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons
          name="arrow-back"
          size={24}
          color={temaEscuro ? 'white' : '#333'}
        />
      </TouchableOpacity>

      {title && (
        <Text style={[styles.title, temaEscuro && styles.textDark, !onMarcarLidas && !onLimpar ? { position: 'absolute', left: 0, right: 0 } : {}]} numberOfLines={1}>
          {title}
        </Text>
      )}

      <View style={styles.actionsContainer}>
        {onMarcarLidas && (
          <TouchableOpacity style={styles.actionButton} onPress={onMarcarLidas}>
            <Text style={[styles.actionText, temaEscuro && styles.textDark]}>Marcar como lidas</Text>
          </TouchableOpacity>
        )}
        {onLimpar && (
          <TouchableOpacity style={styles.actionButton} onPress={onLimpar}>
            <Text style={[styles.actionText, temaEscuro && styles.textDark]}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',     
    alignItems: 'center',    
    justifyContent: 'space-between',
    height: 70,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
    color: '#134F71',
  },
  textDark: {
    color: '#FFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
});
