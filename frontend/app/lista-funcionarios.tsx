import React, { useState, useEffect } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Tipo dos dados do funcionário
type Funcionario = {
  id: number;
  nome: string;
  cargo: string;
  email: string;
  registro: string;
  telefone: string;
  senha: string;
};

const mockFuncionarios: Funcionario[] = [
  {
    id: 1,
    nome: 'A pessoa aleatoria 1',
    cargo: 'Enfermeiro',
    email: 'aleatorio1@gmail.com',
    registro: 'REG0000',
    telefone: '(84) 90000-0000',
    senha: 'senha123',
  },
  {
    id: 2,
    nome: 'A pessoa aleatoria 2',
    cargo: 'Técnico de enfermagem',
    email: 'aleatorio2@gmail.com',
    registro: 'REG1111',
    telefone: '(84) 91111-1111',
    senha: 'senha123',
  },
  {
    id: 3,
    nome: 'Thiago',
    cargo: 'Menino da TI',
    email: 'Thiago@email.com',
    registro: 'REG3333',
    telefone: '(84) 93333-3333',
    senha: 'senha123',
  },
  {
    id: 4,
    nome: 'Lazaro',
    cargo: 'Menino da TI 2',
    email: 'Lazaro@hotmail.com',
    registro: 'REG4444',
    telefone: '(84) 94444-4444',
    senha: 'senha123',
  },
];

export default function FuncionariosList() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'cadastro' | 'edicao' | 'exclusao' | null>(null);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<Funcionario | null>(null);
  const router = useRouter();

  useEffect(() => {
    setFuncionarios(mockFuncionarios);
  }, []);

  const abrirModal = (tipo: 'cadastro' | 'edicao' | 'exclusao', funcionario?: Funcionario) => {
    setFuncionarioSelecionado(funcionario || null);
    setModalType(tipo);
    setModalVisible(true);
  };

  const fecharModal = () => {
    setModalVisible(false);
    setModalType(null);
    setFuncionarioSelecionado(null);
  };

  const renderFuncionario = ({ item }: { item: Funcionario }) => (
    <View style={styles.card}>
      <Text style={styles.nome}>{item.nome}</Text>
      <View style={styles.botoesAcoes}>
        <TouchableOpacity onPress={() => abrirModal('edicao', item)} style={styles.botaoEditar}>
          <Ionicons name="create-outline" size={18} color="#003B5C" />
          <Text style={styles.textoEditar}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => abrirModal('exclusao', item)}>
          <MaterialIcons name="delete" size={22} color="#C62828" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#003B5C" />
      </TouchableOpacity>

      <Text style={styles.titulo}>Funcionários</Text>

      <FlatList
        data={funcionarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFuncionario}
        style={styles.lista}
      />

      <TouchableOpacity style={styles.botaoCadastrar} onPress={() => abrirModal('cadastro')}>
        <Text style={styles.textoBotaoCadastrar}>Cadastrar</Text>
      </TouchableOpacity>

      {/* Modal de Cadastro, Edição e Exclusão */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>
                {modalType === 'cadastro' && 'Cadastro de Funcionário'}
                {modalType === 'edicao' && 'Editar Funcionário'}
                {modalType === 'exclusao' && 'Confirmação de Exclusão'}
              </Text>
              <TouchableOpacity onPress={fecharModal}>
                <Ionicons name="close" size={22} color="#003B5C" />
              </TouchableOpacity>
            </View>

            {modalType === 'exclusao' ? (
              <View>
                <Text style={styles.confirmacaoTexto}>Tem certeza que deseja excluir o funcionário:</Text>
                <Text style={styles.funcionarioNome}>{funcionarioSelecionado?.nome}</Text>
                <View style={styles.modalBotoesLinha}>
                  <TouchableOpacity style={styles.botaoNao} onPress={fecharModal}>
                    <Text style={styles.textoNao}>Não</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.botaoSim} onPress={() => {
                    console.log('Excluir', funcionarioSelecionado);
                    fecharModal();
                  }}>
                    <Text style={styles.textoSim}>Sim</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <TextInput style={styles.input} placeholder="Nome completo" defaultValue={funcionarioSelecionado?.nome} />
                <TextInput style={styles.input} placeholder="Cargo" defaultValue={funcionarioSelecionado?.cargo} />
                <TextInput style={styles.input} placeholder="Email" defaultValue={funcionarioSelecionado?.email} />
                <TextInput style={styles.input} placeholder="Registro profissional" defaultValue={funcionarioSelecionado?.registro} />
                <TextInput style={styles.input} placeholder="Telefone" defaultValue={funcionarioSelecionado?.telefone} />
                <TextInput style={styles.input} placeholder="Senha" secureTextEntry defaultValue={funcionarioSelecionado?.senha} />
                <TouchableOpacity style={styles.botaoSim} onPress={() => {
                  console.log(modalType === 'cadastro' ? 'Cadastrar' : 'Salvar edição');
                  fecharModal();
                }}>
                  <Text style={styles.textoSim}>{modalType === 'cadastro' ? 'Cadastrar' : 'Salvar'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

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
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: 20, 
    paddingTop: 80 
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 15,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20,
    marginLeft: 50,
    color: '#003B5C' 
  },
  lista: { 
    flexGrow: 0, 
    marginBottom: 20 
  },
  card: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nome: { 
    flex: 1, 
    fontSize: 14, 
    color: '#003B5C' 
  },
  botoesAcoes: { 
    flexDirection: 'row', 
    gap: 10, 
    alignItems: 'center' 
  },
  botaoEditar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  textoEditar: { 
    fontSize: 12, 
    color: '#003B5C' 
  },
  botaoCadastrar: {
    backgroundColor: '#134F71',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 70,
  },
  textoBotaoCadastrar: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '500' 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    width: '85%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitulo: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#003B5C' 
  },
  confirmacaoTexto: { 
    fontSize: 14, 
    marginBottom: 10, 
    color: '#333' 
  },
  funcionarioNome: { 
    fontWeight: 'bold', 
    fontSize: 14, 
    marginBottom: 20, 
    color: '#003B5C' 
  },
  input: {
    borderWidth: 1,
    borderColor: '#B0BEC5',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  modalBotoesLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  botaoNao: {
    borderColor: '#134F71',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  textoNao: { 
    color: '#134F71', 
    fontWeight: 'bold' 
  },
  botaoSim: {
    backgroundColor: '#134F71',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  textoSim: { 
    color: '#FFFFFF', 
    fontWeight: 'bold' 
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
