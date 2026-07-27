import assert from 'assert';
import { test, describe, beforeEach } from 'node:test';
import { InstitutionCache } from '../cache/InstitutionCache';
import { InstitutionRepository } from '../db/InstitutionRepository';
import { InstitutionService } from '../services/InstitutionService';

describe('Institution Service Suite', () => {
  let repository: InstitutionRepository;
  let cache: InstitutionCache;
  let service: InstitutionService;

  beforeEach(() => {
    repository = new InstitutionRepository();
    cache = new InstitutionCache(600);
    service = new InstitutionService(repository, cache);
  });

  test('1. Create Institution & Provisions Default Branding and Config', async () => {
    const result = await service.createInstitution({
      slug: 'stanford-univ',
      name: 'Stanford University',
      type: 'UNIVERSITY',
      contactEmail: 'admin@stanford.edu',
      phoneNumber: '+1-650-723-2300'
    });

    assert.strictEqual(result.institution.name, 'Stanford University');
    assert.strictEqual(result.institution.slug, 'stanford-univ');
    assert.strictEqual(result.institution.status, 'ACTIVE');
    assert.ok(result.branding);
    assert.ok(result.branding?.portalDomain?.includes('stanford-univ'));
    assert.ok(result.configuration);
    assert.strictEqual(result.configuration.sensitivityProfile, 'STANDARD');
  });

  test('2. Department Creation & Code Uniqueness Validation', async () => {
    const inst = await service.createInstitution({
      slug: 'mit-univ',
      name: 'MIT',
      type: 'UNIVERSITY',
      contactEmail: 'admin@mit.edu'
    });

    const dept = await service.createDepartment(inst.institution.institutionId, {
      code: 'CS',
      name: 'Computer Science Department'
    });

    assert.strictEqual(dept.code, 'CS');

    // Duplicate department code within same institution should be rejected
    await assert.rejects(
      async () => {
        await service.createDepartment(inst.institution.institutionId, {
          code: 'CS',
          name: 'Computer Science Duplicate'
        });
      },
      (err: any) => err.message.includes('already exists')
    );
  });

  test('3. Course Creation & Retrieval', async () => {
    const inst = await service.createInstitution({
      slug: 'harvard-univ',
      name: 'Harvard University',
      type: 'UNIVERSITY',
      contactEmail: 'admin@harvard.edu'
    });

    const dept = await service.createDepartment(inst.institution.institutionId, {
      code: 'MATH',
      name: 'Mathematics Department'
    });

    const course = await service.createCourse(inst.institution.institutionId, {
      departmentId: dept.departmentId,
      code: 'MATH101',
      title: 'Multivariable Calculus',
      credits: 4
    });

    assert.strictEqual(course.code, 'MATH101');
    assert.strictEqual(course.credits, 4);

    const courses = await service.getCourses(inst.institution.institutionId);
    assert.strictEqual(courses.length, 1);
    assert.strictEqual(courses[0].title, 'Multivariable Calculus');
  });

  test('4. Faculty Assignment', async () => {
    const inst = await service.createInstitution({
      slug: 'oxford-univ',
      name: 'University of Oxford',
      type: 'UNIVERSITY',
      contactEmail: 'admin@oxford.ac.uk'
    });

    const dept = await service.createDepartment(inst.institution.institutionId, {
      code: 'PHYS',
      name: 'Physics Department'
    });

    const faculty = await service.assignFaculty(inst.institution.institutionId, {
      departmentId: dept.departmentId,
      userId: 'user_prof_01',
      title: 'Professor of Theoretical Physics',
      email: 'prof.smith@oxford.ac.uk'
    });

    assert.strictEqual(faculty.email, 'prof.smith@oxford.ac.uk');

    const facultyList = await service.getFaculty(inst.institution.institutionId);
    assert.strictEqual(facultyList.length, 1);
  });

  test('5. Branding & Sensitivity Configuration Updates', async () => {
    const inst = await service.createInstitution({
      slug: 'cambridge-univ',
      name: 'University of Cambridge',
      type: 'UNIVERSITY',
      contactEmail: 'admin@cam.ac.uk'
    });

    const updatedBranding = await service.updateBranding(inst.institution.institutionId, {
      primaryColor: '#003B4A',
      secondaryColor: '#A7A8AA'
    });
    assert.strictEqual(updatedBranding.primaryColor, '#003B4A');

    const updatedConfig = await service.updateConfiguration(inst.institution.institutionId, {
      sensitivityProfile: 'STRICT',
      allowMobileExams: false
    });
    assert.strictEqual(updatedConfig.sensitivityProfile, 'STRICT');
    assert.strictEqual(updatedConfig.allowMobileExams, false);
  });

  test('6. Multi-Tenant Search & Filtering', async () => {
    await service.createInstitution({
      slug: 'search-inst-1',
      name: 'Alpha Institute',
      type: 'COLLEGE',
      contactEmail: 'contact@alpha.edu'
    });

    await service.createInstitution({
      slug: 'search-inst-2',
      name: 'Beta Certification',
      type: 'CERTIFICATION_BODY',
      contactEmail: 'contact@beta.org'
    });

    const results = await service.searchInstitutions({ type: 'CERTIFICATION_BODY' });
    assert.strictEqual(results.total, 1);
    assert.strictEqual(results.items[0].slug, 'search-inst-2');
  });
});
