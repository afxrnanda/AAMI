import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeContext } from '../../themeContext';
import { buscarLeitos, LeitoMonitoramento } from '../../services/api';
import Header from '../../components/Header';
import PrevisaoTermino from '../../components/PrevisaoTermino';

type FiltroTipo = 'todos' | 'em-andamento' | 'finalizada' | 'manutencao' | 'livres' | 'alertas' | 'pausados';

const getStatusInfo = (status: LeitoMonitoramento['status_gotejamento']) => {
  switch (status) {
    case 'em-andamento': return { text: 'Em andamento', color: '#007AFF', icon: '💧' };
    case 'alerta': return { text: 'Gotejamento Lento/Rápido', color: '#FF9500', icon: '⚠️' };
    case 'finalizado': return { text: 'Finalizado', color: '#34C759', icon: '✅' };
    case 'pausado': return { text: 'Pausado', color: '#8E8E93', icon: '⏸️' };
    case 'nenhum': return { text: 'Livre', color: '#8E8E93', icon: '⚪' };
    default: return { text: 'Desconhecido', color: '#666', icon: '❓' };
  }
};

const ProgressBar = ({ progresso }: { progresso: number }) => (
  <View style={styles.progressBarBackground}>
    <View style={[styles.progressBarFill, { width: `${progresso}%` }]} />
  </View>
);

