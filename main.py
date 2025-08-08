import os
import re
import io
import json
import base64
import zipfile
from typing import List, Optional, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from dotenv import load_dotenv

import google.generativeai as genai

# -----------------------------------------------------------------------------
# Configuração básica
# -----------------------------------------------------------------------------
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY não configurada no .env")

genai.configure(api_key=API_KEY)

app = FastAPI(title="Create Games With Just a Prompt")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Modelos Pydantic
# -----------------------------------------------------------------------------
class GameFile(BaseModel):
    path: str = Field(..., description="Caminho do arquivo dentro do projeto, ex: index.html, src/main.js, assets/player.png")
    kind: Literal["text", "binary_base64"] = Field(..., description="Tipo de conteúdo")
    content: str = Field(..., description="Texto do arquivo ou conteúdo binário em base64")

    @validator("path")
    def path_sem_subida_de_diretorio(cls, v):
        if ".." in v or v.startswith("/"):
            raise ValueError("Caminho inválido")
        return v

class GameProject(BaseModel):
    project_name: str = Field(..., description="Nome do projeto")
    engine: Literal["vanilla-canvas", "phaser", "babylon", "three", "godot-web"] = "vanilla-canvas"
    platform: Literal["web"] = "web"
    instructions: str = Field(..., description="Instruções curtas de como rodar")
    files: List[GameFile] = Field(..., description="Lista de arquivos do projeto")

class CreateGameRequest(BaseModel):
    prompt: str = Field(..., description="Ideia do jogo em linguagem natural, por exemplo: 'endless runner com tema espacial, pontuação e obstáculos aleatórios'")
    engine: Optional[Literal["vanilla-canvas", "phaser", "babylon", "three"]] = Field(
        default="vanilla-canvas",
        description="Engine alvo. Padrão: vanilla-canvas",
    )
    style: Optional[str] = Field(default=None, description="Estilo visual ou referências")
    difficulty: Optional[Literal["easy", "medium", "hard"]] = "easy"
    include_placeholder_assets: Optional[bool] = True
    language: Optional[Literal["pt", "en"]] = "pt"

class CreateGameResponse(BaseModel):
    project_name: str
    engine: str
    zip_base64: str
    instructions: str
    html_content: str = Field(..., description="Conteúdo HTML do jogo para preview direto")

# -----------------------------------------------------------------------------
# Instruções do sistema para o modelo
# -----------------------------------------------------------------------------
SYSTEM_INSTRUCTIONS = (
    "Você é um gerador de jogos HTML5. Gere um jogo COMPLETO e JOGÁVEL usando apenas HTML, CSS e JavaScript vanilla. "
    "Responda SOMENTE com JSON válido, sem markdown, sem explicações, sem crases. "
    "O jogo deve ser instantaneamente jogável ao abrir o arquivo HTML no navegador.\n\n"
    "Siga EXATAMENTE este esquema:\n\n"
    "{\n"
    '  "project_name": "string",\n'
    '  "engine": "vanilla-canvas",\n'
    '  "platform": "web",\n'
    '  "instructions": "Como jogar: [instruções claras e curtas]",\n'
    '  "files": [\n'
    '    {"path": "index.html", "kind": "text", "content": "<!DOCTYPE html><html>..."}\n'
    "  ]\n"
    "}\n\n"
    "REGRAS OBRIGATÓRIAS:\n"
    "1) Gere APENAS UM ARQUIVO: index.html com TODO o código inline.\n"
    "2) Inclua CSS dentro de <style> e JavaScript dentro de <script>.\n"
    "3) Use HTML5 Canvas para renderização.\n"
    "4) Implemente controles com teclado (WASD/setas) ou mouse.\n"
    "5) Adicione game loop completo com requestAnimationFrame.\n"
    "6) Inclua sistema de pontuação visível.\n"
    "7) Use formas geométricas coloridas (retângulos, círculos) como sprites.\n"
    "8) Adicione detecção de colisão funcional.\n"
    "9) Mostre instruções na tela (ex: 'Use WASD para mover').\n"
    "10) O jogo deve ter objetivo claro e ser divertido.\n"
    "11) Use cores vibrantes e animações suaves.\n"
    "12) Implemente estados: menu inicial, jogo rodando, game over.\n"
    "13) Adicione sons simples usando Web Audio API (opcional).\n"
    "14) O arquivo deve rodar perfeitamente offline.\n"
    "15) Mantenha o código limpo e bem comentado.\n"
    "16) SEMPRE use getElementById e verifique se o elemento existe antes de usar:\n"
    "    const element = document.getElementById('id');\n"
    "    if (element) { element.innerText = 'valor'; }\n"
    "17) Use apenas elementos HTML que realmente existem no documento.\n"
    "18) Evite acessar elementos DOM que podem não existir.\n"
    "19) Inicialize o jogo apenas após window.onload ou DOMContentLoaded.\n"
    "20) Teste todos os acessos DOM com verificações de null.\n"
)

