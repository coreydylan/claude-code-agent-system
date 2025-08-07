# PROJECT LOG

## Master Coordination File for All Agents

This is the central nervous system of the agent ecosystem. Every agent MUST read this file first and log all significant actions.

---

## Project Identity

- **Name**: [Project Name]
- **Status**: Planning | Building | Testing | Deploying
- **Current Sprint**: Sprint 1 | Sprint 2 | Production
- **Started**: [Timestamp]
- **Last Updated**: [Timestamp]

---

## Core Decisions Log

### Architecture Decisions

```yaml
timestamp: null
agent: null
decision: null
rationale: null
impact: []
```

### Stack Decisions

```yaml
timestamp: null
agent: null
technologies: {}
versions: {}
rationale: null
documentation_path: null
```

### Design Decisions

```yaml
timestamp: null
agent: null
patterns: []
rationale: null
files_affected: []
```

---

## Agent Activity Log

<!-- AGENTS: Append your entries below. DO NOT modify existing entries. -->

### Entry Template

```yaml
timestamp: 2025-08-07T10:00:00Z
agent: agent-name
action: read | decision | output | blocked | handoff | error | needs-review
status: active | stuck | looping | error | needs-review | complete
sprint: Sprint 1
details: |
  Verbose description of what happened, why, and what was created/modified.
  Include all context necessary for the next agent to understand.
files_created:
  - path/to/file.md
files_modified:
  - path/to/other.md
dependencies:
  - Required input from X
  - Waiting for Y to complete
next_agent: next-agent-name
error_details:
  type: timeout | loop | conflict | missing-dep | api-failure | unknown
  attempts: 1
  last_error: "Error message"
  suggested_fix: "Potential solution"
context:
  key: value
  decisions_made:
    - Decision 1
    - Decision 2
  open_questions:
    - Question 1
```

---

## Active Conflicts & Blocks

### Conflict Template

```yaml
timestamp: null
agents_involved: []
conflict: null
resolution_needed: null
priority: high | medium | low
```

---

## File Ownership Map

Track which agent created/owns which files to prevent conflicts:

```yaml
PROJECT_PRD.md:
  owner: prd-generator
  created: timestamp
  last_modified: timestamp

PROJECT_ARCHITECTURE.md:
  owner: architecture-designer
  created: timestamp
  last_modified: timestamp

PROJECT_STACK.md:
  owner: stack-analyzer
  created: timestamp
  last_modified: timestamp

docs/:
  owner: docs-fetcher
  created: timestamp
  purpose: Local documentation cache

PROJECT_SERVICES.md:
  owner: service-analyzer
  created: timestamp
  purpose: External service recommendations

lib/stripe/:
  owner: stripe-deployer
  created: timestamp
  purpose: Stripe integration

middleware.ts:
  owner: clerk-deployer
  created: timestamp
  purpose: Auth middleware

TASKS/:
  owner: task-folder-generator
  created: timestamp
  structure_locked: true # Other agents should not modify structure
```

---

## Sprint Progress

### Sprint 1: Planning & Foundation

- [ ] vision-challenger: Concept refined
- [ ] prd-generator: PRD created
- [ ] architecture-designer: Architecture documented
- [ ] stack-analyzer: Stack verified
- [ ] docs-fetcher: Documentation cached
- [ ] service-analyzer: External services identified
- [ ] stripe-deployer: Stripe configured (if needed)
- [ ] clerk-deployer: Auth deployed (if needed)
- [ ] database-deployer: Database provisioned
- [ ] email-deployer: Email service ready (if needed)
- [ ] monitoring-deployer: Monitoring active
- [ ] implementation-planner: Timeline created
- [ ] foundation-architect: Foundation designed
- [ ] build-sequencer: Build order established
- [ ] task-spec-builder: Tasks specified
- [ ] task-folder-generator: Task system created
- [ ] ai-context-builder: AI context prepared
- [ ] design-system-creator: Design system defined
- [ ] journal-keeper: Journey documented

### Sprint 2: Execution & Delivery

- [ ] task-executor: Phase 0 complete
- [ ] task-executor: Phase 1 complete
- [ ] vertical-slice-builder: Critical path verified
- [ ] test-guardian: All tests green
- [ ] admin-console-builder: Admin UI complete
- [ ] setup-wizard-creator: Setup flow complete
- [ ] devops-automator: Deployment ready

### Continuous: Error Management

- [ ] error-manager: Monitoring for stuck/errored agents

---

## Critical Context

### Project Constraints

- Budget: $X/month
- Timeline: Y sprints
- Team size: Z developers
- Key requirements: []

### Technical Constraints

- Must use: []
- Cannot use: []
- Performance targets: []
- Security requirements: []

### Business Context

- Target users: []
- Success metrics: []
- Launch date: []
- Stakeholders: []

---

## Agent Coordination Rules

1. **Sequential Dependencies**: Some agents MUST wait for others
   - prd-generator waits for vision-challenger
   - docs-fetcher waits for stack-analyzer
   - task-executor waits for task-folder-generator

2. **Parallel Opportunities**: These can run simultaneously
   - design-system-creator & ai-context-builder
   - Multiple task-executor instances (different phases)
   - journal-keeper (runs continuously)

3. **Conflict Resolution**
   - If two agents modify same file: Last agent must merge changes
   - If decision conflict: Escalate to human
   - If blocked: Log and move to next available task

4. **Communication Protocol**
   - Always log before starting work
   - Always log after completing work
   - Be verbose about decisions and rationale
   - Include enough context for any agent to understand

5. **Error Handling Protocol**
   - If stuck > 5 min: Set status 'needs-review'
   - If looping > 3 attempts: Set status 'error'
   - If API fails 3x: Set status 'error'
   - Always provide full error context
   - error-manager will auto-trigger on errors

---

## Notes for Humans

### Review Points

- After Sprint 1 planning completes
- After vertical slice is built
- Before production deployment

### Common Issues

- Agents not reading log first → Duplicate work
- Insufficient logging → Lost context
- Skipping dependencies → Build failures

### Recovery Procedures

- If agent fails: Check last log entry
- If conflict: Review ownership map
- If blocked: Check dependencies section

---

<!-- DO NOT DELETE OR MODIFY ABOVE STRUCTURE -->
<!-- AGENTS: Only append entries to the Activity Log section -->