export default function LeitosList() {
  const { temaEscuro } = useThemeContext();
  const [leitos, setLeitos] = useState<LeitoMonitoramento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroTipo>('todos');
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('token').then(t => setToken(t));
  }, []);

  useEffect(() => {
    if (!token) return;

    setLoading(true);

    const fetchLeitos = async () => {
      try {
        const data = await buscarLeitos();
        setLeitos(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar leitos:', error);
        setLoading(false);
      }
    };

    fetchLeitos();

    const intervalId = setInterval(fetchLeitos, 5000);

    return () => clearInterval(intervalId);
  }, [token]);

  const leitosFiltrados = leitos.filter(leito => {
    switch (filtroAtivo) {
      case 'em-andamento':
        return leito.status_gotejamento === 'em-andamento';
      case 'finalizada':
        return leito.status_gotejamento === 'finalizado';
      case 'manutencao':
        return leito.em_manutencao === true;
      case 'livres':
        return !leito.ocupado && !leito.em_manutencao;
      case 'alertas':
        return leito.status_gotejamento === 'alerta';
      case 'pausados':
        return leito.status_gotejamento === 'pausado';
      case 'todos':
      default:
        return true;
    }
  });

  const filtros = [
    { id: 'todos' as FiltroTipo, label: 'Todos', icon: '🏥', count: leitos.length },
    { id: 'em-andamento' as FiltroTipo, label: 'Em Andamento', icon: '💧', count: leitos.filter(l => l.status_gotejamento === 'em-andamento').length },
    { id: 'finalizada' as FiltroTipo, label: 'Finalizada', icon: '✅', count: leitos.filter(l => l.status_gotejamento === 'finalizado').length },
    { id: 'manutencao' as FiltroTipo, label: 'Manutenção', icon: '🔧', count: leitos.filter(l => l.em_manutencao).length },
    { id: 'livres' as FiltroTipo, label: 'Livres', icon: '⚪', count: leitos.filter(l => !l.ocupado && !l.em_manutencao).length },
    { id: 'alertas' as FiltroTipo, label: 'Alertas', icon: '⚠️', count: leitos.filter(l => l.status_gotejamento === 'alerta').length },
    { id: 'pausados' as FiltroTipo, label: 'Pausados', icon: '⏸️', count: leitos.filter(l => l.status_gotejamento === 'pausado').length },
  ];

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={temaEscuro ? '#68BEF1' : undefined} />;

  const renderLeito = ({ item }: { item: LeitoMonitoramento }) => {
    // Calcular progresso da medicação (percentual consumido)
    const progresso = item.peso_inicial_g && item.peso_atual_g && item.peso_inicial_g > 0
      ? Math.min(100, Math.max(0, ((item.peso_inicial_g - item.peso_atual_g) / item.peso_inicial_g) * 100))
      : 0;
    const statusInfo = getStatusInfo(item.status_gotejamento);
    
    const calcularPrevisaoTempo = () => {
      if (!item.peso_inicial_g || !item.peso_atual_g || !item.inicio_medicacao) {
        return null;
      }
      if (isNaN(item.peso_inicial_g) || isNaN(item.peso_atual_g)) {
        return null;
      }
      if (item.peso_inicial_g <= 0) {
        return null;
      }
      if (item.peso_atual_g < 0) {
        return null;
      }
      const inicioMedicacao = new Date(item.inicio_medicacao);
      if (isNaN(inicioMedicacao.getTime())) {
        return null;
      }
      const tempoDecorrido = Date.now() - inicioMedicacao.getTime();
      const pesoConsumido = item.peso_inicial_g - item.peso_atual_g;
      if (pesoConsumido <= 0 || tempoDecorrido <= 0) {
        return null;
      }
      const taxaConsumo = pesoConsumido / tempoDecorrido;
      if (taxaConsumo <= 0 || !isFinite(taxaConsumo)) {
        return null;
      }
      const tempoRestanteMs = item.peso_atual_g / taxaConsumo;
      if (tempoRestanteMs <= 0 || !isFinite(tempoRestanteMs) || tempoRestanteMs > 24 * 60 * 60 * 1000) {
        return null;
      }
      
      const previsaoTermino = new Date(Date.now() + tempoRestanteMs);
      
      return previsaoTermino;
    };

    return (
      <TouchableOpacity
        style={[
          styles.leitoBox,
          { borderLeftColor: statusInfo.color },
          temaEscuro && styles.leitoBoxDark
        ]}
        onPress={() => router.push({ pathname: '/leito/[leito_id]', params: { leito_id: item.leito_id.toString() } })}
      >
        <View style={styles.leitoHeader}>
          <Text style={[styles.codigo, temaEscuro && styles.textDark]}>Leito {item.codigo}</Text>
          <View style={styles.statusContainer}>
            {item.em_manutencao && (
              <View style={styles.manutencaoBadge}>
                <Text style={styles.manutencaoText}>🔧 Manutenção</Text>
              </View>
            )}
            <Text style={[styles.status, { color: statusInfo.color }]}>
              {statusInfo.icon} {statusInfo.text}
            </Text>
          </View>
        </View>

        {item.ocupado && item.peso_inicial_g && item.peso_inicial_g > 0 ? (
          <View style={styles.medicacaoInfo}>
            <ProgressBar progresso={progresso} />
            <View style={styles.progressoDetails}>
              <Text style={[styles.peso, temaEscuro && styles.textMutedDark]}>{item.peso_atual_g}g / {item.peso_inicial_g}g</Text>
              <Text style={[styles.tempoRestante, temaEscuro && styles.textMutedDark]}>
                <PrevisaoTermino
                  pesoInicial={item.peso_inicial_g}
                  pesoAtual={item.peso_atual_g}
                  inicioMedicacao={item.inicio_medicacao}
                />
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.livreText, temaEscuro && styles.textMutedDark]}>
            {item.em_manutencao ? 'Em manutenção' : 'Leito livre'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{flex: 1}}>
      <Header title="Leitos" />
      <View style={[styles.container, temaEscuro && styles.containerDark]}>
        <View style={styles.filtrosContainer}>
          <View style={styles.filtrosGrid}>
            {filtros.filter(filtro => filtro.count > 0).map((filtro) => (
              <Chip
                key={filtro.id}
                selected={filtroAtivo === filtro.id}
                onPress={() => setFiltroAtivo(filtro.id)}
                style={[
                  styles.chip,
                  temaEscuro ? (filtroAtivo === filtro.id ? styles.chipSelecionadoDark : styles.chipDark) : (filtroAtivo === filtro.id ? styles.chipSelecionado : null),
                ]}
                textStyle={[
                  styles.chipText,
                  temaEscuro ? (filtroAtivo === filtro.id ? styles.chipTextSelecionadoDark : styles.chipTextDark) : (filtroAtivo === filtro.id ? styles.chipTextSelecionado : null),
                ]}
                showSelectedOverlay
              >
                {filtro.icon} {filtro.label} ({filtro.count})
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.resultadosContainer}>
          <Text style={[styles.resultadosText, temaEscuro && styles.textMutedDark]}>
            {leitosFiltrados.length} de {leitos.length} leitos
          </Text>
        </View>

        <FlatList
          data={leitosFiltrados}
          keyExtractor={item => item.leito_id.toString()}
          renderItem={renderLeito}
          contentContainerStyle={{ paddingBottom: 80 }}
        />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 10, 
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#121212',
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
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center',
    marginTop: 35,
    color: '#333'
  },
  textDark: {
    color: '#FFFFFF',
  },
  filtrosContainer: {
    marginBottom: 15,
  },
  filtrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 5,
  },
  chip: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 8,
  },
  chipDark: {
    backgroundColor: '#2A2A2A',
    borderColor: '#444',
  },
  chipSelecionado: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipSelecionadoDark: {
    backgroundColor: '#3399FF',
    borderColor: '#3399FF',
  },
  chipText: {
    color: '#666',
    fontSize: 12,
  },
  chipTextDark: {
    color: '#DDD',
  },
  chipTextSelecionado: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chipTextSelecionadoDark: {
    color: '#FFF',
  },
  resultadosContainer: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  resultadosText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  textMutedDark: {
    color: '#AAA',
  },
  leitoBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
  },
  leitoBoxDark: {
    backgroundColor: '#1E1E1E',
    shadowOpacity: 0.6,
  },
  leitoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  codigo: { 
    fontWeight: 'bold', 
    fontSize: 18,
    color: '#333'
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  manutencaoBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  manutencaoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  medicacaoInfo: {
    marginTop: 5,
  },
  medicamento: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  progressoDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  peso: {
    fontSize: 12,
    color: '#666',
  },
  tempoRestante: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  livreText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginVertical: 15,
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
