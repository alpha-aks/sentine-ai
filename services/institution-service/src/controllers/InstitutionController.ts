import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@sentinel-ai/types';
import { TenantRequest } from '../middleware/tenant-middleware';
import { InstitutionService } from '../services/InstitutionService';

export class InstitutionController {
  private readonly service: InstitutionService;

  constructor(service?: InstitutionService) {
    this.service = service || new InstitutionService();
  }

  public getService(): InstitutionService {
    return this.service;
  }

  private sendResponse<T>(res: Response, statusCode: number, data: T, req: Request): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        requestId: (req.headers['x-request-id'] as string) || `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    };
    res.status(statusCode).json(response);
  }

  // --- Institution CRUD ---
  public createInstitution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.createInstitution({
        slug: req.body.slug,
        name: req.body.name,
        type: req.body.type || 'UNIVERSITY',
        contactEmail: req.body.contactEmail || req.body.contact_email,
        phoneNumber: req.body.phoneNumber || req.body.phone_number,
        address: req.body.address
      });
      this.sendResponse(res, 201, result, req);
    } catch (err) {
      next(err);
    }
  };

  public getInstitution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const details = await this.service.getInstitutionDetails(institutionId);
      this.sendResponse(res, 200, details, req);
    } catch (err) {
      next(err);
    }
  };

  public updateInstitution = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const updated = await this.service.updateInstitution(institutionId, req.body);
      this.sendResponse(res, 200, updated, req);
    } catch (err) {
      next(err);
    }
  };

  public deleteInstitution = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      await this.service.deleteInstitution(institutionId);
      this.sendResponse(res, 200, { message: `Institution ${institutionId} deleted successfully` }, req);
    } catch (err) {
      next(err);
    }
  };

  public searchInstitutions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryDto = {
        query: req.query.q as string,
        type: req.query.type as any,
        status: req.query.status as any,
        page: req.query.page ? parseInt(String(req.query.page), 10) : 1,
        limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 20
      };
      const result = await this.service.searchInstitutions(queryDto);
      this.sendResponse(res, 200, result, req);
    } catch (err) {
      next(err);
    }
  };

  // --- Department ---
  public createDepartment = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const dept = await this.service.createDepartment(institutionId, {
        code: req.body.code,
        name: req.body.name,
        headOfDepartment: req.body.headOfDepartment || req.body.head_of_department
      });
      this.sendResponse(res, 201, dept, req);
    } catch (err) {
      next(err);
    }
  };

  public getDepartments = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const depts = await this.service.getDepartments(institutionId);
      this.sendResponse(res, 200, { departments: depts }, req);
    } catch (err) {
      next(err);
    }
  };

  // --- Course ---
  public createCourse = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const course = await this.service.createCourse(institutionId, {
        departmentId: req.body.departmentId || req.body.department_id,
        code: req.body.code,
        title: req.body.title,
        description: req.body.description,
        credits: req.body.credits ? parseInt(String(req.body.credits), 10) : 3
      });
      this.sendResponse(res, 201, course, req);
    } catch (err) {
      next(err);
    }
  };

  public getCourses = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const departmentId = req.query.departmentId as string;
      const courses = await this.service.getCourses(institutionId, departmentId);
      this.sendResponse(res, 200, { courses }, req);
    } catch (err) {
      next(err);
    }
  };

  // --- Faculty ---
  public assignFaculty = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const faculty = await this.service.assignFaculty(institutionId, {
        departmentId: req.body.departmentId || req.body.department_id,
        userId: req.body.userId || req.body.user_id,
        title: req.body.title,
        email: req.body.email,
        assignedCourses: req.body.assignedCourses || req.body.assigned_courses
      });
      this.sendResponse(res, 201, faculty, req);
    } catch (err) {
      next(err);
    }
  };

  public getFaculty = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const departmentId = req.query.departmentId as string;
      const faculty = await this.service.getFaculty(institutionId, departmentId);
      this.sendResponse(res, 200, { faculty }, req);
    } catch (err) {
      next(err);
    }
  };

  // --- Program, Batch & Semester ---
  public createProgram = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const program = await this.service.createProgram(institutionId, req.body);
      this.sendResponse(res, 201, program, req);
    } catch (err) {
      next(err);
    }
  };

  public getPrograms = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const programs = await this.service.getPrograms(institutionId);
      this.sendResponse(res, 200, { programs }, req);
    } catch (err) {
      next(err);
    }
  };

  public createBatch = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const batch = await this.service.createBatch(institutionId, {
        programId: req.body.programId || req.body.program_id,
        year: req.body.year ? parseInt(String(req.body.year), 10) : new Date().getFullYear(),
        name: req.body.name,
        maxCapacity: req.body.maxCapacity ? parseInt(String(req.body.maxCapacity), 10) : 100
      });
      this.sendResponse(res, 201, batch, req);
    } catch (err) {
      next(err);
    }
  };

  public createSemester = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const semester = await this.service.createSemester(institutionId, {
        batchId: req.body.batchId || req.body.batch_id,
        termName: req.body.termName || req.body.term_name,
        startDate: req.body.startDate || req.body.start_date,
        endDate: req.body.endDate || req.body.end_date,
        isCurrent: req.body.isCurrent ?? req.body.is_current ?? false
      });
      this.sendResponse(res, 201, semester, req);
    } catch (err) {
      next(err);
    }
  };

  public getSemesters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const batchId = req.params.batchId;
      const semesters = await this.service.getSemesters(batchId);
      this.sendResponse(res, 200, { semesters }, req);
    } catch (err) {
      next(err);
    }
  };

  // --- Calendar ---
  public addCalendarEvent = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const events = await this.service.addCalendarEvent(institutionId, {
        title: req.body.title,
        eventDate: req.body.eventDate || req.body.event_date,
        eventType: req.body.eventType || req.body.event_type || 'EXAM_WINDOW',
        description: req.body.description
      });
      this.sendResponse(res, 201, { calendar: events }, req);
    } catch (err) {
      next(err);
    }
  };

  public getCalendar = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const calendar = await this.service.getCalendar(institutionId);
      this.sendResponse(res, 200, { calendar }, req);
    } catch (err) {
      next(err);
    }
  };

  // --- Branding & Configuration ---
  public getBranding = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const branding = await this.service.getBranding(institutionId);
      this.sendResponse(res, 200, branding, req);
    } catch (err) {
      next(err);
    }
  };

  public updateBranding = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const updated = await this.service.updateBranding(institutionId, req.body);
      this.sendResponse(res, 200, updated, req);
    } catch (err) {
      next(err);
    }
  };

  public getConfiguration = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const config = await this.service.getConfiguration(institutionId);
      this.sendResponse(res, 200, config, req);
    } catch (err) {
      next(err);
    }
  };

  public updateConfiguration = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = req.params.institutionId;
      const updated = await this.service.updateConfiguration(institutionId, req.body);
      this.sendResponse(res, 200, updated, req);
    } catch (err) {
      next(err);
    }
  };
}
