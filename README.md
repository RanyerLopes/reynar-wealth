# 👑 Reynar Wealth

<p align="center">
  <img src="public/crown.svg" alt="Reynar Wealth Logo" width="80" height="80">
</p>

<p align="center">
  <b>Seu assistente financeiro pessoal com IA</b><br>
  Gerencie investimentos, acompanhe cotações em tempo real e tome decisões inteligentes.
</p>

---

## 🚀 Funcionalidades

### 💰 Gestão Financeira
- **Dashboard** - Visão geral de receitas, despesas e patrimônio
- **Extrato** - Histórico de transações com categorização automática
- **Contas a Pagar** - Controle de faturas e boletos recorrentes
- **Metas** - Defina objetivos financeiros e acompanhe o progresso
- **Empréstimos** - Controle de valores emprestados ("Me Devem")

### 📈 Investimentos
- **Cotações em Tempo Real** - Integração com BRAPI para ações B3
- **Indicadores Econômicos** - Selic, IPCA, CDI e Poupança
- **Comparador de Rendimentos** - Compare sua carteira vs CDI, Poupança e inflação
- **Logos das Empresas** - Ícones das ações brasileiras

### 🤖 IA Integrada
- **Conselheiro Real** - Assistente IA integrado
- **Análise de Extratos** - Importação e parsing de PDFs bancários
- **Insights Personalizados** - Sugestões baseadas no seu perfil

### 🎮 Gamificação
- Sistema de **XP e Níveis**
- **Conquistas** desbloqueáveis
- Animações de **moedas** ao completar ações

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **React 18** | Framework principal |
| **TypeScript** | Tipagem estática |
| **Vite** | Build tool |
| **Tailwind CSS** | Estilização |
| **Supabase** | Backend (Auth + Database) |
| **IA Generativa** | Assistente inteligente |
| **BRAPI** | Cotações de ações |
| **Recharts** | Gráficos |
| **Lucide React** | Ícones |

---

## 📁 Arquitetura

```
reynar-wealth/
├── components/          # Componentes React reutilizáveis
│   ├── UI.tsx           # Design system (Button, Card, Input...)
│   ├── Navigation.tsx   # Menu lateral e navegação
│   ├── ErrorBoundary.tsx # Tratamento de erros
│   └── AIConsultant.tsx # Widget do assistente IA
├── pages/               # Páginas da aplicação
│   ├── Dashboard.tsx    # Página inicial
│   ├── Investments.tsx  # Gestão de investimentos
│   ├── Transactions.tsx # Extrato financeiro
│   ├── Bills.tsx        # Contas a pagar
│   ├── Goals.tsx        # Metas financeiras
│   └── ...
├── services/            # Serviços e APIs
│   ├── stockService.ts  # Integração BRAPI (cotações)
│   ├── geminiService.ts # Integração IA generativa
│   └── pdfParserService.ts # Parser de PDFs bancários
├── context/             # React Context providers
│   ├── AuthContext.tsx  # Autenticação
│   ├── GamificationContext.tsx # XP e níveis
│   └── SubscriptionContext.tsx # Planos (Free/Pro)
├── hooks/               # Custom hooks
│   └── useDatabase.ts   # Hooks para Supabase
├── types.ts             # Tipos TypeScript
├── App.tsx              # Componente raiz
└── index.css            # Estilos globais
```

---

## 🔧 Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/RanyerLopes/reynar-wealth.git
cd reynar-wealth
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local`:
```env
# Supabase
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase

# IA (opcional)
VITE_GEMINI_API_KEY=sua_chave_api

# BRAPI (opcional - tem fallback)
VITE_BRAPI_TOKEN=seu_token_brapi
```

### 4. Execute o projeto
```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 📊 Integrações

### BRAPI (Cotações)
- **Endpoint**: `https://brapi.dev/api`
- **Recursos**: Cotações B3, logos, dividendos
- **Free tier**: 150.000 requisições/mês

### IA Generativa
- **Modelo**: LLM avançado
- **Uso**: Conselheiro financeiro, análise de extratos

### Supabase
- **Auth**: Login com Google/Email
- **Database**: PostgreSQL para dados do usuário

---

## 🎨 Design System

### Cores
```css
--background: #0a0a0a;
--surface: #18181b;
--primary: #8B5CF6 (roxo);
--secondary: #22C55E (verde);
--danger: #EF4444 (vermelho);
```

### Componentes
- `<Button>` - Botões com variantes (primary, secondary, ghost)
- `<Card>` - Containers com glassmorphism
- `<Input>` - Campos de formulário estilizados
- `<Modal>` - Dialogs com backdrop blur

---

## 📱 Responsividade

- **Desktop**: Sidebar fixa à esquerda
- **Mobile**: Bottom navigation com scroll horizontal
- **Tablet**: Layout adaptativo

---

## 🔐 Segurança

- API Keys em variáveis de ambiente
- Error Boundaries para captura de erros
- Autenticação via Supabase Auth
- Row Level Security no banco de dados

---

## 📄 Licença

Este projeto é privado. © 2024 Reynar Wealth

---

<p align="center">
  Feito com 💜 por <a href="https://github.com/RanyerLopes">Ranyer Lopes</a>
</p>
