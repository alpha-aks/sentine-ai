import { EventPublisher, InMemoryEventBus } from '@sentinel-ai/event-sdk';
import { Logger } from '@sentinel-ai/logger';
import {
  AcademicCalendarEntity,
  CourseEntity,
  DepartmentEntity,
  FacultyEntity,
  InstitutionConfigurationEntity,
  InstitutionEntity
} from '../types/institution';

export class InstitutionEventPublisher {
  private readonly publisher: EventPublisher;
  private readonly logger: Logger;

  constructor(eventBus?: InMemoryEventBus, logger?: Logger) {
    const bus = eventBus || new InMemoryEventBus();
    this.publisher = new EventPublisher(bus, { sourceName: 'institution-service' });
    this.logger = logger || new Logger({ serviceName: 'institution-service' });
  }

  public async publishInstitutionCreated(institution: InstitutionEntity): Promise<void> {
    this.logger.info(`Publishing InstitutionCreated event for ${institution.institutionId}`);
    await this.publisher.publish('InstitutionCreated', {
      institutionId: institution.institutionId,
      slug: institution.slug,
      name: institution.name,
      type: institution.type,
      status: institution.status
    });
  }

  public async publishInstitutionUpdated(institution: InstitutionEntity): Promise<void> {
    this.logger.info(`Publishing InstitutionUpdated event for ${institution.institutionId}`);
    await this.publisher.publish('InstitutionUpdated', {
      institutionId: institution.institutionId,
      name: institution.name,
      status: institution.status
    });
  }

  public async publishInstitutionDeleted(institutionId: string): Promise<void> {
    this.logger.info(`Publishing InstitutionDeleted event for ${institutionId}`);
    await this.publisher.publish('InstitutionDeleted', { institutionId });
  }

  public async publishDepartmentCreated(department: DepartmentEntity): Promise<void> {
    this.logger.info(`Publishing DepartmentCreated event for ${department.departmentId}`);
    await this.publisher.publish('DepartmentCreated', {
      departmentId: department.departmentId,
      institutionId: department.institutionId,
      code: department.code,
      name: department.name
    });
  }

  public async publishCourseCreated(course: CourseEntity): Promise<void> {
    this.logger.info(`Publishing CourseCreated event for ${course.courseId}`);
    await this.publisher.publish('CourseCreated', {
      courseId: course.courseId,
      institutionId: course.institutionId,
      departmentId: course.departmentId,
      code: course.code,
      title: course.title,
      credits: course.credits
    });
  }

  public async publishFacultyAssigned(faculty: FacultyEntity): Promise<void> {
    this.logger.info(`Publishing FacultyAssigned event for faculty ${faculty.facultyId}`);
    await this.publisher.publish('FacultyAssigned', {
      facultyId: faculty.facultyId,
      institutionId: faculty.institutionId,
      departmentId: faculty.departmentId,
      userId: faculty.userId,
      email: faculty.email
    });
  }

  public async publishAcademicCalendarUpdated(
    institutionId: string,
    events: AcademicCalendarEntity[]
  ): Promise<void> {
    this.logger.info(`Publishing AcademicCalendarUpdated event for ${institutionId}`);
    await this.publisher.publish('AcademicCalendarUpdated', {
      institutionId,
      eventCount: events.length,
      events
    });
  }

  public async publishInstitutionConfigurationChanged(
    institutionId: string,
    config: InstitutionConfigurationEntity
  ): Promise<void> {
    this.logger.info(`Publishing InstitutionConfigurationChanged event for ${institutionId}`);
    await this.publisher.publish('InstitutionConfigurationChanged', {
      institutionId,
      config
    });
  }
}
