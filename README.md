# 💉 AAMI – Acompanhamento Automatizado de Medicação Intravenosa

Este é um projeto desenvolvido para monitorar, em tempo real, **medicações intravenosas** administradas a pacientes. O objetivo é oferecer um acompanhamento seguro e inteligente do processo de infusão, contribuindo para uma gestão hospitalar mais eficiente.

---

## 🚀 Tecnologias Utilizadas

- **Frontend**: [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/)
- **Backend**: [Node.js](https://nodejs.org/)
- **Banco de Dados**: [Supabase](https://supabase.com/) (PostgreSQL com autenticação e realtime)
- **Comunicação IoT**: Microcontrolador com envio de dados via API (detalhes fora deste repositório)
- **Outras bibliotecas**:
  - Express
  - Dotenv
  - React Navigation
  - React Native Paper
  - Entre outras

---

## ⚙️ Instalação e Execução

### 1. Instalar as dependências

Navegue até as pastas do projeto e execute:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Rodar os servidores

Abra dois terminais diferentes.

**Backend:**
```bash
cd backend
npm run dev
```
**Frontend:**
```bash
cd frontend
npm run start
```

---

## 📱 Visualização no celular (Expo Go)
Para testar o aplicativo no seu celular usando o Expo Go, siga os passos abaixo:

### 1. Configure a URL da API
Abra o arquivo:

*frontend/services/api.ts*

Altere a variável API_BASE_URL para o IP da sua máquina na rede local:

```ts
export const API_BASE_URL = 'http://192.168.0.X:3333';
```
Substitua 192.168.0.X pelo IP real do seu computador (verifique ao iniciar o backend).
Exemplo: http://192.168.0.102:3333

### 2. Garanta que:
- O celular e o computador estejam na mesma rede Wi-Fi
- O backend esteja em execução

---

## 📌 Observações
- Este projeto está em desenvolvimento contínuo.
- O firmware do dispositivo IoT que coleta os dados de medicação não está incluído neste repositório.

---

## 🧠 Equipe e Contribuição
**Projeto desenvolvido por:**
- [Ismaelly Eyre](https://github.com/M43lly)
- [Jamily Kelly](https://github.com/JamilyKelly)
- [Lázaro Frederico](https://github.com/lazarofelix)
- [Maria Fernanda](https://github.com/afxrnanda)
- [Thiago Castro](https://github.com/ThiagoCastroo)

### Contribuições são bem-vindas!
Abra uma issue ou envie um pull request. ✨
