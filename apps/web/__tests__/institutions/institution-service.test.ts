import { describe, it } from 'node:test';
import assert from 'node:assert';
import { institutionService } from '../../services/institution.service';

describe('InstitutionService API Client Suite', () => {
  it('should define all microservice endpoints', () => {
    assert.ok(institutionService.getAll);
    assert.ok(institutionService.getById);
    assert.ok(institutionService.create);
    assert.ok(institutionService.update);
    assert.ok(institutionService.delete);
    assert.ok(institutionService.getDepartments);
    assert.ok(institutionService.createDepartment);
    assert.ok(institutionService.getCourses);
    assert.ok(institutionService.createCourse);
    assert.ok(institutionService.getFaculty);
    assert.ok(institutionService.assignFaculty);
    assert.ok(institutionService.getBranding);
    assert.ok(institutionService.updateBranding);
    assert.ok(institutionService.getConfiguration);
    assert.ok(institutionService.updateConfiguration);
  });
});
