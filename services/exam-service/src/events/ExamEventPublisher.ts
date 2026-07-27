import { EventPublisher, InMemoryEventBus } from '@sentinel-ai/event-sdk';
import { Logger } from '@sentinel-ai/logger';
import { ExamEntity, ExamScheduleEntity } from '../types/exam';

export class ExamEventPublisher {
  private readonly publisher: EventPublisher;
  private readonly logger: Logger;

  constructor(eventBus?: InMemoryEventBus, logger?: Logger) {
    const bus = eventBus || new InMemoryEventBus();
    this.publisher = new EventPublisher(bus, { sourceName: 'exam-service' });
    this.logger = logger || new Logger({ serviceName: 'exam-service' });
  }

  public async publishExamCreated(exam: ExamEntity): Promise<void> {
    this.logger.info(`Publishing ExamCreated event for ${exam.examId}`);
    await this.publisher.publish('ExamCreated', {
      examId: exam.examId,
      institutionId: exam.institutionId,
      code: exam.code,
      title: exam.title,
      type: exam.type,
      status: exam.status
    });
  }

  public async publishExamUpdated(exam: ExamEntity): Promise<void> {
    this.logger.info(`Publishing ExamUpdated event for ${exam.examId}`);
    await this.publisher.publish('ExamUpdated', {
      examId: exam.examId,
      title: exam.title,
      status: exam.status
    });
  }

  public async publishExamDeleted(examId: string): Promise<void> {
    this.logger.info(`Publishing ExamDeleted event for ${examId}`);
    await this.publisher.publish('ExamDeleted', { examId });
  }

  public async publishExamPublished(examId: string, publishedById: string): Promise<void> {
    this.logger.info(`Publishing ExamPublished event for ${examId}`);
    await this.publisher.publish('ExamPublished', { examId, publishedById });
  }

  public async publishExamArchived(examId: string): Promise<void> {
    this.logger.info(`Publishing ExamArchived event for ${examId}`);
    await this.publisher.publish('ExamArchived', { examId });
  }

  public async publishExamScheduled(examId: string, schedule: ExamScheduleEntity): Promise<void> {
    this.logger.info(`Publishing ExamScheduled event for ${examId}`);
    await this.publisher.publish('ExamScheduled', { examId, schedule });
  }

  public async publishExamStarted(examId: string): Promise<void> {
    this.logger.info(`Publishing ExamStarted event for ${examId}`);
    await this.publisher.publish('ExamStarted', { examId });
  }

  public async publishExamEnded(examId: string): Promise<void> {
    this.logger.info(`Publishing ExamEnded event for ${examId}`);
    await this.publisher.publish('ExamEnded', { examId });
  }

  public async publishExamCancelled(examId: string, reason?: string): Promise<void> {
    this.logger.info(`Publishing ExamCancelled event for ${examId}`);
    await this.publisher.publish('ExamCancelled', { examId, reason });
  }

  public async publishExamConfigurationChanged(examId: string, details: Record<string, any>): Promise<void> {
    this.logger.info(`Publishing ExamConfigurationChanged event for ${examId}`);
    await this.publisher.publish('ExamConfigurationChanged', { examId, details });
  }
}
