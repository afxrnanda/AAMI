import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SnackBar from '../../components/SnackBar';
import { Ionicons } from '@expo/vector-icons';
import { 
  buscarLeitoPorId, 
  buscarIntercorrenciasPorLeito, 
  registrarIntercorrencia, 
  iniciarNovaMedicacao, 
  alterarStatusMedicacao,
  LeitoMonitoramento, 
  Intercorrencia, 
  DadosNovaMedicacaoSimplificada 
} from '../../services/api';
import CustomModal from '../../components/CustomModal';
import { useThemeContext } from '../../themeContext';

const getStatusInfo = (status: LeitoMonitoramento['status_gotejamento']) => {
  switch (status) {
    case 'em-andamento': return { text: 'Em andamento', color: '#007AFF', icon: '💧' };
    case 'alerta': return { text: 'Gotejamento Lento/Rápido', color: '#FF9500', icon: '⚠️' };
    case 'finalizado': return { text: 'Finalizado', color: '#34C759', icon: '✅' };
    case 'pausado': return { text: 'Pausado', color: '#8E8E93', icon: '⏸️' };
    default: return { text: 'Livre', color: '#8E8E93', icon: '⚪' };
  }
};

const formatData = (data?: string) => {
  if (!data) return 'Não informado';
  
  try {
    const dataObj = new Date(data);
    
    if (isNaN(dataObj.getTime())) {
      return 'Data inválida';
    }
    
    return dataObj.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Erro na formatação';
  }
};

