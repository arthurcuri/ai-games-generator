
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { codeGeneratorService } from '@/services/codeGenerator';
import { 
  ArrowLeft, Settings, Code, Share, Maximize2, RefreshCw, Send 
} from 'lucide-react';

const GameWorkspace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [gamePrompt, setGamePrompt] = useState('create rpg game with trees');
  const [aiResponse, setAiResponse] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Simulate AI generating a response after component mounts
    setAiResponse("I've created a game based on your description: \"create rpg game with trees\". You can see it in the preview panel. Feel free to ask for any changes or additions!");
  }, []);

  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const code = await codeGeneratorService.generateCode({
        question: prompt,
        language: 'javascript'
      });
      
      setGamePrompt(prompt);
      setGeneratedCode(code);
      setAiResponse(`I've generated code based on your request: "${prompt}". Check the code panel to see the generated code!`);
      setPrompt('');
      
      toast({
        title: "Code generated successfully!",
        description: "Check the code panel for the generated code.",
      });
    } catch (error) {
      toast({
        title: "Error generating code",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const handleShare = () => {
    toast({
      title: "Share link copied!",
      description: "Game link has been copied to your clipboard.",
    });
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  }

  const handleRefresh = () => {
    toast({
      title: "Refreshing game...",
    });
    // Simulate refreshing the game preview
    setTimeout(() => {
      toast({
        title: "Game refreshed!",
      });
    }, 1000);
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
            <span>Back</span>
          </button>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-arcade-purple rounded-sm flex items-center justify-center mr-2">
              <span className="text-xs">🎮</span>
            </div>
            <h1 className="text-white font-semibold">Game Workspace</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-3 py-1.5 text-gray-300 hover:text-white bg-gray-800 rounded-md">
            <Settings size={18} className="mr-1.5" />
            <span>Template & Assets</span>
          </button>
          <button className="flex items-center px-3 py-1.5 text-gray-300 hover:text-white bg-gray-800 rounded-md">
            <Code size={18} className="mr-1.5" />
            <span>Show Code</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center px-3 py-1.5 text-white bg-arcade-purple hover:bg-opacity-90 rounded-md"
          >
            <Share size={18} className="mr-1.5" />
            <span>Share Game</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Prompt and Response */}
        <div className="w-1/2 flex flex-col bg-gray-900 border-r border-gray-800">
          {/* Current Prompt Display */}
          <div className="bg-arcade-purple/20 mx-auto my-4 px-6 py-2 rounded-full max-w-md">
            <p className="text-white">{gamePrompt}</p>
          </div>
          
          {/* AI Response */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="bg-black/30 rounded-lg p-4 text-gray-300">
              <p>{aiResponse}</p>
            </div>
            
            {/* Generated Code Display */}
            {generatedCode && (
              <div className="mt-4 bg-black/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Generated Code:</h3>
                <pre className="bg-gray-900 p-3 rounded text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
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
                placeholder="Type your message..."
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
        <div className="w-1/2 bg-sky-300 relative">
          {/* Green Forest Game Preview */}
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
          </div>
          
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
