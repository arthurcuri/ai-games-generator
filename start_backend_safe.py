#!/usr/bin/env python3

import uvicorn
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Verificar se a API key existe
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ ERRO: GEMINI_API_KEY não encontrada no arquivo .env")
    print("Configure sua chave da API do Gemini em: https://aistudio.google.com/app/apikey")
    exit(1)

print("🚀 Iniciando servidor backend (modo seguro, sem reload)...")
print("📍 Backend estará disponível em: http://localhost:8000")
print("📍 Frontend deve estar em: http://localhost:5173 ou http://localhost:8080")
print("📄 Documentação da API: http://localhost:8000/docs")
print("")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Desabilitar reload para evitar problema com Git
        log_level="info"
    )
