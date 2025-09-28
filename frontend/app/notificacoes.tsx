import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { buscarNotificacoes, marcarNotificacaoComoLida, Notificacao } from '../services/api';
import { useThemeContext } from '../themeContext';

export default function Notificacoes() {
  const { temaEscuro } = useThemeContext();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'nao-lidas'>('todas');
  const router = useRouter();

  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      const data = await buscarNotificacoes();
      setNotificacoes(data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as notificações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const notificacoesFiltradas = filtro === 'nao-lidas' 
    ? notificacoes.filter(n => !n.lida)
    : notificacoes;

  const marcarComoLida = async (id: number) => {
    try {
      await marcarNotificacaoComoLida(id);
      setNotificacoes(prev => 
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      Alert.alert('Erro', 'Não foi possível marcar a notificação como lida.');
    }
  };

  const marcarTodasComoLidas = async () => {
    Alert.alert(
      'Marcar como lidas',
      'Marcar todas as notificações como lidas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Marcar', 
          onPress: async () => {
            try {
              const promises = notificacoes
                .filter(n => !n.lida)
                .map(n => marcarNotificacaoComoLida(n.id));
              await Promise.all(promises);
              setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
            } catch (error) {
              console.error('Erro ao marcar todas como lidas:', error);
              Alert.alert('Erro', 'Não foi possível marcar todas como lidas.');
            }
          }
        }
      ]
    );
  };

  const limparNotificacoes = () => {
    Alert.alert(
      'Limpar Notificações',
      'Remover todas as notificações lidas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: () => setNotificacoes(prev => prev.filter(n => !n.lida))
        }
      ]
    );
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'alerta': return '#FF9500';
      case 'erro': return '#FF3B30';
      case 'sucesso': return '#34C759';
      case 'info': return '#007AFF';
      default: return temaEscuro ? '#666' : '#888';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'alerta': return '⚠️';
      case 'erro': return '❌';
      case 'sucesso': return '✅';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderNotificacao = ({ item }: { item: Notificacao }) => (
    <TouchableOpacity 
      style={[
        styles.notificacaoItem, 
        temaEscuro && styles.notificacaoItemDark,
        !item.lida && styles.notificacaoNaoLida,
        !item.lida && temaEscuro && styles.notificacaoNaoLidaDark
      ]}
      onPress={async () => {
        if (!item.lida) {
          await marcarComoLida(item.id);
        }
        if (item.leito_id) {
          router.push({ pathname: '/leito/[leito_id]', params: { leito_id: item.leito_id.toString() } });
        }
      }}
    >
      <View style={styles.notificacaoHeader}>
        <Text style={styles.notificacaoIcon}>{getTipoIcon(item.tipo)}</Text>
        <View style={styles.notificacaoInfo}>
          <Text style={[styles.notificacaoTitulo, temaEscuro && styles.textLight]}>{item.titulo}</Text>
          <Text style={[styles.notificacaoData, temaEscuro && styles.textMutedLight]}>{formatarData(item.data)}</Text>
        </View>
        <View style={[styles.tipoIndicator, { backgroundColor: getTipoColor(item.tipo) }]} />
      </View>
      <Text style={[styles.notificacaoMensagem, temaEscuro && styles.textLight]}>{item.mensagem}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, temaEscuro && styles.containerDark]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, temaEscuro && styles.textLight]}>Carregando notificações...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, temaEscuro && styles.containerDark]}>
      <View style={[styles.header, temaEscuro && styles.headerDark]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={temaEscuro ? '#FFF' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.title, temaEscuro && styles.textLight]}>Notificações</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={marcarTodasComoLidas}>
            <Text style={[styles.headerButtonText, temaEscuro && styles.textLight]}>Marcar lidas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={limparNotificacoes}>
            <Text style={[styles.headerButtonText, temaEscuro && styles.textLight]}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.filtros, temaEscuro && styles.filtrosDark]}>
        <TouchableOpacity 
          style={[
            styles.filtroButton, 
            temaEscuro && styles.filtroButtonDark,
            filtro === 'todas' && styles.filtroAtivo
          ]}
          onPress={() => setFiltro('todas')}
        >
          <Text style={[
            styles.filtroText, 
            temaEscuro && styles.filtroTextDark,
            filtro === 'todas' && styles.filtroTextAtivo
          ]}>
            Todas ({notificacoes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filtroButton, 
            temaEscuro && styles.filtroButtonDark,
            filtro === 'nao-lidas' && styles.filtroAtivo
          ]}
          onPress={() => setFiltro('nao-lidas')}
        >
          <Text style={[
            styles.filtroText, 
            temaEscuro && styles.filtroTextDark,
            filtro === 'nao-lidas' && styles.filtroTextAtivo
          ]}>
            Não lidas ({notificacoes.filter(n => !n.lida).length})
          </Text>
        </TouchableOpacity>
      </View>

      {notificacoesFiltradas.length === 0 ? (
        <View style={[styles.emptyState, temaEscuro && styles.emptyStateDark]}>
          <Text style={[styles.emptyText, temaEscuro && styles.textLight]}>
            {filtro === 'nao-lidas' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação encontrada'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notificacoesFiltradas}
          renderItem={renderNotificacao}
          keyExtractor={item => item.id.toString()}
          style={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={carregarNotificacoes}
        />
      )}

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
    paddingTop: 20,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateDark: {
    backgroundColor: '#121212',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  backButton: {
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filtros: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filtrosDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333',
  },
  filtroButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filtroButtonDark: {
    backgroundColor: '#333',
  },
  filtroAtivo: {
    backgroundColor: '#007AFF',
  },
  filtroText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  filtroTextDark: {
    color: '#AAA',
  },
  filtroTextAtivo: {
    color: 'white',
  },
  lista: {
    flex: 1,
  },
  notificacaoItem: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificacaoItemDark: {
    backgroundColor: '#1E1E1E',
    shadowOpacity: 0.3,
  },
  notificacaoNaoLida: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificacaoNaoLidaDark: {
    borderLeftColor: '#007AFF',
  },
  notificacaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificacaoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  notificacaoInfo: {
    flex: 1,
  },
  notificacaoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  notificacaoData: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  tipoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificacaoMensagem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  textLight: {
    color: '#FFF',
  },
  textMutedLight: {
    color: '#AAA',
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