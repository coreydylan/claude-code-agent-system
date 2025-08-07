# Repo Onboarding Agent
## Universal Repository Integration for Agent System

### Overview

The `repo-onboarding-agent` is a specialized agent that can analyze ANY repository at ANY stage of development and seamlessly integrate it into our Claude Code Agent System architecture. It creates the necessary infrastructure for all other agents to work intelligently within the existing codebase.

---

## Agent Specification

**Agent ID**: `repo-onboarding-agent`  
**Position**: Pre-Phase 0 (runs before journal-interface-builder)  
**Purpose**: Universal repository analysis and agent system integration  
**Trigger**: Manual invocation on existing repositories  

### Core Capabilities

1. **Deep Repository Analysis**
   - Scans entire directory structure
   - Identifies technology stack and frameworks
   - Maps dependencies and build systems
   - Analyzes code patterns and conventions
   - Detects existing documentation standards

2. **Agent System Integration**
   - Creates agent-compatible file structure
   - Generates project manifesto based on existing patterns
   - Sets up task management system
   - Implements logging and monitoring infrastructure
   - Creates AI context documentation

3. **Compatibility Bridge**
   - Maps existing patterns to agent expectations
   - Creates translation layers for non-standard structures
   - Preserves existing workflows while adding agent capabilities
   - Ensures zero-disruption integration

---

## Integration Workflow

### Phase 1: Repository Discovery (5-10 minutes)

```yaml
Deep Scan Process:
  1. File Structure Analysis:
     - Map all directories and files
     - Identify entry points and main modules
     - Detect configuration files
     - Find documentation patterns
  
  2. Technology Stack Detection:
     - Package managers (package.json, requirements.txt, Cargo.toml, etc.)
     - Frameworks and libraries
     - Build tools and scripts
     - Testing frameworks
     - Deployment configurations
  
  3. Code Pattern Analysis:
     - Architecture patterns (MVC, microservices, monolith)
     - Naming conventions
     - Error handling patterns
     - Testing patterns
     - Documentation style
  
  4. Existing Workflows Discovery:
     - Git hooks and workflows
     - CI/CD pipelines
     - Development scripts
     - Deployment procedures
```

### Phase 2: Manifesto Generation (5 minutes)

```yaml
Manifesto Creation Process:
  1. Extract Implicit Principles:
     - Derive values from code structure
     - Identify quality standards from existing patterns
     - Map architectural decisions to maxims
  
  2. Generate Project-Specific Maxims:
     - Based on technology choices
     - Reflecting existing patterns
     - Incorporating discovered conventions
  
  3. Create Decision Framework:
     - Aligned with existing codebase philosophy
     - Respecting current team practices
     - Enabling future agent decisions
```

### Phase 3: Agent Infrastructure Setup (10-15 minutes)

```yaml
Infrastructure Creation:
  1. Core Agent Files:
     - PROJECT_MANIFESTO.md (based on analysis)
     - PROJECT_LOG.md (initialized)
     - AGENT_COMPATIBILITY_MAP.md (custom for this repo)
  
  2. Task Management System:
     - TASKS/ folder structure
     - STATUS.json with current project state
     - METRICS.json with baseline measurements
  
  3. AI Context System:
     - .claude/ folder with project-specific context
     - Existing patterns documentation
     - Agent interaction guidelines
  
  4. Monitoring Dashboard:
     - project-dashboard/ setup
     - Integration with existing monitoring if present
```

### Phase 4: Compatibility Mapping (10 minutes)

```yaml
Compatibility Bridge Creation:
  1. Pattern Translation Map:
     - Map existing patterns to agent expectations
     - Create adapter patterns for non-standard structures
     - Document integration points
  
  2. Workflow Integration:
     - Preserve existing development workflows
     - Add agent capabilities non-disruptively
     - Create hybrid manual/agent processes
  
  3. Tool Chain Integration:
     - Connect with existing build tools
     - Integrate with current testing frameworks
     - Preserve deployment procedures
```

---

## Output Files Structure

