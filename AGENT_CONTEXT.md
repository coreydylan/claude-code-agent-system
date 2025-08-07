# Agent Context & Operating Environment

*This file provides all agents with essential context about their operating environment and capabilities*

## 🌟 Claude Code Environment

You are operating within **Claude Code's native environment** with the following capabilities:

### **Authentication & Access**
- ✅ **Authenticated Session**: You have access through the user's existing Claude Code CLI authentication
- ✅ **Project Access**: Full read/write access to the current project directory and all files
- ✅ **Tool Ecosystem**: Complete access to Claude Code's tool suite (file operations, command execution, web access)
- ✅ **Session Persistence**: Context and conversation history maintained across interactions

### **File System Access**
```
Project Root/
├── .claude/
│   └── agents/              # You and other agents live here
├── AGENT_REGISTRY.md        # Master list of all agents and capabilities  
├── PROJECT_MANIFESTO.md     # Project vision and technical context
├── PROJECT_LOG.md           # Inter-agent communication log
├── ROADMAP.md              # Product roadmap and priorities
├── TASKS/                  # Structured task management
├── QUEUES/                 # Task queue system
├── [project files...]     # Full access to all project code and documentation
```

### **Agent Coordination Files**

#### **AGENT_REGISTRY.md** 
- Complete list of all 17 available agents
- Each agent's specialization and capabilities  
- Coordination patterns and workflows
- Usage examples for requesting other agents

#### **PROJECT_LOG.md**
- Inter-agent communication hub
- Log all significant actions and decisions here
- Check this file first to understand recent activity
- Use for coordinating with other agents

#### **PROJECT_MANIFESTO.md** 
- Project vision, goals, and technical requirements
- Architecture decisions and constraints
- Coding standards and conventions
- Business context and user requirements

#### **QUEUES/ folder**
- urgent.json - Critical issues (2hr SLA)
- feature-dev.json - New features (5-day SLA) 
- maintenance.json - Bug fixes (2-day SLA)
- research.json - Investigation work (1-week SLA)
- admin.json - Administrative tasks (1-day SLA)

## 🎯 Your Role & Capabilities

### **Agent Identity System**
Each agent has a specific identity defined in `/claude/agents/[agent-name].md`:
- **Purpose**: Your primary function and specialization
- **Tools**: All Claude Code tools plus project-specific context
- **Context**: Access to all coordination files and project history
- **Integration**: How you work with other agents

### **Inter-Agent Communication**
When you need to work with other agents:

```bash
# Request another agent
"I need the architecture-designer agent to review this implementation plan"

# Coordinate with multiple agents  
"Have the security-auditor agent review this, then the test-guardian agent add tests"

# Check what other agents are doing
"What has the task-executor agent been working on recently?"
```

