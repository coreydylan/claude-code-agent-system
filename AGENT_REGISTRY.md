# Master Agent Registry

*This file is the single source of truth for all agents in the Claude Developer OS system*

## 🎯 System Overview

The Claude Developer OS contains **0 specialized agents** organized into **6 categories**, all operating within Claude Code's native environment using existing authentication.

## 📚 Agent Categories & Hierarchy

### **Phase 1: Core Development Agents** 
*Primary implementation and development tasks*

#### `task-executor`
- **Purpose**: Executes development tasks from TASKS/ folder with full project context
- **Specialization**: Implementation, testing, integration, maintaining project consistency
- **Context Access**: PROJECT_MANIFESTO.md, TASKS/ folder, full codebase
- **Coordination**: Works with architecture-designer for complex features
- **Usage**: `"Use task-executor agent to implement user authentication"`

#### `architecture-designer` 
- **Purpose**: Designs system architecture and technical solutions
- **Specialization**: System design, implementation planning, scalability
- **Context Access**: Full codebase, technology stack, performance requirements
- **Coordination**: Feeds designs to task-executor, consults with database-architect
- **Usage**: `"Use architecture-designer agent to plan the messaging system"`

#### `test-guardian`
- **Purpose**: Ensures comprehensive testing coverage and quality gates
- **Specialization**: Unit tests, integration tests, e2e tests, test strategy
- **Context Access**: Test suites, code coverage, quality metrics
- **Coordination**: Validates work from all development agents
- **Usage**: `"Use test-guardian agent to add tests for the payment flow"`

#### `vision-challenger`
- **Purpose**: Challenges and refines product vision and requirements  
- **Specialization**: Requirements analysis, gap identification, technical feasibility
- **Context Access**: PRDs, business requirements, stakeholder feedback
- **Coordination**: Works with roadmap-manager and stakeholder-interface
- **Usage**: `"Use vision-challenger agent to analyze this feature request"`

### **Phase 2: Infrastructure Specialists**
*Specialized technical implementation*

#### `database-architect`
- **Purpose**: Database design, migrations, schema management, query optimization
- **Specialization**: Data modeling, performance tuning, migrations, integrity
- **Context Access**: Database schemas, migration history, performance metrics
- **Coordination**: Supports all development agents with data layer needs
- **Usage**: `"Use database-architect agent to design the user profile schema"`

#### `api-builder`
- **Purpose**: Builds and maintains REST/GraphQL APIs with proper documentation
- **Specialization**: API design, documentation, error handling, versioning
- **Context Access**: API specifications, endpoint documentation, client requirements
- **Coordination**: Works with ui-specialist and database-architect
- **Usage**: `"Use api-builder agent to create the notification endpoints"`

#### `ui-specialist`
- **Purpose**: Creates and maintains user interfaces with responsive design
- **Specialization**: Frontend development, responsive design, accessibility, UX
- **Context Access**: Design systems, component libraries, user feedback
- **Coordination**: Consumes APIs from api-builder, works with test-guardian
- **Usage**: `"Use ui-specialist agent to build the user dashboard"`

#### `deployment-manager`
- **Purpose**: Handles CI/CD, deployments, and infrastructure management
- **Specialization**: DevOps, CI/CD pipelines, infrastructure as code, monitoring
- **Context Access**: Deployment configs, infrastructure templates, monitoring data
- **Coordination**: Deploys work from all development agents
- **Usage**: `"Use deployment-manager agent to set up staging environment"`

#### `security-auditor`
- **Purpose**: Performs security reviews and implements security best practices
- **Specialization**: Security analysis, vulnerability scanning, compliance, best practices
- **Context Access**: Security policies, audit logs, vulnerability databases
- **Coordination**: Reviews work from all agents for security compliance
- **Usage**: `"Use security-auditor agent to review the authentication system"`

#### `performance-optimizer`
- **Purpose**: Optimizes application performance and identifies bottlenecks
- **Specialization**: Performance analysis, optimization, scalability, monitoring
- **Context Access**: Performance metrics, profiling data, load testing results
- **Coordination**: Optimizes work from development and infrastructure agents
- **Usage**: `"Use performance-optimizer agent to speed up the search feature"`

### **Phase 3: Product Management & Orchestration**
*Business and process management*

#### `feature-intake-agent`
- **Purpose**: Receives and processes feature requests from all sources
- **Specialization**: Request validation, effort estimation, queue routing
- **Context Access**: FEATURE_INTAKE.md, QUEUES/, business requirements
- **Coordination**: Routes work to appropriate agents via queue-manager
- **Usage**: `"Use feature-intake-agent to submit a new feature request"`

#### `roadmap-manager`
- **Purpose**: Maintains product roadmap, prioritizes features, manages releases
- **Specialization**: Product planning, prioritization, stakeholder coordination
- **Context Access**: ROADMAP.md, business objectives, stakeholder feedback
- **Coordination**: Works with stakeholder-interface and queue-manager
- **Usage**: `"Use roadmap-manager agent to update the Q2 priorities"`

