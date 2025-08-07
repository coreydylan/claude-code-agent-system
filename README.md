# 🚀 Claude Developer OS

**Auto-orchestrated development environment with AI agents + infrastructure automation**

Transform any repository into a fully managed development ecosystem with one command.

## ✨ What This Is

🏗️ **Complete Infrastructure Automation**
- Docker Compose orchestration
- Supabase local + cloud sync  
- Vercel deployment automation
- Environment synchronization

🤖 **30+ AI Agents**
- Specialized development agents
- Intelligent task orchestration
- Context-aware suggestions
- Autonomous error recovery

🌐 **Universal Compatibility**
- Works with any tech stack
- Auto-detects project structure
- Zero configuration required
- Progressive enhancement

## 🚀 Quick Start

### Install
```bash
npm install -g claude-code-agent-system
```

### Use in any project
```bash
cd your-project
claude-dev
```

That's it! Your complete development environment is now running.

## 💻 Usage

### Main Commands
```bash
claude-dev              # Start development environment
claude-dev status       # Check system health  
claude-dev deploy       # Deploy to production
claude-dev sync         # Sync all environments
claude-dev clean        # Clean environment
```

### What It Does
1. **Analyzes** your project (Next.js, Python, Go, etc.)
2. **Starts** Docker Compose services
3. **Syncs** environments (local ↔ Vercel ↔ Supabase)
4. **Monitors** health and auto-recovers
5. **Prepares** AI agent system
6. **Provides** unified monitoring dashboard

### Example Output
```
╭─── Development Environment Ready ───╮
│ ✅ Infrastructure: Started          │
│ ✅ Environment: Synchronized        │  
│ ✅ Health Check: Completed          │
│ ✅ Agent System: Ready              │
╰──────────────────────────────────────╯

🌐 Local URLs:
   • App: http://localhost:3000
   • Database Studio: http://localhost:54323
   • Monitoring: http://localhost:3001

💡 Ready to code!
```

## 🔧 Requirements

**Minimum:**
- Node.js 18+
- Docker (for containers)

