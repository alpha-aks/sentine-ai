import { Logger } from '@sentinel-ai/logger';
import { CodeAnswerData } from '../types/submission';

export class CodeAnswerEngine {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger({ serviceName: 'submission-service' });
  }

  /**
   * Processes and validates a CodeAnswerData payload.
   * Computes line count and formats file manifests.
   */
  public processCodeAnswer(data: CodeAnswerData): CodeAnswerData {
    if (!data.language) {
      throw new Error('SUBMISSION_INVALID_CODE_ANSWER: Programming language is required');
    }

    const code = data.code || '';
    const lineCount = code ? code.split('\n').length : 0;

    const files = data.files ? data.files.map(f => ({
      filename: f.filename,
      content: f.content,
      language: f.language || data.language
    })) : [];

    this.logger.debug(
      `Processed code answer (language=${data.language}, lines=${lineCount}, files=${files.length})`
    );

    return {
      ...data,
      code,
      lineCount,
      files
    };
  }

  /**
   * Generates a starter code template based on language and template ID.
   */
  public getStarterTemplate(language: string, templateId?: string): string {
    const lang = language.toLowerCase();
    switch (lang) {
      case 'python':
        return '# Write your solution here\n\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()\n';
      case 'javascript':
      case 'typescript':
        return '// Write your solution here\nfunction main() {\n  // solution\n}\n\nmain();\n';
      case 'java':
        return '// Write your solution here\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n';
      case 'cpp':
      case 'c++':
        return '// Write your solution here\n#include <iostream>\n\nint main() {\n    return 0;\n}\n';
      default:
        return `// Starter template for ${language}\n`;
    }
  }
}
