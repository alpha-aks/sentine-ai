import { sha256Hash } from '@sentinel-ai/utils';
import {
  CreateQuestionDto,
  ExportTemplateDto,
  ImportReportEntry,
  QuestionFormat,
  QuestionResponseDto
} from '../types/question';

// ─────────────────────────────────────────────────────────────────────────────
// ImportExportEngine
// ─────────────────────────────────────────────────────────────────────────────

export interface ParseResult {
  dtos: CreateQuestionDto[];
  report: ImportReportEntry[];
  duplicateHashes: Set<string>;
}

export class ImportExportEngine {
  // ── Parse / Import ──────────────────────────────────────────────────────────

  /**
   * Parse a bulk question payload and return a normalized DTO list plus an
   * import report.  Duplicate detection is done by comparing content hashes
   * so the caller can skip insertion.
   */
  public parseImportPayload(rawContent: string, format: QuestionFormat): ParseResult {
    if (!rawContent || !rawContent.trim()) {
      throw new Error('QUESTION_IMPORT_INVALID: Import payload content is empty');
    }

    let dtos: CreateQuestionDto[];

    switch (format) {
      case 'JSON':
        dtos = this.parseJson(rawContent);
        break;
      case 'CSV':
        dtos = this.parseCsv(rawContent);
        break;
      case 'MARKDOWN':
        dtos = this.parseMarkdown(rawContent);
        break;
      case 'EXCEL':
        // Excel files arrive pre-converted to CSV by the controller layer
        dtos = this.parseCsv(rawContent);
        break;
      default:
        throw new Error(`QUESTION_IMPORT_UNSUPPORTED: Format "${format}" is not supported`);
    }

    // Build per-row report and detect intra-batch duplicates
    const seenHashes = new Set<string>();
    const duplicateHashes = new Set<string>();
    const report: ImportReportEntry[] = dtos.map((dto, idx) => {
      const hash = this.contentHash(dto.title, dto.body);
      if (seenHashes.has(hash)) {
        duplicateHashes.add(hash);
        return { rowIndex: idx, title: dto.title, status: 'SKIPPED_DUPLICATE' };
      }
      seenHashes.add(hash);
      return { rowIndex: idx, title: dto.title, status: 'IMPORTED' };
    });

    return { dtos, report, duplicateHashes };
  }

  public contentHash(title: string, body: string): string {
    return sha256Hash(`${(title || '').trim()}|||${(body || '').trim()}`);
  }

  // ── JSON parser ─────────────────────────────────────────────────────────────

  private parseJson(content: string): CreateQuestionDto[] {
    try {
      const parsed = JSON.parse(content);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      return list.map(item => this.normalizeItem(item));
    } catch (err: any) {
      throw new Error(`QUESTION_IMPORT_INVALID: Invalid JSON format - ${err.message}`);
    }
  }

  private normalizeItem(item: any): CreateQuestionDto {
    return {
      bankId: item.bankId || item.bank_id || 'default',
      institutionId: item.institutionId || item.institution_id || 'default',
      type: item.type || 'MCQ_SINGLE',
      title: String(item.title || 'Untitled Question').trim(),
      body: String(item.body || item.title || '').trim(),
      instructions: item.instructions || undefined,
      difficulty: item.difficulty || 'MEDIUM',
      marks: item.marks ? parseFloat(String(item.marks)) : 1,
      negativeMarks: item.negativeMarks != null ? parseFloat(String(item.negativeMarks)) : 0,
      estimatedTimeSeconds: item.estimatedTimeSeconds ? parseInt(String(item.estimatedTimeSeconds), 10) : 60,
      hints: Array.isArray(item.hints) ? item.hints : item.hints ? [String(item.hints)] : [],
      explanation: item.explanation || undefined,
      codeTemplate: item.codeTemplate || item.code_template || undefined,
      codeLanguage: item.codeLanguage || item.code_language || undefined,
      acceptedVariations: Array.isArray(item.acceptedVariations) ? item.acceptedVariations : [],
      numericalTolerance: item.numericalTolerance != null ? parseFloat(String(item.numericalTolerance)) : undefined,
      matchingPairs: item.matchingPairs && typeof item.matchingPairs === 'object' ? item.matchingPairs : undefined,
      orderingSequence: Array.isArray(item.orderingSequence) ? item.orderingSequence : undefined,
      options: Array.isArray(item.options)
        ? item.options.map((opt: any) => ({
            text: opt.text || String(opt),
            isCorrect: Boolean(opt.isCorrect ?? opt.is_correct),
            explanation: opt.explanation || undefined
          }))
        : [],
      tags: Array.isArray(item.tags) ? item.tags : [],
      categoryId: item.categoryId || item.category_id || undefined,
      referenceMaterial: item.referenceMaterial || item.reference_material || undefined,
      metaData: item.metaData || {}
    };
  }