# -----------------------------------------------------------------------------
# Utilidades
# -----------------------------------------------------------------------------
def strip_code_fences(text: str) -> str:
    """
    Remove cercas de código caso o modelo ignore a instrução e devolva ```json ... ```.
    """
    if text is None:
        return ""
    m = re.search(r"```(?:json|[\w+-]*)\s*(.*?)\s*```", text, re.DOTALL | re.IGNORECASE)
    if m:
        return m.group(1).strip()
    return text.strip()

def build_zip_from_project(project: GameProject) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in project.files:
            if f.kind == "text":
                data = f.content.encode("utf-8")
            else:
                try:
                    # Tentar decodificar base64, mas se falhar, tratar como texto
                    data = base64.b64decode(f.content)
                except Exception as e:
                    print(f"Aviso: Falha ao decodificar base64 de {f.path}, tratando como texto: {e}")
                    data = f.content.encode("utf-8")
            zf.writestr(f.path, data)
    buffer.seek(0)
    return buffer.read()

def build_prompt(req: CreateGameRequest) -> str:
    user_spec = {
        "prompt": req.prompt,
        "engine": req.engine,
        "style": req.style,
        "difficulty": req.difficulty,
        "include_placeholder_assets": req.include_placeholder_assets,
        "language": req.language,
        "target_platform": "web"
    }
    parts = [
        SYSTEM_INSTRUCTIONS,
        "Gere o JSON do projeto seguindo o esquema. Não use markdown.",
        "Especificação do usuário:",
        json.dumps(user_spec, ensure_ascii=False, indent=2),
    ]
    return "\n".join(parts)

# -----------------------------------------------------------------------------
# Endpoint principal
# -----------------------------------------------------------------------------
@app.post("/create-game", response_model=CreateGameResponse)
def create_game(req: CreateGameRequest):
    full_prompt = build_prompt(req)

    try:
        model = genai.GenerativeModel(MODEL_NAME)
        resp = model.generate_content(
            full_prompt,
            generation_config={
                "temperature": 0.1,
                "top_p": 0.8,
                "top_k": 20,
                "max_output_tokens": 8192,
            },
            safety_settings=None,
        )

        if not resp or not getattr(resp, "text", None):
            raise RuntimeError("Resposta vazia do modelo")

        raw = strip_code_fences(resp.text)

        try:
            payload = json.loads(raw)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=502, detail=f"Modelo retornou JSON inválido: {e}")

        try:
            project = GameProject(**payload)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Projeto inválido: {e}")

        zip_bytes = build_zip_from_project(project)
        zip_b64 = base64.b64encode(zip_bytes).decode("utf-8")
        
        # Extrair HTML do projeto para preview direto
        html_content = ""
        for file in project.files:
            if file.path == "index.html" and file.kind == "text":
                html_content = file.content
                break

        return CreateGameResponse(
            project_name=project.project_name,
            engine=project.engine,
            zip_base64=zip_b64,
            instructions=project.instructions,
            html_content=html_content,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------------------------------------------------------
# Endpoint legado opcional: gerar código simples
# -----------------------------------------------------------------------------
class GenRequest(BaseModel):
    question: str
    language: Optional[str] = None

def clean_code(text: str) -> str:
    if text is None:
        return ""
    m = re.search(r"```[\w+-]*\n(.*?)```", text, re.DOTALL)
    if m:
        return m.group(1).strip()
    return text.strip()

LEGACY_SYSTEM_INSTRUCTIONS = (
    "Você é um gerador de código. Responda somente com código, sem explicações. "
    "Se a linguagem for especificada, gere nessa linguagem. "
    "Evite comentários extensos e não use markdown na resposta final."
)

@app.post("/generate-code")
def generate_code(req: GenRequest):
    prompt = []
    prompt.append(LEGACY_SYSTEM_INSTRUCTIONS)
    if req.language:
        prompt.append(f"Linguagem solicitada: {req.language}.")
    prompt.append("Tarefa do usuário:")
    prompt.append(req.question)

    full_prompt = "\n".join(prompt)

    try:
        model = genai.GenerativeModel(MODEL_NAME)
        resp = model.generate_content(
            full_prompt,
            generation_config={
                "temperature": 0.2,
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 2048,
            },
            safety_settings=None,
        )
        if not resp or not resp.text:
            raise RuntimeError("Resposta vazia do modelo")
        code = clean_code(resp.text)
        return {"code": code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
