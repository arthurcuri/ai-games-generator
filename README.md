# 🎮 AI Games Generator

Um gerador de jogos HTML5 inteligente que cria jogos instantaneamente jogáveis usando apenas prompts de texto!

## 🚀 Funcionalidades

- **Geração de Jogos com IA**: Crie jogos completos usando apenas descrições em linguagem natural
- **Preview Instantâneo**: Visualize e jogue seus jogos imediatamente após a criação
- **HTML5 Puro**: Jogos gerados usando apenas HTML, CSS e JavaScript vanilla
- **Download de Projetos**: Baixe o código fonte completo em formato ZIP
- **Interface Intuitiva**: Interface moderna e responsiva para criação de jogos
- **Multiplataforma**: Jogos funcionam em qualquer navegador moderno

## 🛠️ Tecnologias

### Frontend
- **React** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (estilização)
- **shadcn/ui** (componentes UI)

### Backend
- **FastAPI** (Python)
- **Google Gemini AI** (geração de jogos)
- **Uvicorn** (servidor ASGI)

## 📋 Pré-requisitos

- **Node.js** (v16+)
- **Python** (3.11+)
- **Conta Google** (para API Gemini)

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd ai-games-generator
```

### 2. Configurar o Backend

#### Instalar dependências Python
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\activate     # Windows

pip install fastapi uvicorn python-dotenv google-generativeai
```

#### Configurar API Key
Crie um arquivo `.env` na raiz do projeto:
```env
GEMINI_API_KEY=sua_chave_api_aqui
GEMINI_MODEL=gemini-1.5-flash
```

> 💡 **Como obter a API Key:** Acesse [Google AI Studio](https://aistudio.google.com/app/apikey) e gere sua chave gratuita.

### 3. Configurar o Frontend
```bash
npm install
```

## 🚀 Executando o Projeto

### Iniciar o Backend
```bash
python start_backend_safe.py
```
O backend estará disponível em: http://localhost:8000

### Iniciar o Frontend
```bash
npm run dev
```
O frontend estará disponível em: http://localhost:8080

## 🎯 Como Usar

1. **Acesse a aplicação** em http://localhost:8080
2. **Digite um prompt** descrevendo o jogo que deseja criar
   - Exemplo: *"jogo de snake colorido com pontuação"*
   - Exemplo: *"plataforma 2D com pulos e obstáculos"*
   - Exemplo: *"pong simples com duas raquetes"*
3. **Clique em "Criar Jogo"**
4. **Aguarde a geração** (geralmente 10-30 segundos)
5. **Jogue instantaneamente** no preview
6. **Baixe o código** se desejar modificar

## 📁 Estrutura do Projeto

```
├── main.py                 # Backend FastAPI
├── start_backend_safe.py   # Script para iniciar backend
├── src/
│   ├── components/         # Componentes React
│   ├── pages/             # Páginas da aplicação
│   │   ├── CreateGame.tsx # Página de criação
│   │   └── GameWorkspace.tsx # Workspace do jogo
│   ├── services/          # Serviços de API
│   └── lib/               # Utilitários
├── public/                # Arquivos estáticos
└── package.json          # Dependências Node.js
```

## 🎮 Exemplos de Prompts

- *"jogo de quebra-blocos estilo Breakout"*
- *"endless runner espacial com obstáculos"*
- *"puzzle de combinar cores"*
- *"jogo de tiro em primeira pessoa simples"*
- *"simulador de fazenda com plantações"*
- *"jogo de corrida top-down"*

## ⚙️ Configurações Avançadas

### Personalizar Geração
Edite `SYSTEM_INSTRUCTIONS` em `main.py` para:
- Alterar estilo dos jogos
- Modificar complexidade padrão
- Adicionar novos recursos

### CORS
O backend está configurado para aceitar conexões de:
- http://localhost:5173
- http://localhost:8080
- http://localhost:3000

## 🐛 Solução de Problemas

### Backend não inicia
- Verifique se a `GEMINI_API_KEY` está configurada
- Confirme que o Python 3.11+ está instalado
- Execute `pip install -r requirements.txt` se houver um arquivo

### Frontend não carrega
- Execute `npm install` novamente
- Verifique se o Node.js 16+ está instalado
- Limpe o cache: `npm run dev -- --force`

### Jogos com erros
- Os jogos são gerados com proteções DOM automáticas
- Se persistir, tente prompts mais específicos
- Verifique o console do navegador para detalhes

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 🙏 Agradecimentos

- **Google Gemini AI** - Pela poderosa API de geração
- **FastAPI** - Framework web rápido e moderno
- **React** - Biblioteca para interfaces dinâmicas
- **Vite** - Build tool ultrarrápido

---

**Divirta-se criando jogos! 🎉**