#### `queue-manager`
- **Purpose**: Manages task queues, assigns work, monitors SLAs
- **Specialization**: Workload distribution, SLA monitoring, resource optimization
- **Context Access**: QUEUES/ folder, agent availability, performance metrics
- **Coordination**: Distributes work to all specialized agents
- **Usage**: `"Use queue-manager agent to rebalance the current workload"`

#### `task-orchestrator`
- **Purpose**: Orchestrates complex multi-agent workflows and dependencies
- **Specialization**: Workflow coordination, dependency management, progress tracking
- **Context Access**: All agent activities, task dependencies, progress state
- **Coordination**: Coordinates sequences across all agent categories
- **Usage**: `"Use task-orchestrator agent to coordinate the user auth implementation"`

### **Phase 4: Administration & Oversight**
*System management and stakeholder interface*

#### `admin-dashboard-agent`
- **Purpose**: Provides administrative visibility and system health monitoring
- **Specialization**: Metrics collection, reporting, alert management
- **Context Access**: ADMIN_DASHBOARD.md, all system metrics, agent status
- **Coordination**: Monitors and reports on all agent activities
- **Usage**: `"Use admin-dashboard-agent to generate the weekly status report"`

#### `stakeholder-interface`
- **Purpose**: Handles external stakeholder communications and expectations
- **Specialization**: Communication, status updates, feedback collection, expectations
- **Context Access**: Stakeholder preferences, communication history, project status
- **Coordination**: Represents all agent work to external stakeholders
- **Usage**: `"Use stakeholder-interface agent to update the client on progress"`

### **Phase 5: Onboarding & Analysis** 
*Initial setup and codebase integration*

#### `codebase-auditor` 
- **Purpose**: Comprehensive audit of existing codebases during onboarding
- **Specialization**: Code quality analysis, security review, architecture assessment
- **Context Access**: Full codebase, git history, dependencies, documentation
- **Coordination**: Provides baseline analysis for all other agents
- **Usage**: `"Use codebase-auditor agent to analyze this existing project"`

## 🔄 Agent Coordination Patterns

### **Master Context Files**
All agents have access to these shared context files:

1. **`AGENT_REGISTRY.md`** - This file (master agent list and capabilities)
2. **`PROJECT_MANIFESTO.md`** - Project vision, goals, and technical context
3. **`PROJECT_LOG.md`** - Inter-agent communication and coordination log
4. **`AGENT_CONTEXT.md`** - Current project state and agent-specific context
5. **`ROADMAP.md`** - Product roadmap and priorities
6. **`QUEUES/`** - Task queues and workflow state

### **Coordination Protocols**
- **Sequential Workflows**: vision-challenger → architecture-designer → task-executor → test-guardian
- **Parallel Processing**: Multiple agents can work simultaneously on different aspects
- **Escalation Paths**: queue-manager → task-orchestrator → admin-dashboard-agent
- **Review Cycles**: security-auditor and performance-optimizer review all major changes

### **Context Propagation**
When any agent is invoked, they automatically receive:
- Current project state from PROJECT_LOG.md
- Relevant task context from TASKS/ folder  
- Agent registry and capabilities from this file
- Project-specific guidelines from AGENT_COMPATIBILITY_MAP.md

## 🎯 Usage Patterns

### **For New Features**
```
1. feature-intake-agent (validate request)
2. roadmap-manager (prioritize and plan)
3. vision-challenger (refine requirements)  
4. architecture-designer (design solution)
5. task-executor (implement)
6. test-guardian (validate quality)
7. deployment-manager (deploy)
```

### **For Existing Codebase Onboarding**
```
1. codebase-auditor (comprehensive analysis)
2. security-auditor (security review)
3. performance-optimizer (performance baseline)
4. architecture-designer (document current architecture)
5. roadmap-manager (plan improvements)
```

### **For Bug Fixes**  
```
1. feature-intake-agent (triage)
2. queue-manager (route to urgent queue)
3. task-executor (investigate and fix)
4. test-guardian (prevent regression)
5. security-auditor (security impact review)
```

## 🚀 Claude Code Integration

All agents operate within Claude Code's environment using:
- **Native Authentication**: Uses existing `claude` CLI session
- **Project Context**: Automatic access to codebase and documentation
- **Tool Integration**: Full access to Claude Code's tool ecosystem
- **Session Persistence**: Context maintained across agent interactions

### **Agent Invocation Patterns**
```bash
# Direct agent request
"Use the task-executor agent to implement user profiles"

# Multi-agent workflow
"Use the feature-intake-agent to process this request, then have the appropriate agents implement it"

# Specific context
"Use the codebase-auditor agent to analyze the security of our authentication system"
```

## 📊 System Health

The agent system maintains health through:
- **Load Balancing**: queue-manager distributes work optimally
- **SLA Monitoring**: All queues have defined SLAs with escalation
- **Quality Gates**: security-auditor and test-guardian prevent issues
- **Progress Tracking**: task-orchestrator monitors complex workflows
- **Stakeholder Communication**: stakeholder-interface manages expectations

---

*This registry is automatically updated when new agents are added or capabilities change. All agents reference this file for coordination and capability awareness.*