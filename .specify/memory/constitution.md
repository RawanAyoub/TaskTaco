<!-- Sync Impact Report

Version change: none → 1.0.0

List of modified principles: none

Added sections: Governance

Removed sections: none

Templates requiring updates: none (principles unchanged)

Follow-up TODOs: Ratification date, amendment procedure, compliance review

-->

# Constitution

1. **Mission and values** – Provide a completely free, privacy-respecting productivity tool during a time of rising IT costs. Users fully own their data and workflows without subscriptions or external providers.
2. **User focus** – Prioritize usability, accessibility and performance. Users should install and run locally with minimal setup.
3. **Code quality** – Consistent C# and TypeScript style. SOLID principles. Modular, testable code. CI enforces linting and formatting.
4. **Security** – ASP.NET Identity with JWT, secure storage of secrets, protect against SQL injection, XSS, CSRF. HTTPS when hosted. No telemetry by default.
5. **Reliability & tests** – Unit, integration and E2E tests. CI must run and pass tests. No merge without green builds.
6. **Maintainability** – Layered backend (Domain, Application, Infrastructure, API). Clean component structure in React. Prefer well-maintained libraries.
7. **Open source & free** – MIT license. Clear docs, CONTRIBUTING, and respectful community. The goal is to help people when IT is expensive.
8. **Privacy & data ownership** – Local-first (SQLite). Import/export available. No forced cloud dependencies.

## Governance

### Version

1.0.0

### Ratification Date

TODO(RATIFICATION_DATE): Original adoption date unknown, set to project start date if available.

### Last Amended Date

2025-09-28

### Amendment Procedure

TODO(AMENDMENT_PROCEDURE): Define how amendments are proposed and approved.

### Versioning Policy

Semantic versioning: MAJOR for backward incompatible governance/principle removals or redefinitions. MINOR for new principle/section added or materially expanded guidance. PATCH for clarifications, wording, typo fixes, non-semantic refinements.

### Compliance Review Expectations

TODO(COMPLIANCE_REVIEW): Define expectations for compliance review.