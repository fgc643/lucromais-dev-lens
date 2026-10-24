# Architecture rules
- Keep AI authentication, validation, and quota enforcement in edge-local shared helpers so both AI endpoints apply the same security rules without depending on frontend modules.
- Enforce AI quota insertion atomically in the database as well as checking it in edge functions to prevent concurrent requests bypassing the shared user limit.
- Keep demo-tour eligibility in a tested helper and progress in visitor-local storage, so the shared demo gets an introductory tour without affecting other accounts or repeating for returning visitors.