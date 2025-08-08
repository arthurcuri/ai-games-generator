# AI Games Generator - Jogos Instantâneos

## ⚡ Jogue Imediatamente!

Este sistema gera jogos HTML5 que são **instantaneamente jogáveis** no navegador, sem downloads ou instalações.

## 🚀 Início Rápido

### Opção 1: Script Automático
```bash
chmod +x start.sh
./start.sh
```

### Opção 2: Manual

1. **Backend (Terminal 1):**
```bash
pip install fastapi uvicorn python-dotenv google-generativeai
python start_backend.py
```

2. **Frontend (Terminal 2):**
```bash
npm install && npm run dev
# ou
bun install && bun dev
```

## 🎮 Como Funciona

1. **Descreva o jogo**: "jogo de corrida espacial" 
2. **Clique "Criar"**: A IA gera HTML5 + Canvas + JavaScript
3. **Jogue instantaneamente**: Preview ao vivo no workspace
4. **Download**: Arquivo HTML único para jogar offline

## ✨ Características dos Jogos Gerados

- **🏃‍♂️ Zero Loading**: Joga imediatamente após criação
- **📱 Um arquivo**: HTML único com tudo embutido
- **🎯 Controles**: WASD, setas ou mouse  
- **📊 Pontuação**: Sistema de score integrado
- **🎨 Visual**: Formas geométricas coloridas
- **🔄 Game Loop**: RequestAnimationFrame para 60fps
- **📋 Instruções**: Controles mostrados na tela

## 🎯 Exemplos de Prompts

- "jogo de tiro espacial com asteroides"
- "corrida de carros em pista"  
- "plataforma com saltos e moedas"
- "breakout com power-ups"
- "snake moderno com efeitos"

## 🔧 Tecnologia

- **Engine**: Sempre HTML5 Canvas + JavaScript vanilla
- **Preview**: Iframe com jogo executando em tempo real
- **Download**: ZIP com HTML pronto para usar
- **Compatibilidade**: Funciona em qualquer navegador moderno

## ⚠️ Configuração

Precisa apenas de uma chave da API do Gemini:
1. Vá em: https://aistudio.google.com/app/apikey
2. Crie uma chave gratuita
3. Adicione no arquivo `.env`

## 🎲 Interface Simplificada

- ✅ Campo de texto para ideia do jogo
- ✅ Botão "Criar Jogo" 
- ✅ Preview instantâneo jogável
- ✅ Download automático
- ✅ Workspace para modificações