After onboarding, the repository will contain:

```
existing-repo/
├── [EXISTING FILES UNCHANGED]
├── PROJECT_MANIFESTO.md          # Generated from repo analysis
├── PROJECT_LOG.md               # Agent coordination log
├── AGENT_COMPATIBILITY_MAP.md   # Repo-specific agent guidelines
├── TASKS/                       # Task management system
│   ├── STATUS.json
│   ├── METRICS.json
│   ├── REPO_ANALYSIS.md         # Complete analysis results
│   └── INTEGRATION_TASKS/       # Next steps for agents
├── project-dashboard/           # Monitoring interface
└── .claude/                     # AI context system
    ├── project-context.md       # Repo-specific context
    ├── existing-patterns.md     # Discovered patterns
    ├── integration-guide.md     # How agents should work with this repo
    └── compatibility-notes.md   # Special considerations
```

---

## AGENT_COMPATIBILITY_MAP.md Structure

This critical file maps repository specifics to agent expectations:

```markdown
# Agent Compatibility Map
## [Repository Name] Integration Guide

### Repository Profile
- **Type**: [Frontend/Backend/Full-stack/Library/CLI/etc.]
- **Primary Language**: [Language]
- **Architecture**: [Pattern discovered]
- **Stage**: [Proof-of-concept/MVP/Production/Legacy]
- **Team Size**: [Estimated from commit patterns]

### Technology Stack
- **Frameworks**: [Discovered frameworks]
- **Database**: [If applicable]
- **Deployment**: [Current deployment method]
- **Testing**: [Testing framework and coverage]

### Existing Patterns
#### File Organization
- **Entry Points**: [src/index.js, main.py, etc.]
- **Configuration**: [Location and format]
- **Documentation**: [Existing docs pattern]
- **Testing**: [Test file locations and patterns]

#### Code Conventions
- **Naming**: [camelCase, snake_case, etc.]
- **Error Handling**: [Try/catch patterns, Result types, etc.]
- **Async Patterns**: [Promises, async/await, callbacks]
- **State Management**: [If applicable]

### Agent Integration Points
#### Build System Integration
- **Existing Build**: [npm scripts, make, cargo, etc.]
- **Agent Tasks**: [How to integrate agent tasks]
- **Quality Gates**: [Existing linting, testing]

#### Development Workflow
- **Git Workflow**: [Branch strategy, PR process]
- **Local Development**: [Setup process, dependencies]
- **Environment Management**: [.env patterns, config]

#### Testing Strategy
- **Unit Tests**: [Framework, location, patterns]
- **Integration Tests**: [If present]
- **E2E Tests**: [If present]
- **Test Commands**: [How to run tests]

### Agent-Specific Guidelines
#### task-executor Adaptations
- **Build Commands**: [Repo-specific build process]
- **Test Commands**: [How to run tests in this repo]
- **Deploy Commands**: [If applicable]

#### foundation-architect Considerations
- **Existing Architecture**: [Don't break existing patterns]
- **Extension Points**: [Where to add new functionality]
- **Refactor Opportunities**: [Safe improvement areas]

#### vertical-slice-builder Guidelines
- **Critical Path**: [Most important user flow]
- **Integration Points**: [Key system boundaries]
- **Test Strategy**: [How to verify the slice]

### Risk Mitigation
#### Preservation Requirements
- **Never Touch**: [Critical files/folders to avoid]
- **Backup First**: [Files to backup before changes]
- **Team Approval**: [Changes requiring human review]

#### Rollback Plan
- **Git Strategy**: [How to rollback agent changes]
- **Dependency Isolation**: [Keep agent changes separate]
- **Incremental Integration**: [Step-by-step adoption]

### Success Metrics
- **Integration Success**: [How to measure successful onboarding]
- **Agent Effectiveness**: [KPIs for agent performance]
- **Team Adoption**: [Metrics for human acceptance]
```

---

## Integration Examples

### Example 1: Next.js Frontend Application