export default function LeitoDetalhe() {
  const { temaEscuro } = useThemeContext();
  const { leito_id } = useLocalSearchParams();
  const router = useRouter();
  const [leito, setLeito] = useState<LeitoMonitoramento | null>(null);
  const [intercorrencias, setIntercorrencias] = useState<Intercorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIntercorrencias, setLoadingIntercorrencias] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previsaoCalculada, setPrevisaoCalculada] = useState<Date | null>(null);
  const [showIntercorrenciaModal, setShowIntercorrenciaModal] = useState(false);
  const [showNovaMedicacaoModal, setShowNovaMedicacaoModal] = useState(false);
  const [intercorrenciaText, setIntercorrenciaText] = useState('');
  const [snackBar, setSnackBar] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
  const [confirmacaoModal, setConfirmacaoModal] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [agora, setAgora] = useState(Date.now());
  const [dadosNovaMedicacao, setDadosNovaMedicacao] = useState<DadosNovaMedicacaoSimplificada>({
    observacoes: ''
  });

  const carregarIntercorrencias = useCallback(async () => {
    if (!leito) return;
    
    setLoadingIntercorrencias(true);
    try {
      const data = await buscarIntercorrenciasPorLeito(leito.leito_id);
      setIntercorrencias(data);
    } catch (error) {
      console.error('Erro ao carregar intercorrências:', error);
      setSnackBar({ visible: true, message: 'Erro ao carregar intercorrências', type: 'error' });
    } finally {
      setLoadingIntercorrencias(false);
    }
  }, [leito]);

  useEffect(() => {
    setLoading(true);
    
    const carregarLeito = async () => {
      try {
        const leitoData = await buscarLeitoPorId(Number(leito_id));
        setLeito(leitoData);
      } catch (error) {
        console.error('Erro ao carregar leito:', error);
        setLeito(null);
      } finally {
        setLoading(false);
      }
    };

    carregarLeito();
  }, [leito_id]);

  useEffect(() => {
    if (leito && leito.ocupado) {
      carregarIntercorrencias();
    }
  }, [leito, carregarIntercorrencias]);

  useEffect(() => {
    if (!leito) return;
    const previsaoCalculada = calcularPrevisaoTempo();
    setPrevisaoCalculada(previsaoCalculada);
  }, [leito]);

  useEffect(() => {
    const timer = setInterval(() => {
      setAgora(Date.now());
    }, 1000);
  
    return () => clearInterval(timer);
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (!leito) return <Text style={[styles.error, temaEscuro && styles.textLight]}>Leito não encontrado.</Text>;

  const progresso = leito.peso_inicial_g && leito.peso_atual_g && leito.peso_inicial_g > 0
      ? Math.min(100, Math.max(0, ((leito.peso_inicial_g - leito.peso_atual_g) / leito.peso_inicial_g) * 100))
      : 0;
  const statusInfo = getStatusInfo(leito.status_gotejamento);

  // Calcular previsão de tempo baseado no peso
  const calcularPrevisaoTempo = () => {
    if (!leito.peso_inicial_g || !leito.peso_atual_g || !leito.inicio_medicacao) {
      return null;
    }
    if (isNaN(leito.peso_inicial_g) || isNaN(leito.peso_atual_g)) {
      return null;
    }
    if (leito.peso_inicial_g <= 0) {
      return null;
    }
    if (leito.peso_atual_g < 0) {
      return null;
    }
    const inicioMedicacao = new Date(leito.inicio_medicacao);
    if (isNaN(inicioMedicacao.getTime())) {
      return null;
    }
    const tempoDecorrido = Date.now() - inicioMedicacao.getTime();
    const pesoConsumido = leito.peso_inicial_g - leito.peso_atual_g;
    if (pesoConsumido <= 0 || tempoDecorrido <= 0) {
      return null;
    }
    const taxaConsumo = pesoConsumido / tempoDecorrido;
    if (taxaConsumo <= 0 || !isFinite(taxaConsumo)) {
      return null;
    }
    const tempoRestanteMs = leito.peso_atual_g / taxaConsumo;
    if (tempoRestanteMs <= 0 || !isFinite(tempoRestanteMs) || tempoRestanteMs > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    const previsaoTermino = new Date(Date.now() + tempoRestanteMs);
    
    return previsaoTermino;
  };

  const handlePausarRetomar = () => {
    if (!leito) return;

    const novaStatus = leito.status_gotejamento === 'pausado' ? 'em-andamento' : 'pausado';
    const acao = novaStatus === 'pausado' ? 'pausar' : 'retomar';
    let situacao = ''

    if (acao === 'pausar') {
      situacao = 'pausa'
    } else {
      situacao = 'retomada'
    }
    setConfirmacaoModal({
      visible: true,
      title: `Confirmar ${situacao} na Medicação`,
      message: `Deseja ${acao} a medicação no Leito ${leito.codigo}?`,
      onConfirm: async () => {
        try {
          setSaving(true);
          const resposta = await alterarStatusMedicacao(leito.leito_id, novaStatus);
          setConfirmacaoModal((prev) => ({ ...prev, visible: false }));
      
          setLeito(resposta);
          setSnackBar({ visible: true, message: `Medicação ${situacao} com sucesso!`, type: 'success' });
        } catch (error) {
          console.error(`Erro ao ${acao} medicação:`, error);
          Alert.alert('Erro', `Erro ao ${acao} medicação.`);
        } finally {
          setSaving(false);
        }
      }      
    });
  };

  const handleRegistrarIntercorrencia = () => {
    setShowIntercorrenciaModal(true);
  };

  const handleSalvarIntercorrencia = async () => {
    if (!intercorrenciaText.trim() || !leito) {
      Alert.alert('Erro', 'Por favor, descreva a intercorrência.');
      return;
    }

    setSaving(true);
    try {
      await registrarIntercorrencia(leito.leito_id, intercorrenciaText);
      setShowIntercorrenciaModal(false);
      setIntercorrenciaText('');
      setSnackBar({ visible: true, message: 'Intercorrência registrada com sucesso!', type: 'success' });
      await carregarIntercorrencias();
    } catch (error) {
      console.error('Erro ao registrar intercorrência:', error);
      Alert.alert('Erro no Servidor', 'Não foi possível registrar a intercorrência. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleIniciarNovaMedicacao = () => {
    setShowNovaMedicacaoModal(true);
  };

  const handleSalvarNovaMedicacao = async () => {
    if (!leito) return;

    iniciarMedicacaoSimplificada();
  };



  const iniciarMedicacaoSimplificada = async () => {
    if (!leito) return;

    setSaving(true);
    try {
      const dadosSimplificados = {
        medicamento_atual: 'Medicação em andamento',
        volume_ml: 500, 
        dosagem_mg: 0, 
        fluxo_ml_h: 125, 
        peso_inicial_g: dadosNovaMedicacao.peso_inicial_g || 500, 
        observacoes: dadosNovaMedicacao.observacoes || 'Medicação iniciada via sistema'
      };

      const resultado = await iniciarNovaMedicacao(leito.leito_id, dadosSimplificados);
      
      if (resultado.success && resultado.data) {
        setLeito(resultado.data);
        setShowNovaMedicacaoModal(false);
        setSnackBar({
          visible: true,
          message: 'Medicação iniciada com sucesso!',
          type: 'success'
        });
        
        setDadosNovaMedicacao({
          observacoes: ''
        });
      } else {
        Alert.alert('Erro', resultado.error || 'Erro ao iniciar medicação');
      }
    } catch (error) {
      console.error('Erro ao iniciar medicação:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao iniciar a medicação.');
    } finally {
      setSaving(false);
    }
  };

  const limparFormularioNovaMedicacao = () => {
    setDadosNovaMedicacao({
      observacoes: ''
    });
    setShowNovaMedicacaoModal(false);
  };

  return (
    <View style={{flex: 1}}>
        <ScrollView style={[styles.container, temaEscuro && styles.containerDark]}>
            <View style={[styles.header, { backgroundColor: statusInfo.color }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Leito {leito.codigo}</Text>
                <Text style={styles.headerStatus}>{statusInfo.icon} {statusInfo.text}</Text>
            </View>

            {leito.ocupado && leito.peso_inicial_g && leito.peso_inicial_g > 0 ? (
                <>
                    <View style={[styles.section, temaEscuro && styles.sectionDark]}>
                        <Text style={[styles.sectionTitle, temaEscuro && styles.textLight]}>Progresso da Medicação</Text>
                        <View style={[styles.progressBarBackground, temaEscuro && styles.progressBarBackgroundDark]}>
                            <View style={[styles.progressBarFill, { width: `${progresso}%` }]} />
                        </View>
                        <View style={styles.progressDetails}>
                            <Text style={temaEscuro && styles.textLight}>
                              {leito.peso_atual_g?.toFixed(1)}g / {leito.peso_inicial_g?.toFixed(1)}g
                            </Text>
                            <Text style={[styles.progressText, temaEscuro && styles.textLight]}>
                              {Math.round(progresso)}% consumido
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.section, temaEscuro && styles.sectionDark]}>
                        <Text style={[styles.sectionTitle, temaEscuro && styles.textLight]}>Informações de Tempo</Text>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, temaEscuro && styles.textMutedLight]}>Início da Medicação:</Text>
                            <Text style={[styles.infoValue, temaEscuro && styles.textLight]}>{formatData(leito.inicio_medicacao)}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, temaEscuro && styles.textMutedLight]}>Previsão de Término:</Text>
                            <Text style={[styles.infoValue, temaEscuro && styles.textLight]}>
                              {
                                previsaoCalculada 
                                  ? formatData(previsaoCalculada.toISOString())
                                  : leito.previsao_termino 
                                    ? formatData(leito.previsao_termino)
                                    : 'Calculando...'
                              }
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, temaEscuro && styles.textMutedLight]}>Tempo Ocioso:</Text>
                            <Text style={[styles.infoValue, temaEscuro && styles.textLight]}>
                              {leito.tempo_ocioso_segundos != null
                                ? `${Math.floor(leito.tempo_ocioso_segundos / 60)} min ${leito.tempo_ocioso_segundos % 60} s`
                                : 'Não informado'}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.section, temaEscuro && styles.sectionDark]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, temaEscuro && styles.textLight]}>Intercorrências</Text>
                            {loadingIntercorrencias && <ActivityIndicator size="small" color="#007AFF" />}
                        </View>
                        
                        {intercorrencias.length === 0 ? (
                            <Text style={[styles.noIntercorrencias, temaEscuro && styles.textMutedLight]}>
                              Nenhuma intercorrência registrada
                            </Text>
                        ) : (
                            intercorrencias.map((intercorrencia) => (
                                <View key={intercorrencia.id} style={[styles.intercorrenciaItem, temaEscuro && styles.intercorrenciaItemDark]}>
                                    <Text style={[styles.intercorrenciaDescricao, temaEscuro && styles.textLight]}>
                                      {intercorrencia.descricao}
                                    </Text>
                                    <Text style={[styles.intercorrenciaData, temaEscuro && styles.textMutedLight]}>
                                        {formatData(intercorrencia.data_registro)}
                                    </Text>
                                    <View style={[styles.statusBadge, { backgroundColor: intercorrencia.status === 'pendente' ? '#FF9500' : '#34C759' }]}>
                                        <Text style={styles.statusText}>{intercorrencia.status}</Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    <View style={styles.actionsSection}>
                        <TouchableOpacity 
                          style={[styles.actionButton, leito.status_gotejamento === 'pausado' && styles.resumeButton]} 
                          onPress={handlePausarRetomar}
                        >
                            <Text style={[styles.actionButtonText, leito.status_gotejamento === 'pausado' && styles.resumeButtonText]}>
                              {leito.status_gotejamento === 'pausado' ? 'Retomar' : 'Pausar'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.secondaryButton, temaEscuro && styles.secondaryButtonDark]} 
                          onPress={handleRegistrarIntercorrencia}
                        >
                            <Text style={[styles.actionButtonText, styles.secondaryButtonText, temaEscuro && styles.secondaryButtonTextDark]}>
                              Registrar Intercorrência
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <View style={[styles.section, temaEscuro && styles.sectionDark]}>
                    <Text style={[styles.livreText, temaEscuro && styles.textMutedLight]}>Este leito está livre.</Text>
                    <Text style={[styles.infoText, temaEscuro && styles.textMutedLight, { marginBottom: 15, textAlign: 'center' }]}>
                        Para iniciar a medicação, pressione o botão físico no dispositivo ESP32.
                    </Text>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.secondaryButton, temaEscuro && styles.secondaryButtonDark]} 
                        onPress={handleIniciarNovaMedicacao}
                    >
                        <Text style={[styles.actionButtonText, styles.secondaryButtonText, temaEscuro && styles.secondaryButtonTextDark]}>
                            Configurar Dados Padrão
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Modal para Registrar Intercorrência */}
            <Modal
                visible={showIntercorrenciaModal}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, temaEscuro && styles.modalContentDark]}>
                    <Text style={[styles.modalTitle, temaEscuro && styles.textLight]}>Registrar Intercorrência</Text>
                    <Text style={[styles.modalSubtitle, temaEscuro && styles.textMutedLight]}>Leito {leito.codigo}</Text>
                    
                    <TextInput
                      style={[styles.textArea, temaEscuro && styles.textAreaDark]}
                      placeholder="Descreva a intercorrência observada..."
                      placeholderTextColor={temaEscuro ? '#888' : '#999'}
                      value={intercorrenciaText}
                      onChangeText={setIntercorrenciaText}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                    
                    <View style={styles.modalButtons}>
                      <TouchableOpacity 
                        style={[styles.modalButton, styles.cancelModalButton, temaEscuro && styles.cancelModalButtonDark]} 
                        onPress={() => {
                          setIntercorrenciaText('');
                          setShowIntercorrenciaModal(false);
                        }}
                      >
                        <Text style={[styles.cancelModalButtonText, temaEscuro && styles.textLight]}>Cancelar</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.modalButton, styles.saveModalButton, saving && {backgroundColor: '#ccc'}]} 
                        onPress={handleSalvarIntercorrencia}
                        disabled={saving}
                      >
                        <Text style={styles.saveModalButtonText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
                      </TouchableOpacity>
                    </View>
                </View>
                </View>
            </Modal>

            {/* Modal para Configurar Dados Padrão */}
            <Modal
                visible={showNovaMedicacaoModal}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, styles.largeModalContent, temaEscuro && styles.modalContentDark]}>
                    <Text style={[styles.modalTitle, temaEscuro && styles.textLight]}>Iniciar Medicação</Text>
                    <Text style={[styles.modalSubtitle, temaEscuro && styles.textMutedLight]}>Leito {leito.codigo}</Text>
                    <Text style={[styles.infoText, temaEscuro && styles.textMutedLight, { marginBottom: 15, textAlign: 'center' }]}>
                        Todos os campos são opcionais. A medicação será iniciada com valores padrão.
                    </Text>
                    
                    <ScrollView style={styles.formScrollView}>
                        <View style={styles.formGroup}>
                            <Text style={[styles.formLabel, temaEscuro && styles.textLight]}>Peso Inicial (g)</Text>
                            <TextInput
                                style={[styles.formInput, temaEscuro && styles.formInputDark]}
                                placeholder="Opcional - ex: 500"
                                placeholderTextColor={temaEscuro ? '#888' : '#999'}
                                value={dadosNovaMedicacao.peso_inicial_g?.toString() || ''}
                                onChangeText={(text) => setDadosNovaMedicacao({...dadosNovaMedicacao, peso_inicial_g: text ? parseInt(text) || undefined : undefined})}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.formLabel, temaEscuro && styles.textLight]}>Observações</Text>
                            <TextInput
                                style={[styles.formInput, styles.textArea, temaEscuro && styles.textAreaDark]}
                                placeholder="Observações adicionais sobre a medicação..."
                                placeholderTextColor={temaEscuro ? '#888' : '#999'}
                                value={dadosNovaMedicacao.observacoes}
                                onChangeText={(text) => setDadosNovaMedicacao({...dadosNovaMedicacao, observacoes: text})}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>


                    </ScrollView>
                    
                    <View style={styles.modalButtons}>
                      <TouchableOpacity 
                        style={[styles.modalButton, styles.cancelModalButton, temaEscuro && styles.cancelModalButtonDark]} 
                        onPress={limparFormularioNovaMedicacao}
                      >
                        <Text style={[styles.cancelModalButtonText, temaEscuro && styles.textLight]}>Cancelar</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.modalButton, styles.saveModalButton, saving && {backgroundColor: '#ccc'}]} 
                        onPress={handleSalvarNovaMedicacao}
                        disabled={saving}
                      >
                        <Text style={styles.saveModalButtonText}>{saving ? 'Iniciando...' : 'Iniciar Medicação'}</Text>
                      </TouchableOpacity>
                    </View>
                </View>
                </View>
            </Modal>
        </ScrollView>

        {/* Modal de Confirmação */}
        <CustomModal
          visible={confirmacaoModal.visible}
          onClose={() => setConfirmacaoModal({ ...confirmacaoModal, visible: false })}
          onConfirm={confirmacaoModal.onConfirm}
          title={confirmacaoModal.title}
          closeText="Cancelar"
          confirmText="Confirmar"
        >
          <Text style={[temaEscuro ? styles.textLight : styles.textDark, { textAlign: 'center' }]}>
            {confirmacaoModal.message}
          </Text>
        </CustomModal>

        <SnackBar 
            message={snackBar.message}
            visible={snackBar.visible}
            onDismiss={() => setSnackBar({ ...snackBar, visible: false })}
            type={snackBar.type}
        />
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
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionDark: {
    backgroundColor: '#1E1E1E',
    shadowOpacity: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  livreText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  error: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginVertical: 10,
  },
  progressBarBackgroundDark: {
    backgroundColor: '#333',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  progressText: {
    fontWeight: 'bold',
  },
  noIntercorrencias: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  intercorrenciaItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  intercorrenciaItemDark: {
    borderBottomColor: '#333',
  },
  intercorrenciaDescricao: {
    fontSize: 16,
    marginBottom: 4,
  },
  intercorrenciaData: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  resumeButton: {
    backgroundColor: '#34C759',
  },
  resumeButtonText: {
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonDark: {
    borderColor: '#007AFF',
    backgroundColor: '#1E1E1E',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  secondaryButtonTextDark: {
    color: '#007AFF',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
  },
  modalContentDark: {
    backgroundColor: '#1E1E1E',
  },
  largeModalContent: {
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    minHeight: 100,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  textAreaDark: {
    borderColor: '#444',
    backgroundColor: '#333',
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelModalButton: {
    backgroundColor: '#e0e0e0',
  },
  cancelModalButtonDark: {
    backgroundColor: '#333',
  },
  saveModalButton: {
    backgroundColor: '#007AFF',
  },
  cancelModalButtonText: {
    color: '#333',
  },
  saveModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  formScrollView: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 15,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formGroupHalf: {
    width: '48%',
  },
  formLabel: {
    marginBottom: 5,
    fontWeight: '600',
    color: '#333',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  formInputDark: {
    borderColor: '#444',
    backgroundColor: '#333',
    color: 'white',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 6,
    marginTop: 10,
  },
  infoBoxDark: {
    backgroundColor: '#0d47a133',
  },
  infoBoxTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#0d47a1',
  },
  infoBoxText: {
    color: '#333',
    marginBottom: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoRowDark: {
    borderBottomColor: '#333',
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  infoValue: {
    color: '#333',
  },
  textLight: {
    color: '#fff',
  },
  textDark: {
    color: '#333',
  },
  textMutedLight: {
    color: '#aaa',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});