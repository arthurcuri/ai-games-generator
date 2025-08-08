
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Terminal from '@/components/Terminal';
import EmailForm from '@/components/EmailForm';
import FeatureCard from '@/components/FeatureCard';
import { MessageSquare, Code, Play } from 'lucide-react';

const Index = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Add small delay before starting animations
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-arcade-dark">
      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Header />
        
        <div className={`mt-16 mb-12 text-center transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">Crie Jogos Com Apenas Um Prompt</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Digite um prompt, obtenha um jogo jogável instantaneamente. Nenhuma programação necessária.
          </p>
        </div>
        
        <Terminal />
        
        <EmailForm />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16 mb-16">
          <FeatureCard 
            icon={<MessageSquare size={28} />}
            title="Chat para Criar"
            description="Simplesmente descreva sua ideia de jogo em linguagem natural e veja-a ganhar vida"
            delay="delay-100"
          />
          
          <FeatureCard 
            icon={<Code size={28} />}
            title="Sem Programação"
            description="Crie jogos complexos sem escrever uma única linha de código"
            delay="delay-300"
          />
          
          <FeatureCard 
            icon={<Play size={28} />}
            title="Instantaneamente Jogável"
            description="Obtenha um jogo funcionando em segundos que você pode jogar e compartilhar imediatamente"
            delay="delay-500"
          />
        </div>
      </div>
      
      <footer className="py-6 border-t border-gray-800 text-center text-sm text-gray-500">
        <p>© 2025 Engine Arcade. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Index;
