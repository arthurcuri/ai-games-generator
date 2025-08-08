
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { gameService, CreateGameResponse } from '@/services/gameService';
import { 
  ArrowLeft, Code, Maximize2, RefreshCw, Send, Download 
} from 'lucide-react';

const GameWorkspace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [gameData, setGameData] = useState<CreateGameResponse | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const [gameHtml, setGameHtml] = useState<string>('');

  useEffect(() => {
    // Receber dados do jogo da navegação
    const gameInfo = location.state?.gameData;
    if (gameInfo) {
      setGameData(gameInfo);
      setAiResponse(`Jogo "${gameInfo.project_name}" foi criado com sucesso! ${gameInfo.instructions}`);
      
      // Extrair o HTML do jogo para preview
      try {
        extractGameHtml(gameInfo.zip_base64);
      } catch (error) {
        console.error('Erro ao extrair HTML do jogo:', error);
        // Se falhar, tentar extrair diretamente da resposta JSON
        if (gameInfo.files && gameInfo.files.length > 0) {
          const indexFile = gameInfo.files.find(f => f.path === 'index.html');
          if (indexFile && indexFile.kind === 'text') {
            setGameHtml(indexFile.content);
          }
        }
      }
    } else {
      setAiResponse("Bem-vindo ao workspace! Você pode gerar código ou fazer modificações no seu jogo aqui.");
    }
  }, [location]);

  const extractGameHtml = async (zipBase64: string) => {
    try {
      // Decodificar o base64 do ZIP
      const zipData = atob(zipBase64);
      
      // Procurar por conteúdo HTML completo no ZIP
      const htmlPatterns = [
        /<!DOCTYPE html>[\s\S]*?<\/html>/i,
        /<!doctype html>[\s\S]*?<\/html>/i,
        /<html[\s\S]*?<\/html>/i
      ];
      
      for (const pattern of htmlPatterns) {
        const match = zipData.match(pattern);
        if (match) {
          // Limpar caracteres de controle do ZIP que podem estar no início/fim
          let htmlContent = match[0];
          
          // Remover possíveis caracteres binários antes do DOCTYPE
          const docTypeIndex = htmlContent.search(/<!DOCTYPE|<!doctype|<html/i);
          if (docTypeIndex > 0) {
            htmlContent = htmlContent.substring(docTypeIndex);
          }
          
          // Garantir que termina com </html>
          const htmlEndIndex = htmlContent.lastIndexOf('</html>');
          if (htmlEndIndex !== -1) {
            htmlContent = htmlContent.substring(0, htmlEndIndex + 7);
          }
          
          setGameHtml(htmlContent);
          console.log('HTML extraído com sucesso');
          return;
        }
      }
      
      console.warn('Não foi possível extrair HTML do ZIP');
    } catch (error) {
      console.error('Erro ao extrair HTML:', error);
    }
  };

  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Por favor, digite um prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const code = await gameService.generateCode({
        question: prompt,
        language: 'javascript'
      });
      
      setGeneratedCode(code);
      setAiResponse(`Código gerado baseado na sua solicitação: "${prompt}". Confira o painel de código para ver o código gerado!`);
      setPrompt('');
      
      toast({
        title: "Código gerado com sucesso!",
        description: "Confira o painel de código para ver o resultado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar código",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const handleDownload = () => {
    if (gameData) {
      gameService.downloadZip(gameData.zip_base64, `${gameData.project_name}.zip`);
      toast({
        title: "Download iniciado!",
        description: "O arquivo ZIP do jogo está sendo baixado.",
      });
    }
  }

  const handleRefresh = () => {
    toast({
      title: "Atualizando jogo...",
    });
    // Simular atualização da prévia do jogo
    setTimeout(() => {
      toast({
        title: "Jogo atualizado!",
      });
    }, 1000);
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  }

  return (
    <div className="flex flex-col h-screen bg-arcade-dark">
      {/* Header Bar */}
      <header className="bg-black border-b border-gray-800 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/create-game')}
            className="text-gray-300 hover:text-white flex items-center mr-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Voltar</span>
          </button>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-arcade-purple rounded-sm flex items-center justify-center mr-2">
              <span className="text-xs">🎮</span>
            </div>
            <h1 className="text-white font-semibold">Workspace de Jogos</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowCode(!showCode)}
            className="flex items-center px-3 py-1.5 text-gray-300 hover:text-white bg-gray-800 rounded-md"
          >
            <Code size={18} className="mr-1.5" />
            <span>{showCode ? 'Ver Jogo' : 'Ver Código'}</span>
          </button>
          {gameData && (
            <button 
              onClick={handleDownload}
              className="flex items-center px-3 py-1.5 text-gray-300 hover:text-white bg-gray-800 rounded-md"
            >
              <Download size={18} className="mr-1.5" />
              <span>Download</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Prompt and Response */}
        <div className="w-1/2 flex flex-col bg-gray-900 border-r border-gray-800">
          {/* Current Game Display */}
          <div className="bg-arcade-purple/20 mx-auto my-4 px-6 py-2 rounded-full max-w-md">
            <p className="text-white">{gameData ? gameData.project_name : "Workspace de Desenvolvimento"}</p>
          </div>
          
          {/* AI Response */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="bg-black/30 rounded-lg p-4 text-gray-300">
              <p>{aiResponse}</p>
            </div>
            
            {/* Game Info */}
            {gameData && (
              <div className="mt-4 bg-black/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Informações do Jogo:</h3>
                <div className="text-gray-300 space-y-1">
                  <p><strong>Nome:</strong> {gameData.project_name}</p>
                  <p><strong>Engine:</strong> {gameData.engine}</p>
                  <p><strong>Instruções:</strong> {gameData.instructions}</p>
                </div>
              </div>
            )}
            
            {/* Generated Code Display for new code only */}
            {generatedCode && !showCode && (
              <div className="mt-4 bg-black/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Código Adicional Gerado:</h3>
                <pre className="bg-gray-900 p-3 rounded text-green-400 text-sm overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            )}
            
            <div className="h-full"></div>
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t border-gray-800">
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="w-full bg-black/40 text-white rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-arcade-purple"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                N
              </div>
              <button
                onClick={handleSubmitPrompt}
                disabled={isGenerating}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-arcade-purple p-1.5 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Game Preview */}
        <div className="w-1/2 bg-gray-900 relative">
          {gameData ? (
            /* Game Preview with Instructions */
            <div className="w-full h-full flex flex-col">
              <div className="bg-black/50 p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold mb-2">🎮 {gameData.project_name} - JOGUE AGORA!</h3>
                <p className="text-gray-300 text-sm">{gameData.instructions}</p>
                <div className="mt-2">
                  <button 
                    onClick={() => {
                      if (gameHtml) {
                        const blob = new Blob([gameHtml], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                      }
                    }}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    🚀 Abrir em Nova Aba
                  </button>
                </div>
              </div>
              
              {/* Game Preview ou Code View */}
              <div className="flex-1 bg-black relative">
                {showCode ? (
                  /* Código do Jogo */
                  <div className="w-full h-full p-4 overflow-auto">
                    <div className="bg-gray-900 rounded-lg p-4 h-full">
                      <h3 className="text-white font-semibold mb-4">Código do Jogo:</h3>
                      <pre className="bg-black p-4 rounded text-green-400 text-sm overflow-auto whitespace-pre-wrap h-full">
                        <code>{gameHtml || 'Carregando código...'}</code>
                      </pre>
                    </div>
                  </div>
                ) : gameHtml ? (
                  /* Preview do Jogo */
                  <iframe
                    srcDoc={gameHtml}
                    className="w-full h-full border-0"
                    title="Game Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  /* Loading */
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-arcade-purple/20 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-2xl">🎮</span>
                      </div>
                      <h3 className="text-white text-lg font-semibold mb-2">Extraindo jogo...</h3>
                      <p className="text-gray-300 text-sm">
                        Preparando o preview do jogo
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Default Preview */
            <div className="w-full h-full bg-gradient-to-b from-sky-300 to-sky-400">
              <div className="absolute bottom-0 w-full h-1/2 bg-green-600"></div>
              
              {/* Tree representations */}
              <div className="absolute bottom-20 left-1/4">
                <div className="w-24 h-32 bg-green-800 clip-path-triangle"></div>
                <div className="w-4 h-8 bg-brown-600 mx-auto"></div>
              </div>
              
              <div className="absolute bottom-32 right-1/4">
                <div className="w-16 h-24 bg-green-800 clip-path-triangle"></div>
                <div className="w-3 h-6 bg-brown-600 mx-auto"></div>
              </div>
              
              <div className="absolute bottom-16 right-10">
                <div className="w-20 h-28 bg-green-800 clip-path-triangle"></div>
                <div className="w-4 h-7 bg-brown-600 mx-auto"></div>
              </div>
              
              {/* Demo Game Label */}
              <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm">
                Demo: RPG Adventure
              </div>
            </div>
          )}
          
          {/* Controls */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button 
              onClick={toggleFullscreen}
              className="bg-black/50 p-2 rounded-md text-white hover:bg-black/80"
            >
              <Maximize2 size={16} />
            </button>
            <button 
              onClick={handleRefresh}
              className="bg-black/50 p-2 rounded-md text-white hover:bg-black/80"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameWorkspace;
