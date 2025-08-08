interface CodeGenerationRequest {
  question: string;
  language?: string;
}

interface CodeGenerationResponse {
  code: string;
}

class CodeGeneratorService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CodeGenerationResponse = await response.json();
      return data.code;
    } catch (error) {
      console.error('Error generating code:', error);
      throw new Error('Failed to generate code. Please try again.');
    }
  }
}

export const codeGeneratorService = new CodeGeneratorService();
export type { CodeGenerationRequest };