**Optional (for full features):**
- [Task](https://taskfile.dev) - `brew install go-task/tap/go-task`
- [Vercel CLI](https://vercel.com/cli) - `npm i -g vercel`
- [Supabase CLI](https://supabase.com/docs/guides/cli) - `npm i -g supabase`
- [Claude Code CLI](https://claude.ai/code) - For AI agents

## 🏗️ Supported Stacks

**Frameworks:**
- Next.js, React, Vue, Svelte
- Express, NestJS, Fastify
- Django, Flask, FastAPI
- Go, Rust, any language

**Databases:**
- Supabase (PostgreSQL)
- Prisma
- MongoDB
- Any Docker-compatible DB

**Deployment:**
- Vercel
- Docker
- Any containerized deployment

## 🤖 AI Agent System

The system includes 30+ specialized AI agents organized in development phases:

### **Phase -1: Universal Integration**
- `repo-onboarding-agent` - Analyzes ANY repository and makes it compatible

### **Phase 0: Infrastructure**  
- `journal-interface-builder` - Creates human-readable dashboard

### **Phase 1: Vision & Planning**
- `vision-challenger` - Stress-tests concepts
- `manifesto-generator` - Creates project philosophy
- `prd-generator` - Builds specifications
- `architecture-designer` - Designs technical systems

### **Phase 2: Implementation Planning**
- `stack-analyzer` - Recommends optimal tech stack
- `docs-fetcher` - Gathers latest documentation
- `implementation-planner` - Creates detailed plans
- `foundation-architect` - Designs core architecture

### **Phase 3: Task Management**
- `build-sequencer` - Orders development tasks
- `task-spec-builder` - Creates detailed specifications
- `task-manager` - Manages task lifecycle
- `task-folder-generator` - Organizes work structure

### **Phase 4: Development Context**
- `design-system-creator` - Builds UI component systems
- `ai-context-builder` - Prepares AI assistance context
- `journal-keeper` - Documents development journey

### **Phase 5: Execution**
- `task-executor` - Executes implementation tasks
- `vertical-slice-builder` - Builds critical user paths
- `test-guardian` - Ensures quality standards
- `folder-documenter` - Auto-generates documentation

### **Phase 6: System Integration**
- `admin-console-builder` - Creates management interfaces
- `setup-wizard-creator` - Builds user onboarding
- `devops-automator` - Sets up CI/CD pipelines

### **Phase 7: Service Integration**
- `service-analyzer` - Determines needed services
- `stripe-deployer` - Payment processing setup
- `clerk-deployer` - Authentication integration
- `database-deployer` - Database configuration
- `email-deployer` - Email service setup
- `monitoring-deployer` - Observability stack

### **Phase 8: Quality Assurance**
- `error-manager` - Resolves issues and blocks

### Using Agents
```bash
# Interactive agent interface
claude-dev agent

# Spawn specific agent
claude-dev agent spawn stripe-deployer

# Run agent sequence
claude-dev agent sequence onboarding-flow
```

## 📋 Advanced Usage

### Task System
```bash
# Full task orchestration (requires Task)
task --list                # Show all tasks
task dev                   # Start everything
task agents:spawn          # Spawn agents
task deploy                # Full deployment
task sync:all              # Sync environments
```

### Environment Management
```bash
claude-dev sync --vercel     # Sync Vercel only
claude-dev sync --supabase   # Sync Supabase only
claude-dev deploy --staging  # Deploy to staging
```

### Infrastructure Control
```bash
task infra:status          # Infrastructure health
task infra:logs            # View all logs
task infra:restart         # Restart services
task health-check          # Full health check
```

## 🔄 How It Works

### 1. Project Analysis
- Detects framework (Next.js, Django, etc.)
- Identifies database setup
- Checks for existing infrastructure

### 2. Environment Orchestration  
- Starts Docker Compose services
- Launches Supabase local
- Syncs environment variables
- Validates health endpoints

### 3. Agent Integration
- Onboards repository to agent system
- Provides contextual AI assistance
- Enables autonomous task execution

### 4. Continuous Monitoring
- Health checks every 30 seconds
- Auto-recovery from failures
- Real-time status dashboard

## 🛠️ Configuration

### Environment Files
The system automatically manages:
- `.env` - Merged from all sources
- `.env.local` - Local overrides
- `.env.vercel` - Pulled from Vercel
- `.env.production` - Production settings

### Docker Compose
Auto-generates or uses existing:
- `docker-compose.dev.yml` - Development stack
- `docker-compose.yml` - Basic setup

### Task Files
Creates comprehensive task system:
- `Taskfile.yml` - Main orchestrator
- `tasks/AgentTasks.yml` - Agent management
- `tasks/InfraTasks.yml` - Infrastructure
- `tasks/DeployTasks.yml` - Deployment

## 🚀 Deployment

### Production Deployment
```bash
claude-dev deploy
```

This will:
1. Run pre-deployment tests
2. Sync environment to Vercel
3. Deploy database migrations
4. Deploy application
5. Deploy edge functions
6. Run post-deployment verification

### Staging Deployment
```bash
claude-dev deploy --staging
```

## 📊 Monitoring

### System Status
```bash
claude-dev status
```

Shows:
- Framework and language detection
- Infrastructure component health
- Service availability
- Recent issues

### Health Dashboard
Access at `http://localhost:3001` for:
- Real-time metrics
- Service logs
- Performance monitoring
- Alert management

## 🧹 Maintenance

### Clean Environment
```bash
claude-dev clean           # Basic cleanup
claude-dev clean --hard    # Remove everything
```

### Reset Everything
```bash
task reset                 # Complete reset
```

## 📚 Core System Documentation

### Agent System (`docs/`)
- `CLAUDE_CODE_AGENT_SYSTEM.md` - Complete system blueprint
- `AGENT_HEADER_PROTOCOL.md` - Universal agent workflow
- `TASK_MANAGEMENT_PROTOCOL.md` - Coordination system
- `AGENT_JOURNAL_INTERFACE.md` - Human monitoring dashboard
- `AGENT_IMPLEMENTATION_GUIDE.md` - How to build each agent

### Infrastructure (`docs/`)
- `REPO_ONBOARDING_AGENT.md` - Universal repository integration
- `CLI_INTERFACE_ARCHITECTURE.md` - Interactive command interface
- `DEVELOPER_OS_ARCHITECTURE.md` - Complete infrastructure design

### Templates (`templates/`)
- `PROJECT_MANIFESTO_TEMPLATE.md` - Project philosophy framework
- `PROJECT_LOG_TEMPLATE.md` - Agent coordination template
- `AGENT_COMPATIBILITY_MAP_TEMPLATE.md` - Repository integration guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `claude-dev` to test
5. Submit a pull request

## 📝 License

MIT License - see [LICENSE](./LICENSE) file.

---

## 🎯 Why Claude Developer OS?

### The Problem
**Traditional Development:**
- Juggling Docker, Vercel, Supabase separately
- Manual environment synchronization
- Complex deployment pipelines
- Hours of setup per project
- Infrastructure drift and configuration hell

### The Solution
**Claude Developer OS:**
```bash
claude-dev  # Everything just works
```

- **Auto-Discovery**: Detects your tech stack and configures accordingly
- **Zero Config**: Works with any repository out of the box  
- **Cloud Sync**: Keeps local, Vercel, and Supabase in perfect sync
- **AI Agents**: 30+ specialized agents for complete development automation
- **Production Ready**: Full CI/CD with deployment validation
- **Self-Healing**: Automatic recovery from service failures

### The Result
- **Before**: 2-4 hours setting up each new project
- **After**: 30 seconds with `claude-dev`
- **Before**: Manual deployment and sync processes
- **After**: One-command deployment with full validation
- **Before**: Agent systems limited to new projects
- **After**: Any repository at any stage becomes agent-compatible

Your future dev life is a one-liner away. 🚀

## 🌟 Success Stories

This system was battle-tested during the Edition project - a complete application built in 27 hours using agent orchestration. The breakthrough discovery: **proper agent coordination eliminates traditional project management overhead**.

Instead of managing development, you manage agents. Instead of writing boilerplate, you guide systems. Instead of months of setup, you get seconds of orchestration.

**The future of software development is here.**