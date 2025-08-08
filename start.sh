#!/bin/bash

echo "🚀 Iniciando AI Games Generator..."
echo ""

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado. Instale Python 3.8+ primeiro."
    exit 1
fi

# Verificar se as dependências estão instaladas
echo "📦 Verificando dependências Python..."
python3 -c "import fastapi, uvicorn, google.generativeai" 2>/dev/null || {
    echo "❌ Dependências não encontradas. Instalando..."
    pip install fastapi uvicorn python-dotenv google-generativeai
}

# Verificar arquivo .env
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado. Criando exemplo..."
    echo "GEMINI_API_KEY=sua_chave_aqui" > .env
    echo "GEMINI_MODEL=gemini-1.5-flash" >> .env
    echo "⚠️  Configure sua chave da API do Gemini no arquivo .env"
    echo "   Obtenha em: https://aistudio.google.com/app/apikey"
    exit 1
fi

echo "✅ Tudo configurado!"
echo ""
echo "🌐 Iniciando backend em http://localhost:8000"
echo "📱 Frontend deve estar em http://localhost:5173"
echo ""

# Iniciar o servidor
python3 start_backend.py