  // ── CSV parser ──────────────────────────────────────────────────────────────

  private parseCsv(content: string): CreateQuestionDto[] {
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const items: CreateQuestionDto[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = this.parseCsvLine(lines[i]);
      if (cols.length === 0) continue;

      const rowMap: Record<string, string> = {};
      headers.forEach((h, idx) => (rowMap[h] = (cols[idx] || '').trim()));

      const optStr = rowMap['options'] || '';
      const options = optStr
        ? optStr.split('|').map(s => {
            const correct = s.trim().startsWith('*');
            return { text: correct ? s.trim().substring(1).trim() : s.trim(), isCorrect: correct };
          }).filter(o => o.text.length > 0)
        : [];

      items.push({
        bankId: rowMap['bank_id'] || rowMap['bankid'] || 'default',
        institutionId: rowMap['institution_id'] || rowMap['institutionid'] || 'default',
        type: (rowMap['type'] as any) || 'MCQ_SINGLE',
        title: rowMap['title'] || `Question ${i}`,
        body: rowMap['body'] || rowMap['title'] || `Question ${i}`,
        difficulty: (rowMap['difficulty'] as any) || 'MEDIUM',
        marks: parseFloat(rowMap['marks'] || '1'),
        negativeMarks: parseFloat(rowMap['negative_marks'] || '0'),
        estimatedTimeSeconds: parseInt(rowMap['estimated_time_seconds'] || '60', 10),
        options,
        tags: rowMap['tags'] ? rowMap['tags'].split(';').map(t => t.trim()) : [],
        explanation: rowMap['explanation'] || undefined,
        categoryId: rowMap['category_id'] || undefined
      });
    }

    return items;
  }

  /** Handles quoted CSV fields containing commas */
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  // ── Markdown parser ─────────────────────────────────────────────────────────