### **Context Awareness**
Before starting any task:
1. **Read PROJECT_LOG.md** - Understand recent agent activity
2. **Check AGENT_REGISTRY.md** - Know what other agents can help
3. **Review relevant QUEUES/** - Understand current priorities  
4. **Update PROJECT_LOG.md** - Log your actions for other agents

## 🔄 Workflow Integration

### **Task Processing Flow**
1. **Receive Request** - Via Claude Code conversation or queue assignment
2. **Gather Context** - Read coordination files and project state
3. **Plan Approach** - Consider which other agents might be needed
4. **Execute Work** - Use all available tools to complete the task
5. **Coordinate** - Update PROJECT_LOG.md and notify relevant agents
6. **Quality Gates** - Ensure work meets project standards

### **Agent Collaboration Patterns**

#### **Sequential Workflows**
```
vision-challenger → architecture-designer → task-executor → test-guardian
```

#### **Parallel Processing**  
```
Multiple agents work simultaneously:
- ui-specialist (frontend)
- api-builder (backend)  
- database-architect (data layer)
```

#### **Review Cycles**
```
All development work reviewed by:
- security-auditor (security)
- performance-optimizer (performance) 
- test-guardian (quality)
```

#### **Escalation Paths**
```
Issues escalate through:
queue-manager → task-orchestrator → admin-dashboard-agent → stakeholder-interface
```

## 🎪 User Interaction Guidelines

### **How Users Request Your Services**
Users can invoke agents in several ways:

```bash
# Direct agent request
"Use the [agent-name] agent to [specific task]"

# Natural language request  
"I need help with authentication" 
# → System routes to appropriate agent(s)

# Queue-based request
"Add this feature request to the queue"
# → feature-intake-agent processes and routes
```

### **Guiding Users to Agent Features**

#### **For New Users**
- Explain available agents: "I can connect you with our specialized agents"
- Show coordination files: "Check AGENT_REGISTRY.md to see all available agents"
- Demonstrate workflows: "Let me walk you through our feature development process"

#### **For Feature Requests**
- Route to feature-intake-agent: "Let me have our feature-intake-agent process this request"
- Show queue status: "Check the current queue status with our queue-manager agent"
- Update roadmap: "I'll have the roadmap-manager agent update priorities"

#### **For Code Issues**
- Security concerns → security-auditor agent
- Performance issues → performance-optimizer agent  
- Testing needs → test-guardian agent
- Architecture questions → architecture-designer agent

#### **For Project Management**
- Status updates → admin-dashboard-agent
- Stakeholder communications → stakeholder-interface agent
- Timeline questions → roadmap-manager agent
- Task prioritization → queue-manager agent

## 🛠️ Technical Context

### **Technology Stack Awareness**
Check these files for project-specific context:
- `package.json` - Dependencies and scripts
- `docker-compose.yml` - Infrastructure setup
- `.env` files - Environment configuration  
- `README.md` - Project documentation
- `tsconfig.json` / language configs - Development settings

### **Quality Standards**
All work should meet:
- **Security**: Follow OWASP guidelines, no exposed secrets
- **Testing**: Comprehensive test coverage  
- **Performance**: Optimized for production use
- **Documentation**: Clear, maintainable code
- **Consistency**: Follow existing project patterns

### **Integration Points**
- **Docker**: Full containerized development environment
- **Supabase**: Database and authentication services
- **Vercel**: Deployment and hosting
- **Monitoring**: Health checks and performance tracking
- **CI/CD**: Automated testing and deployment

## 📊 Success Metrics

Track your effectiveness through:
- **Task Completion**: Successfully completing assigned tasks
- **Quality Gates**: Passing security, performance, and test reviews
- **Coordination**: Effective collaboration with other agents
- **User Satisfaction**: Helping users achieve their goals
- **System Health**: Contributing to overall project success

## 🚀 Getting Started

When you first engage with a project:

1. **Assess Context** - Read all coordination files
2. **Understand Scope** - Clarify the user's request  
3. **Plan Approach** - Determine which other agents you might need
4. **Communicate Intent** - Log your plan in PROJECT_LOG.md
5. **Execute Skillfully** - Use all available tools and context
6. **Coordinate Results** - Update logs and notify relevant agents
7. **Guide Users** - Help them understand next steps and available agents

## 🎯 Special Instructions

### **For Existing Codebase Projects**
- Use codebase-auditor agent first for comprehensive analysis
- Identify technical debt and security issues
- Document current architecture before making changes
- Plan improvements through roadmap-manager agent

### **For New Projects**  
- Start with vision-challenger agent to clarify requirements
- Use architecture-designer agent for technical planning
- Set up proper development workflows early
- Establish quality gates and monitoring

### **For Ongoing Development**
- Monitor queue health regularly
- Coordinate with stakeholder-interface for communications
- Keep roadmap updated with real progress
- Maintain high quality standards across all work

---

*Remember: You are part of a sophisticated agent ecosystem. Your individual excellence contributes to the overall success of the development pipeline. Always consider how your work enables other agents and serves the user's broader goals.*