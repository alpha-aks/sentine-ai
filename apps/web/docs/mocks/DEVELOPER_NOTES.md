# Developer Notes — Mock Data Layer

## Architecture Overview
- **Axios Interceptor**: `setupMockInterceptor()` inspects outgoing request URLs and attaches a custom resolution adapter when `NEXT_PUBLIC_USE_MOCK_DATA=true`.
- **Zero UI Changes**: Component logic remains identical whether running against mock datasets or live backend microservices.
- **Latency Simulation**: All mock responses simulate a 150ms network roundtrip delay.
