# 🪜 Check List — Gestão & Inspeção de Escadas e EPIs

Sistema web em tempo real para controle, inspeção de segurança e solicitação de troca de escadas/EPIs avariados. A aplicação conecta diretamente os técnicos de campo ao painel do administrador, integrando notificações por e-mail e geração de laudos técnicos em PDF.

🌐 **Acesse a aplicação:** [https://check-list-lyart.vercel.app/](https://check-list-lyart.vercel.app/)

---

## 🚀 Funcionalidades Principais

### 📱 Interface do Técnico (`tecnico.html`)
* **Acesso Público:** Acessível via link direto ou QR Code, sem necessidade de login para o técnico.
* **Envio de Evidências:** Permite relatar problemas em escadas anexando dados essenciais (Nome, RE, Identificação do Equipamento e Descrição do defeito).
* **Upload de Imagens:** Suporte para anexar uma foto da avaria (convertida automaticamente em Base64 e limitada a 1MB para persistência leve).
* **Sincronização Instantânea:** Integração com Firebase Firestore que envia os dados ao painel admin em tempo real.

### 🔐 Autenticação (`login.html`)
* **Área Restrita:** Proteção robusta utilizando o **Firebase Authentication** para garantir que apenas administradores cadastrados acessem os dados.
* **Persistência de Sessão:** Gerenciamento automático de tokens para manter o usuário conectado enquanto o navegador estiver aberto.

### 📊 Painel do Administrador (`index.html`)
* **Métricas em Tempo Real:** Cards dinâmicos (`Total`, `Pendentes`, `Aprovadas`, `Negadas`) atualizados via `onSnapshot()` do Firestore sem recarregar a página.
* **Gestão de Chamados:** Listagem visual de solicitações pendentes com opção de expandir imagens anexadas.
* **Aprovação Automatizada:** Ao aprovar um chamado, o sistema altera o status no banco e dispara um e-mail de notificação para o almoxarifado via **EmailJS**.
* **Limpeza de Histórico:** Opção de expurgar o banco de dados utilizando operações em lote (*Batch Delete*).

### 📝 Inspeção de EPIs (`script.js`)
* Módulo offline/local que gerencia inspeções diárias utilizando `localStorage`.
* Permite o upload de até 3 fotos de evidências.
* **Geração de Laudos:** Criação automatizada de PDFs individuais detalhados (via `jsPDF`) contendo o status da inspeção e imagens coletadas.
* **Relatório Mensal:** Consolidação de todas as inspeções do mês vigente em um único documento PDF formatado.

---

## 🛠️ Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3 (Variáveis nativas, Grid, Flexbox) e JavaScript Vanilla (ES6+).
* **Banco de Dados & Auth:** [Firebase v10 (Compat)](https://firebase.google.com/) — Auth & Firestore.
* **Disparo de E-mails:** [EmailJS](https://www.emailjs.com/).
* **Geração de Documentos:** [jsPDF](https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js).
* **Hospedagem:** [Vercel](https://vercel.com/).

---

## 📦 Estrutura de Arquivos

```path
├── index.html      # Painel administrativo e controle de métricas (Protegido)
├── login.html      # Tela de login do administrador (Firebase Auth)
├── tecnico.html    # Formulário público para abertura de chamados pelo técnico
├── script.js       # Lógica do módulo de inspeção de EPIs e geração de PDFs
└── style.css       # Estilização global e responsiva do sistema# -check-list
