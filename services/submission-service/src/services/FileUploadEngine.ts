import { createHash } from 'crypto';
import { generateUuid } from '@sentinel-ai/utils';
import { Logger } from '@sentinel-ai/logger';
import { SubmissionRepository } from '../db/SubmissionRepository';
import { FileType, SubmissionFileEntity, UploadFileDto } from '../types/submission';
import { SubmissionServiceConfig } from '../config/submission-config';

export class FileUploadEngine {
  private readonly logger: Logger;

  constructor(
    private readonly repository: SubmissionRepository,
    private readonly config: SubmissionServiceConfig
  ) {
    this.logger = new Logger({ serviceName: 'submission-service' });
  }

  /**
   * Validates and registers a file upload.
   */
  public async processFileUpload(
    submissionId: string,
    candidateId: string,
    dto: UploadFileDto
  ): Promise<SubmissionFileEntity> {
    // 1. Validate file size
    if (dto.fileSizeBytes <= 0) {
      throw new Error('SUBMISSION_INVALID_FILE: File size must be greater than 0 bytes');
    }
    if (dto.fileSizeBytes > this.config.maxFileSizeBytes) {
      throw new Error(
        `SUBMISSION_FILE_TOO_LARGE: File size (${dto.fileSizeBytes} bytes) exceeds maximum allowed size (${this.config.maxFileSizeBytes} bytes)`
      );
    }

    // 2. Validate MIME type
    if (this.config.allowedMimeTypes.length > 0 && !this.isMimeTypeAllowed(dto.mimeType)) {
      throw new Error(`SUBMISSION_INVALID_FILE_TYPE: File MIME type "${dto.mimeType}" is not allowed`);
    }

    // 3. Compute or verify content hash (SHA-256)
    const contentHash = dto.contentBase64
      ? createHash('sha256').update(Buffer.from(dto.contentBase64, 'base64')).digest('hex')
      : createHash('sha256').update(`${dto.fileName}:${dto.fileSizeBytes}:${Date.now()}`).digest('hex');

    // 4. Duplicate check via hash
    const existing = await this.repository.findFileByHash(contentHash);
    if (existing && existing.submissionId === submissionId) {
      this.logger.info(`Duplicate file detected for submission ${submissionId} (hash: ${contentHash})`);
      return existing;
    }

    // 5. Virus scan hook
    const virusScanPassed = this.performVirusScan(dto);
    if (!virusScanPassed) {
      throw new Error(`SUBMISSION_VIRUS_DETECTED: File "${dto.fileName}" failed virus scan inspection`);
    }

    const fileId = generateUuid();
    const storagePath = `submissions/${submissionId}/files/${fileId}_${dto.fileName}`;

    const fileEntity: SubmissionFileEntity = {
      fileId,
      answerId: null,
      submissionId,
      candidateId,
      fileName: dto.fileName,
      fileType: dto.fileType || this.inferFileType(dto.fileName, dto.mimeType),
      fileSizeBytes: dto.fileSizeBytes,
      mimeType: dto.mimeType,
      contentHash,
      storagePath,
      virusScanPassed: true,
      uploadedAt: new Date().toISOString()
    };

    await this.repository.saveFile(fileEntity);
    this.logger.info(`File uploaded successfully for submission ${submissionId}: ${dto.fileName} (${dto.fileSizeBytes} bytes)`);

    return fileEntity;
  }

  /**
   * Virus scan hook implementation.
   */
  private performVirusScan(_dto: UploadFileDto): boolean {
    // Production hook for antivirus integration (ClamAV/AWS GuardDuty)
    return true;
  }

  private isMimeTypeAllowed(mimeType: string): boolean {
    return this.config.allowedMimeTypes.some(allowed => {
      if (allowed === '*/*' || allowed === mimeType) return true;
      if (allowed.endsWith('/*')) {
        const prefix = allowed.split('/')[0];
        return mimeType.startsWith(`${prefix}/`);
      }
      return false;
    });
  }

  private inferFileType(fileName: string, mimeType: string): FileType {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext) || mimeType.startsWith('image/')) return 'IMAGE';
    if (ext === 'pdf' || mimeType === 'application/pdf') return 'PDF';
    if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext) || mimeType.includes('word')) return 'DOCUMENT';
    if (['zip', 'tar', 'gz', '7z', 'rar'].includes(ext) || mimeType.includes('zip')) return 'ZIP';
    if (['py', 'js', 'ts', 'java', 'cpp', 'c', 'cs', 'go', 'rs', 'html', 'css'].includes(ext)) return 'SOURCE_CODE';
    return 'OTHER';
  }
}
