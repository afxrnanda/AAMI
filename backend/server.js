import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import funcionarioRoutes from './routes/funcionario.routes.js';
import pacienteRoutes from './routes/paciente.routes.js';
import medicamentoRoutes from './routes/medicamento.routes.js';
import medicacaoRoutes from './routes/medicacao.routes.js';
import sensorRoutes from './routes/sensor.routes.js';
import manutencaoRoutes from './routes/manutencao.routes.js';
import leitoRoutes from './routes/leito.routes.js';  
import intercorrenciaRoutes from './routes/intercorrencia.routes.js';
import { requireAuth } from './middlewares/requireAuth.js';
import leitoEsp32Routes from './routes/leitoEsp32.routes.js';
import notificacaoRoutes from './routes/notificacao.routes.js';
import { executarLimpezaAutomatica } from './services/notificacao.service.js';
import medicacaoEsp32Routes from './routes/medicacaoESP32.routes.js';
import atendimentoRoutes from './routes/atendimento.routes.js';

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/funcionarios',  funcionarioRoutes);
app.use('/pacientes', pacienteRoutes);
app.use('/medicamentos', medicamentoRoutes);
app.use('/medicacoes', medicacaoRoutes);
app.use('/sensores', sensorRoutes);
app.use('/manutencoes', manutencaoRoutes);
app.use('/intercorrencias', intercorrenciaRoutes);
app.use('/leitos', leitoRoutes); 
app.use('/notificacoes', notificacaoRoutes);
app.use('/medicacoes-esp32', medicacaoEsp32Routes);
app.use('/atendimentos', atendimentoRoutes);
// Rota pública para ESP32 (sem autenticação)
app.use('/leitos-esp32', leitoEsp32Routes);


// Cron job para limpar notificações antigas (executa uma vez por dia às 2h da manhã)
setInterval(async () => {
  const agora = new Date();
  if (agora.getHours() === 2 && agora.getMinutes() === 0) {
    try {
      await executarLimpezaAutomatica();
    } catch (error) {
      console.error('Erro no cron job de limpeza:', error);
    }
  }
}, 60000); // Verifica a cada minuto

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
