import { Exam, ExamSession, ExamPolicy, SensitivityProfile, AgentWeights, RiskThresholds } from '@sentinel-ai/types';
import { SENSITIVITY_PRESETS } from '@sentinel-ai/constants';

export class ExamService {
  private exams: Map<string, Exam> = new Map();
  private sessions: Map<string, ExamSession> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData(): void {
    const defaultPolicy: ExamPolicy = {
      policyId: 'pol_std_001',
      examId: 'exam_cs101',
      sensitivityProfile: 'STANDARD',
      agentWeights: SENSITIVITY_PRESETS.STANDARD.weights,
      riskThresholds: SENSITIVITY_PRESETS.STANDARD.thresholds,
      enabledAgents: {
        visionGuard: true,
        behavioralAnalyst: true,
        collusionDetection: true,
        riskPrediction: true
      }
    };

    const mockExam: Exam = {
      examId: 'exam_cs101',
      institutionId: 'inst_mit_01',
      code: 'CS101-2026',
      title: 'Advanced Computer Science & Algorithms',
      description: 'Comprehensive examination covering Data Structures, Graph Theory, and Multi-Agent AI Systems.',
      durationMinutes: 90,
      policy: defaultPolicy,
      questions: [
        {
          questionId: 'q1',
          type: 'MULTIPLE_CHOICE',
          text: 'Which data structure offers average O(1) time complexity for insertions and lookups?',
          options: ['Binary Search Tree', 'Hash Map', 'Red-Black Tree', 'Doubly Linked List'],
          correctAnswer: 'Hash Map'
        },
        {
          questionId: 'q2',
          type: 'ESSAY',
          text: 'Explain the difference between A* Search and Dijkstra Algorithm in Graph Search, including heuristic requirements.'
        },
        {
          questionId: 'q3',
          type: 'MULTIPLE_CHOICE',
          text: 'What is the primary role of the Decision Orchestrator in SentinelAI?',
          options: ['Capture video frames', 'Correlate multi-modal signals and calculate final risk score', 'Render React UI', 'Encrypt databases'],
          correctAnswer: 'Correlate multi-modal signals and calculate final risk score'
        }
      ]
    };

    this.exams.set(mockExam.examId, mockExam);

    // Seed mock candidate exam sessions for live proctoring demonstration
    const candidates = [
      { id: 'cand_alex_01', name: 'Rohan Singh', initialRisk: 0.12, status: 'IN_PROGRESS' as const },
      { id: 'cand_sarah_02', name: 'Priya Sharma', initialRisk: 0.78, status: 'IN_PROGRESS' as const },
      { id: 'cand_michael_03', name: 'Aarav Patel', initialRisk: 0.45, status: 'IN_PROGRESS' as const },
      { id: 'cand_elena_04', name: 'Ananya Iyer', initialRisk: 0.88, status: 'IN_PROGRESS' as const },
      { id: 'cand_david_05', name: 'Vikram Verma', initialRisk: 0.05, status: 'IN_PROGRESS' as const }
    ];

    candidates.forEach((c, idx) => {
      const sessionId = `sess_${idx + 100}`;
      this.sessions.set(sessionId, {
        sessionId,
        examId: mockExam.examId,
        candidateId: c.id,
        candidateName: c.name,
        status: c.status,
        currentRiskScore: c.initialRisk,
        startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        submissions: {}
      });
    });
  }

  public getExam(examId: string): Exam | undefined {
    return this.exams.get(examId);
  }

  public getAllExams(): Exam[] {
    return Array.from(this.exams.values());
  }

  public getSession(sessionId: string): ExamSession | undefined {
    return this.sessions.get(sessionId);
  }

  public getAllSessions(): ExamSession[] {
    return Array.from(this.sessions.values());
  }

  public updateSessionRisk(sessionId: string, riskScore: number): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.currentRiskScore = riskScore;
      this.sessions.set(sessionId, session);
    }
  }

  public updatePolicy(examId: string, profile: SensitivityProfile, customWeights?: AgentWeights, customThresholds?: RiskThresholds): ExamPolicy | undefined {
    const exam = this.exams.get(examId);
    if (!exam) return undefined;

    let weights = SENSITIVITY_PRESETS[profile].weights;
    let thresholds = SENSITIVITY_PRESETS[profile].thresholds;

    if (profile === 'CUSTOM' && customWeights && customThresholds) {
      weights = customWeights;
      thresholds = customThresholds;
    }

    exam.policy.sensitivityProfile = profile;
    exam.policy.agentWeights = weights;
    exam.policy.riskThresholds = thresholds;

    return exam.policy;
  }

  public submitAnswer(sessionId: string, questionId: string, answerText: string, selectedOptions?: string[]): ExamSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    session.submissions[questionId] = {
      questionId,
      answerText,
      selectedOptions,
      updatedAt: new Date().toISOString()
    };

    return session;
  }
}
