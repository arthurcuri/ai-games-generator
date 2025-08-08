interface CreateGameRequest {
  prompt: string;
  engine?: 'vanilla-canvas' | 'phaser' | 'babylon' | 'three';
  style?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  include_placeholder_assets?: boolean;
  language?: 'pt' | 'en';
}

interface CreateGameResponse {
  project_name: string;
  engine: string;
  zip_base64: string;
  instructions: string;
  html_content: string;
}

interface CodeGenerationRequest {
  question: string;
  language?: string;
}

interface CodeGenerationResponse {
  code: string;
}

class GameService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  async createGame(request: CreateGameRequest): Promise<CreateGameResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/create-game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
      }

      const data: CreateGameResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating game:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create game. Please try again.');
    }
  }

  async generateCode(request: CodeGenerationRequest): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
      }

      const data: CodeGenerationResponse = await response.json();
      return data.code;
    } catch (error) {
      console.error('Error generating code:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate code. Please try again.');
    }
  }

  // Função utilitária para fazer download do ZIP
  downloadZip(zipBase64: string, fileName: string = 'game.zip') {
    try {
      const byteCharacters = atob(zipBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/zip' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading zip:', error);
      throw new Error('Failed to download game files.');
    }
  }
}

export const gameService = new GameService();
export type { CreateGameRequest, CreateGameResponse, CodeGenerationRequest };
