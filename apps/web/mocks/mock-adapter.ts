import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { mockDb } from './mock-database';

export function setupMockInterceptor(client: AxiosInstance) {
  const isEnabled = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';
  if (!isEnabled) return;

  const originalAdapter = client.defaults.adapter;

  client.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    const url = config.url || '';
    const method = (config.method || 'GET').toUpperCase();

    // Simulate 100ms network latency
    await new Promise((res) => setTimeout(res, 100));

    let mockData: any = null;

    try {
      // ── Auth Endpoints ────────────────────────────────────────────────────────
      if (url.includes('/auth/me')) {
        const u = mockDb.getCurrentUser();
        mockData = { user: u, permissions: u.permissions };
      } else if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/register')) {
        const u = mockDb.getCurrentUser();
        mockData = { accessToken: u.jwtToken, refreshToken: u.refreshToken, user: u };
      }

      // ── Institution Endpoints ──────────────────────────────────────────────────
      else if (url.includes('/institutions') && !url.includes('/departments') && !url.includes('/courses')) {
        if (method === 'GET') {
          const idMatch = url.match(/\/institutions\/([^\/]+)$/);
          if (idMatch && idMatch[1] !== 'search') {
            const found = mockDb.institutions.find((i) => i.institutionId === idMatch[1]);
            mockData = found || mockDb.institutions[0];
          } else {
            mockData = { items: mockDb.institutions, total: mockDb.institutions.length };
          }
        } else {
          let body: any = {};
          try {
            body = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};
          } catch {
            body = {};
          }
          const newInst = {
            institutionId: body.institutionId || `inst_${Date.now()}`,
            name: body.name || 'New Institution',
            code: body.code || 'NEW-CODE',
            domain: body.domain || 'example.edu',
            contactEmail: body.contactEmail || 'admin@example.edu',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          mockDb.institutions.push(newInst as any);
          mockData = newInst;
        }
      }

      // ── Departments & Courses ──────────────────────────────────────────────────
      else if (url.includes('/departments')) {
        mockData = { items: mockDb.departments, total: mockDb.departments.length };
      } else if (url.includes('/courses')) {
        mockData = { items: mockDb.courses, total: mockDb.courses.length };
      } else if (url.includes('/programs')) {
        mockData = { items: mockDb.programs, total: mockDb.programs.length };
      } else if (url.includes('/batches')) {
        mockData = { items: mockDb.batches, total: mockDb.batches.length };
      }

      // ── User & Role Endpoints ──────────────────────────────────────────────────
      else if (url.includes('/users')) {
        if (method === 'GET') {
          const idMatch = url.match(/\/users\/([^\/]+)$/);
          if (idMatch && idMatch[1] !== 'search') {
            const found = mockDb.users.find((u) => u.id === idMatch[1] || u.userId === idMatch[1]);
            mockData = found || mockDb.users[0];
          } else {
            mockData = { items: mockDb.users, total: mockDb.users.length };
          }
        } else {
          mockData = mockDb.users[0];
        }
      } else if (url.includes('/roles')) {
        mockData = { items: mockDb.roles, total: mockDb.roles.length };
      } else if (url.includes('/permissions')) {
        mockData = mockDb.permissions;
      } else if (url.includes('/invitations')) {
        mockData = { items: mockDb.invitations, total: mockDb.invitations.length };
      }

      // ── Exam Endpoints ────────────────────────────────────────────────────────
      else if (url.includes('/exams')) {
        if (method === 'GET') {
          const idMatch = url.match(/\/exams\/([^\/]+)$/);
          if (idMatch && idMatch[1] !== 'search') {
            const found = mockDb.exams.find((e) => e.id === idMatch[1] || e.examId === idMatch[1]);
            mockData = found || mockDb.exams[0];
          } else {
            mockData = { items: mockDb.exams, total: mockDb.exams.length };
          }
        } else {
          mockData = mockDb.exams[0];
        }
      }

      // ── Question Bank Endpoints ───────────────────────────────────────────────
      else if (url.includes('/questions') || url.includes('/banks')) {
        if (url.includes('/categories')) {
          mockData = mockDb.categories;
        } else if (url.includes('/tags')) {
          mockData = mockDb.tags;
        } else if (url.includes('/pools')) {
          mockData = mockDb.pools;
        } else if (method === 'GET') {
          const idMatch = url.match(/\/questions\/([^\/]+)$/);
          if (idMatch && idMatch[1] !== 'search') {
            const found = mockDb.questions.find((q) => q.id === idMatch[1] || q.questionId === idMatch[1]);
            mockData = found || mockDb.questions[0];
          } else {
            mockData = { items: mockDb.questions, total: mockDb.questions.length };
          }
        } else {
          mockData = mockDb.questions[0];
        }
      }

      // ── Candidate Session Endpoints ───────────────────────────────────────────
      else if (url.includes('/sessions')) {
        if (method === 'GET') {
          mockData = { session: mockDb.sessions[0] };
        } else {
          mockData = { session: mockDb.sessions[0], status: { isAlive: true, missCount: 0 } };
        }
      }

      // ── Proctor Monitoring Endpoints ──────────────────────────────────────────
      else if (url.includes('/monitoring')) {
        if (url.includes('/exams/active')) {
          mockData = [
            {
              examId: 'exam_cs101',
              examCode: 'CS101',
              title: 'Introduction to Computer Science & Data Structures',
              institutionId: 'inst_mit_01',
              totalCandidates: 120,
              inProgressCandidates: 95,
              suspiciousCandidates: 4,
              averageRiskScore: 0.12,
              status: 'LIVE'
            },
            {
              examId: 'exam_math202',
              examCode: 'MATH202',
              title: 'Multivariable Calculus & Linear Algebra Final',
              institutionId: 'inst_mit_01',
              totalCandidates: 85,
              inProgressCandidates: 70,
              suspiciousCandidates: 1,
              averageRiskScore: 0.05,
              status: 'LIVE'
            }
          ];
        } else if (url.includes('/candidates')) {
          const candIdMatch = url.match(/\/candidates\/([^\?\/]+)$/);
          if (candIdMatch && candIdMatch[1] !== 'search') {
            const isSelf = candIdMatch[1] === 'sess_100' || candIdMatch[1] === 'cand_100';
            mockData = {
              candidateSessionId: candIdMatch[1],
              examId: 'exam_cs101',
              institutionId: 'inst_mit_01',
              candidateId: isSelf ? 'cand_100' : 'cand_101',
              candidateName: isSelf ? 'Rohan Singh (YOU - Live Candidate)' : 'Priya Sharma',
              status: 'IN_PROGRESS',
              currentRiskScore: isSelf ? 0.05 : 0.78,
              riskLevel: isSelf ? 'LOW' : 'HIGH',
              lastHeartbeatAt: new Date().toISOString(),
              isFlagged: !isSelf,
              manualActionCount: isSelf ? 0 : 1,
              activeAlertCount: isSelf ? 0 : 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          } else {
            mockData = [
              {
                candidateSessionId: 'sess_100',
                examId: 'exam_cs101',
                institutionId: 'inst_mit_01',
                candidateId: 'cand_100',
                candidateName: 'Rohan Singh (YOU - Live Candidate)',
                status: 'IN_PROGRESS',
                currentRiskScore: 0.05,
                riskLevel: 'LOW',
                lastHeartbeatAt: new Date().toISOString(),
                isFlagged: false,
                manualActionCount: 0,
                activeAlertCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                candidateSessionId: 'sess_101',
                examId: 'exam_cs101',
                institutionId: 'inst_mit_01',
                candidateId: 'cand_101',
                candidateName: 'Priya Sharma',
                status: 'SUSPICIOUS',
                currentRiskScore: 0.78,
                riskLevel: 'HIGH',
                lastHeartbeatAt: new Date().toISOString(),
                isFlagged: true,
                manualActionCount: 1,
                activeAlertCount: 2,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                candidateSessionId: 'sess_102',
                examId: 'exam_cs101',
                institutionId: 'inst_mit_01',
                candidateId: 'cand_102',
                candidateName: 'Aarav Patel',
                status: 'IN_PROGRESS',
                currentRiskScore: 0.08,
                riskLevel: 'LOW',
                lastHeartbeatAt: new Date().toISOString(),
                isFlagged: false,
                manualActionCount: 0,
                activeAlertCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                candidateSessionId: 'sess_103',
                examId: 'exam_cs101',
                institutionId: 'inst_mit_01',
                candidateId: 'cand_103',
                candidateName: 'Ananya Iyer',
                status: 'PAUSED',
                currentRiskScore: 0.45,
                riskLevel: 'MEDIUM',
                lastHeartbeatAt: new Date().toISOString(),
                isFlagged: false,
                manualActionCount: 1,
                activeAlertCount: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ];
          }
        } else if (url.includes('/stats')) {
          mockData = {
            activeExamsCount: 2,
            totalMonitoredCandidates: 205,
            suspiciousCandidatesCount: 5,
            openAlertsCount: 3
          };
        } else if (url.includes('/risk')) {
          mockData = {
            candidateSessionId: 'sess_101',
            examId: 'exam_cs101',
            institutionId: 'inst_mit_01',
            currentScore: 0.78,
            level: 'HIGH',
            history: [
              { timestamp: new Date().toISOString(), score: 0.05, reason: 'Initial Baseline' },
              { timestamp: new Date().toISOString(), score: 0.78, reason: 'Gaze deviation vector offscreen' }
            ]
          };
        } else if (url.includes('/alerts')) {
          mockData = [
            {
              alertId: 'alert_901',
              candidateSessionId: 'sess_101',
              examId: 'exam_cs101',
              institutionId: 'inst_mit_01',
              title: 'Gaze Deviation & Offscreen Look',
              description: 'Candidate looked away from primary monitor for > 8 seconds',
              priority: 'HIGH',
              severity: 'SUSPICIOUS',
              category: 'GAZE',
              status: 'OPEN',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
        } else if (url.includes('/evidence')) {
          mockData = [
            {
              evidenceId: 'ev_901',
              candidateSessionId: 'sess_101',
              examId: 'exam_cs101',
              institutionId: 'inst_mit_01',
              type: 'SCREENSHOT',
              title: 'Secondary Device Frame Capture',
              storageUri: '#',
              mimeType: 'image/png',
              sizeBytes: 245000,
              recordedAt: new Date().toISOString()
            }
          ];
        } else if (url.includes('/timeline')) {
          mockData = [
            {
              activityId: 'act_1',
              candidateSessionId: 'sess_101',
              examId: 'exam_cs101',
              institutionId: 'inst_mit_01',
              type: 'GAZE_OFFSCREEN',
              description: 'Gaze direction vector deviated left of screen bounds',
              timestamp: new Date().toISOString()
            }
          ];
        } else {
          mockData = { message: 'Action executed successfully' };
        }
      }

      // ── Fail-safe Fallback for any other API endpoint in Mock Mode ────────────
      if (mockData === null) {
        mockData = { items: [], total: 0, message: 'Mock response success' };
      }

      return {
        data: { success: true, data: mockData },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
        request: {}
      };
    } catch (err) {
      if (typeof originalAdapter === 'function') {
        return originalAdapter(config);
      }
      throw err;
    }
  };

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.adapter = client.defaults.adapter;
    return config;
  });
}
