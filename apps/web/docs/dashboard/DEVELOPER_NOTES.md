# Developer Notes — Admin Dashboard Infrastructure

## Microservice Port Architecture

- **Auth Service**: `http://localhost:4001`
- **User Service**: `http://localhost:4002`
- **Institution Service**: `http://localhost:4003`
- **Exam Service**: `http://localhost:4004`
- **Question Service**: `http://localhost:4005`
- **Session Service**: `http://localhost:4006`
- **Submission Service**: `http://localhost:4007`

---

## Next Steps for Feature Implementation

1. Connect `Institution Service` endpoints to `/institutions`.
2. Connect `User Service` endpoints to `/users`.
3. Connect `Exam Service` endpoints to `/exams`.
4. Connect `Question Service` endpoints to `/questions` and `/question-bank`.
5. Connect `Candidate Session Service` live WebSockets / SSE to `/candidate-sessions`.
