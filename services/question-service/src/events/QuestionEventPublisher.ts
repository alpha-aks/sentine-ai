import { EventPublisher, InMemoryEventBus } from '@sentinel-ai/event-sdk';
import { Logger } from '@sentinel-ai/logger';
import { QuestionBankEntity, QuestionEntity } from '../types/question';

export class QuestionEventPublisher {
  private readonly publisher: EventPublisher;
  private readonly logger: Logger;

  constructor(eventBus?: InMemoryEventBus, logger?: Logger) {
    const bus = eventBus || new InMemoryEventBus();
    this.publisher = new EventPublisher(bus, { sourceName: 'question-service' });
    this.logger = logger || new Logger({ serviceName: 'question-service' });
  }

  public async publishQuestionCreated(question: QuestionEntity): Promise<void> {
    this.logger.info(`Publishing QuestionCreated event for ${question.questionId}`);
    await this.publisher.publish('QuestionCreated', {
      questionId: question.questionId,
      bankId: question.bankId,
      institutionId: question.institutionId,
      type: question.type,
      title: question.title,
      difficulty: question.difficulty,
      status: question.status
    });
  }

  public async publishQuestionUpdated(question: QuestionEntity): Promise<void> {
    this.logger.info(`Publishing QuestionUpdated event for ${question.questionId}`);
    await this.publisher.publish('QuestionUpdated', {
      questionId: question.questionId,
      version: question.version,
      status: question.status
    });
  }

  public async publishQuestionDeleted(questionId: string): Promise<void> {
    this.logger.info(`Publishing QuestionDeleted event for ${questionId}`);
    await this.publisher.publish('QuestionDeleted', { questionId });
  }

  public async publishQuestionApproved(questionId: string, approvedById: string): Promise<void> {
    this.logger.info(`Publishing QuestionApproved event for ${questionId}`);
    await this.publisher.publish('QuestionApproved', { questionId, approvedById });
  }

  public async publishQuestionArchived(questionId: string): Promise<void> {
    this.logger.info(`Publishing QuestionArchived event for ${questionId}`);
    await this.publisher.publish('QuestionArchived', { questionId });
  }

  public async publishQuestionImported(jobId: string, importedCount: number): Promise<void> {
    this.logger.info(`Publishing QuestionImported event for job ${jobId}`);
    await this.publisher.publish('QuestionImported', { jobId, importedCount });
  }

  public async publishQuestionExported(jobId: string, exportedCount: number): Promise<void> {
    this.logger.info(`Publishing QuestionExported event for job ${jobId}`);
    await this.publisher.publish('QuestionExported', { jobId, exportedCount });
  }

  public async publishQuestionBankCreated(bank: QuestionBankEntity): Promise<void> {
    this.logger.info(`Publishing QuestionBankCreated event for ${bank.bankId}`);
    await this.publisher.publish('QuestionBankCreated', {
      bankId: bank.bankId,
      institutionId: bank.institutionId,
      name: bank.name,
      subject: bank.subject
    });
  }

  public async publishQuestionPoolUpdated(poolId: string): Promise<void> {
    this.logger.info(`Publishing QuestionPoolUpdated event for ${poolId}`);
    await this.publisher.publish('QuestionPoolUpdated', { poolId });
  }
}