```yaml
Discovered Patterns:
  - Framework: Next.js with TypeScript
  - State: Zustand for state management
  - Styling: Tailwind CSS
  - Testing: Jest + Testing Library
  - Deployment: Vercel

Generated Manifesto Maxims:
  - "Component composition over inheritance"
  - "Server-side rendering for performance"
  - "Type safety is non-negotiable"
  - "Tailwind utilities over custom CSS"

Agent Adaptations:
  - task-executor uses `npm run build` and `npm test`
  - foundation-architect respects existing component patterns
  - vertical-slice-builder creates page → component → API flow
```

### Example 2: Python FastAPI Backend

```yaml
Discovered Patterns:
  - Framework: FastAPI with Pydantic
  - Database: PostgreSQL with SQLAlchemy
  - Testing: pytest with fixtures
  - Deployment: Docker + K8s

Generated Manifesto Maxims:
  - "Pydantic models define truth"
  - "Async everywhere for performance"
  - "Database migrations are sacred"
  - "API documentation is automatic"

Agent Adaptations:
  - task-executor uses pytest and alembic commands
  - foundation-architect follows SQLAlchemy patterns
  - vertical-slice-builder creates endpoint → service → repository flow
```

---

## Agent Coordination Protocol

### Pre-Integration Requirements

Every agent must:
1. **Read AGENT_COMPATIBILITY_MAP.md FIRST**
2. **Respect existing patterns** unless explicitly overriding
3. **Use repository-specific commands** from the compatibility map
4. **Log all changes** with repository context

### Integration Handoff

```yaml
After repo-onboarding-agent completes:
  1. All files created and documented
  2. AGENT_COMPATIBILITY_MAP.md validates
  3. Basic agent infrastructure tested
  4. Handoff to journal-interface-builder
  5. Log: "Repository [name] successfully onboarded, ready for agent orchestration"
```

---

## Quality Gates

### Pre-Integration Validation
- [ ] Repository structure completely mapped
- [ ] Technology stack identified and documented
- [ ] Existing patterns catalogued
- [ ] No disruption to existing functionality
- [ ] All agent infrastructure files created
- [ ] Compatibility map validates against repository

### Post-Integration Testing
- [ ] Existing build process still works
- [ ] Tests still pass with same commands
- [ ] Git history preserved
- [ ] No broken dependencies
- [ ] Agent infrastructure operational
- [ ] First agent can successfully activate

---

## Error Handling & Recovery

### Common Integration Issues

1. **Unrecognized Technology Stack**
   - Fallback to generic patterns
   - Request human guidance
   - Document unknowns for future learning

2. **Conflicting File Structures**
   - Create minimal impact integration
   - Use hidden folders where possible
   - Document conflicts for resolution

3. **Existing Agent Infrastructure**
   - Detect and merge with existing setup
   - Upgrade outdated agent infrastructure
   - Preserve customizations where possible

### Recovery Procedures

```bash
# Complete rollback (git-based)
git stash push -m "Agent system integration rollback"
git clean -fd .claude/ project-dashboard/ TASKS/
git restore PROJECT_*.md AGENT_*.md

# Partial rollback (selective)
rm -rf .claude/ project-dashboard/ TASKS/
git restore PROJECT_MANIFESTO.md PROJECT_LOG.md

# Repair integration
claude> /agents repo-onboarding-agent --repair --analysis-cache
```

---

## Success Criteria

A successful onboarding enables:
1. **Any other agent** can activate and work effectively
2. **Existing development workflow** remains unimpacted
3. **Team adoption** requires minimal learning curve
4. **Agent coordination** works seamlessly with repository patterns
5. **Quality gates** integrate with existing CI/CD
6. **Documentation** matches team's existing standards

The repository becomes "agent-ready" while preserving all existing functionality and team practices.

---

## Implementation Notes

This agent should be implemented as a comprehensive analysis and integration system that can handle:
- Any programming language
- Any framework or architecture
- Any stage of development
- Any team size or culture
- Any existing tooling or processes

The key is **respectful integration** - we enhance the repository without disrupting it.