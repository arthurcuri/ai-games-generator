
import { useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { gameService, CreateGameRequest } from '@/services/gameService';

const CreateGame = () => {
  const [gameIdea, setGameIdea] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!gameIdea.trim()) {
      toast({
        title: "Por favor, descreva sua ideia de jogo",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const request: CreateGameRequest = {
        prompt: gameIdea,
        engine: 'vanilla-canvas', // Sempre HTML5 Canvas para jogabilidade instantânea
        difficulty: 'easy',
        include_placeholder_assets: false, // Não precisamos de assets, apenas formas geométricas
        language: 'pt',
      };

      const result = await gameService.createGame(request);
      
      toast({
        title: "Sucesso!",
        description: `Jogo "${result.project_name}" foi gerado com sucesso!`,
      });
      
      // Navegar para o workspace com os dados do jogo
      navigate('/workspace', { state: { gameData: result } });
    } catch (error) {
      toast({
        title: "Erro ao criar jogo",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-arcade-dark">
      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Back button */}
        <button 
          onClick={goBack}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Voltar</span>
        </button>
        
        {/* Icon at the top */}
        <div className="w-full flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-arcade-terminal flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full bg-arcade-purple opacity-20 blur-xl"></div>
            <div className="text-3xl">🎮</div>
          </div>
        </div>
        
        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-16 tracking-tight">
          Ideia para jogo em segundos.
        </h1>
        
        {/* Game creation area */}
        <div className="bg-arcade-terminal/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800 shadow-xl max-w-4xl mx-auto mb-8">
          <textarea
            value={gameIdea}
            onChange={(e) => setGameIdea(e.target.value)}
            placeholder="Descreva sua ideia de jogo... (ex: jogo de corrida espacial com obstáculos e power-ups)"
            className="w-full bg-arcade-terminal border border-gray-700 rounded-lg p-4 min-h-32 text-white focus:outline-none focus:ring-2 focus:ring-arcade-purple resize-none"
          />
          
          <div className="flex justify-center mt-4">
            <button 
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-arcade-purple hover:bg-opacity-90 text-white rounded-lg px-8 py-3 flex items-center font-medium disabled:opacity-70 text-lg"
            >
              <Sparkles size={20} className="mr-2" />
              {isCreating ? 'Criando...' : 'Criar Jogo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGame;
