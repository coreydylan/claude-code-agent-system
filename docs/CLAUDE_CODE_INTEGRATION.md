# Claude Code Integration Guide

The Claude Developer OS now **fully integrates with Claude Code's native authentication and agent system**. No API keys or separate authentication required!

## 🚀 How It Works

### 1. **Uses Your Existing Claude Code Login**
- Leverages your existing `claude` CLI authentication
- No additional API keys needed
- Works with Claude Pro, Team, or Enterprise accounts

### 2. **Creates Native Claude Code Subagents**
- Places agents in `.claude/agents/` directory
- Integrates with `/agents` command in Claude Code
- Agents are automatically available across all Claude Code sessions

### 3. **Seamless Developer Experience**
```bash
# Start the orchestrated environment
claude-dev

# This automatically:
# ✅ Starts infrastructure (Docker, Supabase, etc.)
# ✅ Creates 10+ specialized subagents in .claude/agents/
# ✅ Sets up task management system
# ✅ Provides guided agent usage

# Then use Claude Code normally:
claude --interactive
# Use '/agents' to see all available agents
# Request agents: "Use the task-executor agent to implement auth"
```

## 🤖 Available Agents (17 Total)

The system creates these specialized subagents organized in 6 categories:

### **Phase 1: Core Development Agents**
- **`task-executor`** - Executes tasks from TASKS/ folder with full context
- **`vision-challenger`** - Challenges and refines product vision/requirements  
- **`architecture-designer`** - Designs system architecture and technical solutions
- **`test-guardian`** - Ensures comprehensive testing coverage

### **Phase 2: Infrastructure Specialists**
- **`database-architect`** - Handles database design, migrations, schema management
- **`api-builder`** - Builds and maintains REST/GraphQL APIs with documentation
- **`ui-specialist`** - Creates and maintains user interfaces with responsive design
- **`deployment-manager`** - Handles CI/CD, deployments, and infrastructure management
- **`security-auditor`** - Performs security reviews and implements best practices
- **`performance-optimizer`** - Optimizes application performance and identifies bottlenecks

### **Phase 3: Product Management & Orchestration**
- **`feature-intake-agent`** - Receives and processes feature requests with validation
- **`roadmap-manager`** - Maintains product roadmap, prioritizes features, manages releases
- **`task-orchestrator`** - Orchestrates task queues and assigns work to available agents
- **`queue-manager`** - Manages multiple task queues with SLA monitoring and load balancing

### **Phase 4: Administration & Oversight**
- **`admin-dashboard-agent`** - Provides administrative visibility and system health monitoring
- **`stakeholder-interface`** - Handles external stakeholder communications and expectations

### **Phase 5: Onboarding & Analysis**
- **`codebase-auditor`** - Comprehensive audit of existing codebases during onboarding

## 💡 Usage Examples

### **Basic Agent Usage**
```bash
# Start Claude Code with agents ready
claude --interactive

# In Claude Code session:
/agents  # See all available agents

# Request specific agents:
"Use the task-executor agent to implement the user authentication feature"
"Have the security-auditor agent review this code for vulnerabilities"  
"Ask the performance-optimizer agent to identify bottlenecks in this function"
```

### **Task-Based Development**
```bash
# The system creates a TASKS/ folder with structured development tasks
# Agents can work directly with these tasks:

"Use the task-executor agent to process the next task in the TASKS/ folder"
"Have the test-guardian agent create tests for the recently completed tasks"
```

### **Agent Coordination**
```bash
# Agents coordinate through PROJECT_LOG.md:

"Use the vision-challenger agent to analyze the requirements, then have the architecture-designer agent create an implementation plan"
```

## 🔧 Advanced Integration

### **Manual Agent Creation**
```bash
# Create agents manually if needed
task agents:create-agents

# Or run the script directly:
bash scripts/create-claude-agents.sh
```

### **Agent Status and Health**
```bash
# Check agent system status
task agents:status

# Launch interactive Claude Code with agents
task agents:interactive
```

### **Custom Agent Sequences**
```bash
# Run predefined agent sequences
task agents:sequence -- development-flow
```

## 📁 File Structure

After running `claude-dev`, your project will have:

```
your-project/
├── .claude/
│   └── agents/              # Claude Code subagents (17 total)
│       ├── task-executor.md
│       ├── codebase-auditor.md
│       ├── feature-intake-agent.md
│       └── [all 17 agents...]
├── AGENT_REGISTRY.md        # Master agent list and capabilities
├── AGENT_CONTEXT.md         # Agent operating environment guide
├── PROJECT_LOG.md           # Inter-agent communication hub
├── PROJECT_MANIFESTO.md     # Project context for agents
├── ROADMAP.md              # Product roadmap and priorities
├── FEATURE_INTAKE.md       # Feature request system
├── ADMIN_DASHBOARD.md      # Administrative oversight
├── TASKS/                  # Structured task management
├── QUEUES/                 # Multi-queue task system
│   ├── urgent.json         # Critical issues (2hr SLA)
│   ├── feature-dev.json    # Features (5-day SLA)
│   ├── maintenance.json    # Bug fixes (2-day SLA)
│   ├── research.json       # Analysis (1-week SLA)
│   └── admin.json          # Admin tasks (1-day SLA)
└── docker-compose.dev.yml  # Infrastructure
```

## 🎯 Benefits

### **For Individual Developers**
- **Zero Setup** - Uses existing Claude Code auth
- **Specialized Help** - Agents for specific development tasks
- **Context Aware** - Agents understand your project structure
- **Infrastructure Ready** - Full dev environment + agents

### **For Teams**
- **Consistent Patterns** - All team members get same agents
- **Project Context** - Agents understand team conventions
- **Task Coordination** - Structured task management
- **Knowledge Sharing** - Agents learn from project history

### **For Organizations**
- **No API Management** - Uses existing Claude Code licenses
- **Security Compliant** - Works within existing auth boundaries
- **Scalable** - Agents adapt to any project size
- **Integration Ready** - Works with existing tools and workflows

## 🚨 Important Notes

### **Authentication**
- ✅ Uses existing Claude Code CLI authentication
- ✅ No API keys needed
- ✅ Respects your Claude subscription limits
- ✅ Works with Pro, Team, and Enterprise accounts

### **Privacy**
- ✅ Agents run locally through Claude Code CLI
- ✅ Project data stays within Claude Code's privacy boundaries
- ✅ No additional data sharing or storage

### **Performance**  
- ✅ Agents are lightweight Markdown files
- ✅ No additional background services
- ✅ Uses standard Claude Code performance characteristics

## 🛠️ Troubleshooting

### **"Claude Code CLI not found"**
```bash
# Install Claude Code CLI
curl -fsSL https://claude.ai/install.sh | sh

# Or visit: https://claude.ai/download
```

### **"Agents not showing up"**
```bash
# Recreate agents
task agents:create-agents

# Or check the directory:
ls -la .claude/agents/
```

### **"Agent not working as expected"**
```bash
# Check agent definitions
cat .claude/agents/task-executor.md

# Recreate if needed
rm -rf .claude/agents/
task agents:create-agents
```

## 🎉 Getting Started

1. **Install Claude Code** (if not already installed):
   ```bash
   curl -fsSL https://claude.ai/install.sh | sh
   ```

2. **Start the Developer OS**:
   ```bash
   claude-dev
   ```

3. **Launch Claude Code with agents**:
   ```bash
   claude --interactive
   ```

4. **Use agents**:
   ```
   /agents
   "Use the task-executor agent to implement user profiles"
   ```

That's it! You now have a fully orchestrated development environment with specialized AI agents, all using your existing Claude Code authentication.