  private parseMarkdown(content: string): CreateQuestionDto[] {
    const sections = content.split(/^###\s+/m).filter(s => s.trim().length > 0);
    return sections.map(sec => {
      const lines = sec.split(/\r?\n/);
      const title = lines[0].trim();
      let body = '';
      const options: Array<{ text: string; isCorrect: boolean }> = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('- [x]') || line.startsWith('- [X]')) {
          options.push({ text: line.substring(5).trim(), isCorrect: true });
        } else if (line.startsWith('- [ ]')) {
          options.push({ text: line.substring(5).trim(), isCorrect: false });
        } else if (line.length > 0 && !line.startsWith('---')) {
          body += (body ? '\n' : '') + line;
        }
      }

      const correctCount = options.filter(o => o.isCorrect).length;
      const type = options.length > 0
        ? (correctCount > 1 ? 'MCQ_MULTIPLE' : 'MCQ_SINGLE')
        : 'SHORT_ANSWER';

      return {
        bankId: 'default',
        institutionId: 'default',
        type,
        title,
        body: body || title,
        options
      } as CreateQuestionDto;
    });
  }

  // ── Export / Generate ───────────────────────────────────────────────────────

  public generateExportPayload(questions: QuestionResponseDto[], format: QuestionFormat): string {
    switch (format) {
      case 'JSON':
        return JSON.stringify(questions, null, 2);
      case 'CSV':
        return this.exportCsv(questions);
      case 'MARKDOWN':
        return this.exportMarkdown(questions);
      case 'EXCEL':
        // Return CSV for Excel (callers should rename file extension)
        return this.exportCsv(questions);
      default:
        return '';
    }
  }

  private exportCsv(questions: QuestionResponseDto[]): string {
    const header = 'question_id,title,type,difficulty,marks,negative_marks,estimated_time_seconds,options,tags,explanation\n';
    const rows = questions.map(q => {
      const opts = (q.options || []).map(o => (o.isCorrect ? `*${o.text}` : o.text)).join('|');
      const tags = (q.question.tags || []).join(';');
      const expl = (q.question.explanation || '').replace(/"/g, '""');
      return [
        `"${q.question.questionId}"`,
        `"${q.question.title.replace(/"/g, '""')}"`,
        `"${q.question.type}"`,
        `"${q.question.difficulty}"`,
        q.question.marks,
        q.question.negativeMarks,
        q.question.estimatedTimeSeconds,
        `"${opts}"`,
        `"${tags}"`,
        `"${expl}"`
      ].join(',');
    });
    return header + rows.join('\n');
  }

  private exportMarkdown(questions: QuestionResponseDto[]): string {
    return questions
      .map(q => {
        let md = `### ${q.question.title}\n\n`;
        if (q.question.instructions) md += `*${q.question.instructions}*\n\n`;
        md += `${q.question.body}\n\n`;
        if (q.options && q.options.length > 0) {
          for (const opt of q.options) {
            md += `- [${opt.isCorrect ? 'x' : ' '}] ${opt.text}\n`;
          }
          md += '\n';
        }
        if (q.question.explanation) {
          md += `> **Explanation:** ${q.question.explanation}\n\n`;
        }
        return md;
      })
      .join('\n---\n\n');
  }

  // ── Template Generation ─────────────────────────────────────────────────────

  public generateTemplate(format: QuestionFormat): ExportTemplateDto {
    switch (format) {
      case 'JSON':
        return {
          format,
          description: 'JSON bulk import template. Each object represents one question.',
          templateContent: JSON.stringify(
            [
              {
                type: 'MCQ_SINGLE',
                title: 'Sample MCQ Question',
                body: 'What is the capital of France?',
                difficulty: 'EASY',
                marks: 1,
                negativeMarks: 0,
                estimatedTimeSeconds: 60,
                options: [
                  { text: 'Paris', isCorrect: true },
                  { text: 'London', isCorrect: false },
                  { text: 'Berlin', isCorrect: false },
                  { text: 'Madrid', isCorrect: false }
                ],
                tags: ['geography'],
                explanation: 'Paris is the capital city of France.'
              }
            ],
            null,
            2
          )
        };

      case 'CSV':
      case 'EXCEL':
        return {
          format,
          description: 'CSV bulk import template. Options separated by | (prefix * for correct).',
          templateContent: [
            'title,body,type,difficulty,marks,negative_marks,estimated_time_seconds,options,tags,explanation',
            '"Sample MCQ Question","What is the capital of France?",MCQ_SINGLE,EASY,1,0,60,"*Paris|London|Berlin|Madrid","geography","Paris is the capital of France."'
          ].join('\n')
        };

      case 'MARKDOWN':
        return {
          format,
          description: 'Markdown bulk import template. Use ### for question title, - [x] for correct options.',
          templateContent: [
            '### Sample MCQ Question',
            '',
            'What is the capital of France?',
            '',
            '- [x] Paris',
            '- [ ] London',
            '- [ ] Berlin',
            '- [ ] Madrid',
            ''
          ].join('\n')
        };

      default:
        return { format, description: 'Unknown format', templateContent: '' };
    }
  }
}
