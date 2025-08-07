# Claude Code Agent System - CLI Interface Architecture
## Interactive Agent Orchestration Interface

### Overview

This document outlines the architecture for an interview-style CLI interface that integrates deeply with Claude Code CLI, enabling seamless agent orchestration through an interactive, monitoring-aware system.

---

## Integration Strategy

### **Approach 1: MCP Server Integration (Recommended)**

Create our agent system as a **Model Context Protocol (MCP) server** that Claude Code connects to, enabling native integration while maintaining our orchestration capabilities.

```typescript
// MCP Server Architecture
interface AgentOrchestrationServer extends MCPServer {
  name: "claude-agent-system"
  version: "1.0.0"
  resources: AgentResource[]
  tools: AgentTool[]
  prompts: AgentPrompt[]
}

interface AgentResource {
  uri: "agents://vision-challenger" | "agents://task-executor" | "agents://[agent-name]"
  name: string
  description: string
  mimeType: "application/json"
}

interface AgentTool {
  name: "spawn_agent" | "monitor_progress" | "suggest_next_agent"
  description: string
  inputSchema: JSONSchema
}
```

### **Approach 2: CLI Wrapper + Hooks (Parallel System)**

Build an interactive CLI that wraps Claude Code and uses hooks for monitoring, creating a guided experience.

---

## CLI Interface Design

### **Interactive Interview Flow**

```bash
$ claude-agents

╭─────────────────────────────────────────────────────────╮
│  🤖 Claude Code Agent System - Interactive Orchestrator │  
│  Transform any codebase with AI agent coordination      │
╰─────────────────────────────────────────────────────────╯

🔍 Analyzing current directory: /Users/you/my-project
   ├── Repository detected: React + TypeScript
   ├── Stage: MVP/Beta (moderate risk)  
   ├── Agent compatibility: ✅ Ready
   └── Onboarding status: ✅ Complete

┌─ What would you like to accomplish? ─┐
│                                      │
│  1. 🚀 Start a new feature/project   │
│  2. 🔧 Fix bugs or improve existing  │
│  3. 📚 Generate documentation        │
│  4. 🏗️  Refactor or optimize code    │
│  5. 🎯 Custom agent workflow         │
│  6. 📊 View project dashboard        │
│                                      │
└──────────────────────────────────────┘

Choice [1-6]: 1

🚀 Starting new feature development...

┌─ Tell me about your feature idea ─┐
│                                   │  
│ > I want to add user profiles     │
│   with avatar upload and bio      │
│                                   │
└───────────────────────────────────┘

🤔 Analyzing your request...

┌─ Recommended Agent Sequence ─┐
│                              │
│  1. vision-challenger        │
│     ↳ Refine and validate    │  
│       the user profile idea  │
│                              │
│  2. architecture-designer    │
│     ↳ Design the technical   │
│       approach for profiles  │
│                              │
│  3. task-folder-generator    │
│     ↳ Create implementation  │
│       tasks and sequence     │
│                              │
│  4. task-executor            │
│     ↳ Build the feature      │
│       step by step           │
│                              │
└──────────────────────────────┘

🎯 Start with vision-challenger? [Y/n]: y

🤖 Launching vision-challenger agent...
   └── Connecting to Claude Code CLI...
   └── Agent spawned successfully

╭─── Agent: vision-challenger ────╮
│ Status: Active                   │
│ Progress: Analyzing concept      │
│ Next: Challenging assumptions    │
╰──────────────────────────────────╯

[Agent Output Stream...]
vision-challenger: Let me ask some hard questions about this user profile feature...

- How will you handle profile privacy? 
- What's your avatar storage strategy?
- Have you considered GDPR compliance?
- What's the expected user volume?

[Agent completes analysis...]

✅ vision-challenger completed
   └── Refined concept: Secure user profiles with privacy controls

🎯 Next recommended: architecture-designer
   Continue with sequence? [Y/n]: y

🤖 Launching architecture-designer agent...
   └── Previous context loaded automatically
   └── Agent spawned successfully

[Process continues through agent sequence...]
```

---

## Technical Implementation

### **1. MCP Server Implementation**

```typescript
// src/mcp-server/agent-orchestrator.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

export class AgentOrchestrationServer {
  private server: Server;
  private agents: Map<string, AgentDefinition>;
  private activeAgents: Map<string, AgentInstance>;

  constructor() {
    this.server = new Server(
      {
        name: "claude-agent-system",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupAgentResources();
    this.setupAgentTools();
    this.setupAgentPrompts();
  }

  private setupAgentResources() {
    // Register all 30+ agents as MCP resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: "agents://vision-challenger",
          name: "Vision Challenger",
          description: "Stress-test and refine raw concepts",
          mimeType: "application/json",
        },
        {
          uri: "agents://task-executor", 
          name: "Task Executor",
          description: "Execute tasks from TASKS/ folder",
          mimeType: "application/json",
        },
        // ... all other agents
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const agentName = request.params.uri.replace("agents://", "");
      const agent = this.agents.get(agentName);
      
      if (!agent) {
        throw new Error(`Agent not found: ${agentName}`);
      }

      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "application/json",
            text: JSON.stringify({
              agent: agentName,
              capabilities: agent.capabilities,
              triggers: agent.triggers,
              status: this.getAgentStatus(agentName),
              suggestedNext: this.getSuggestedNextAgents(agentName),
            }),
          },
        ],
      };
    });
  }

  private setupAgentTools() {
    // Tool: Spawn Agent
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === "spawn_agent") {
        const { agentName, context, mode } = request.params.arguments as {
          agentName: string;
          context?: any;
          mode?: "interactive" | "auto";
        };

        return await this.spawnAgent(agentName, context, mode);
      }

      if (request.params.name === "monitor_progress") {
        return await this.getProgressStatus();
      }

      if (request.params.name === "suggest_next_agent") {
        const { currentState } = request.params.arguments as {
          currentState: ProjectState;
        };

        return await this.suggestNextAgent(currentState);
      }
    });
  }

  private async spawnAgent(
    agentName: string, 
    context?: any, 
    mode: "interactive" | "auto" = "interactive"
  ) {
    // Spawn Claude Code CLI session with specific agent context
    const claudeProcess = spawn("claude", [], {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        CLAUDE_AGENT_CONTEXT: JSON.stringify({
          agent: agentName,
          project: context?.project,
          manifesto: context?.manifesto,
          compatibility: context?.compatibility,
        }),
      },
    });

    // Monitor and coordinate the agent
    const agentInstance = new AgentInstance(agentName, claudeProcess, context);
    this.activeAgents.set(agentName, agentInstance);

    return {
      content: [
        {
          type: "text",
          text: `Agent ${agentName} spawned successfully with PID ${claudeProcess.pid}`,
        },
      ],
    };
  }
}
```

### **2. Interactive CLI Implementation**

```typescript
// src/cli/interactive-orchestrator.ts
import inquirer from "inquirer";
import chalk from "chalk";
import { spawn } from "child_process";
import { AgentOrchestrationServer } from "../mcp-server/agent-orchestrator.js";

export class InteractiveOrchestrator {
  private mcpServer: AgentOrchestrationServer;
  private currentProject: ProjectContext;
  private agentSequence: AgentSequence;

  async start() {
    console.log(chalk.blue.bold("🤖 Claude Code Agent System"));
    console.log(chalk.blue("Interactive Orchestrator"));
    console.log("");

    // Analyze current directory
    this.currentProject = await this.analyzeCurrentDirectory();
    this.displayProjectStatus();

    // Main interaction loop
    while (true) {
      const action = await this.promptForAction();
      await this.handleAction(action);
    }
  }

  private async analyzeCurrentDirectory(): Promise<ProjectContext> {
    const cwd = process.cwd();
    
    // Check if onboarded
    const isOnboarded = existsSync("PROJECT_MANIFESTO.md") && 
                       existsSync("AGENT_COMPATIBILITY_MAP.md") &&
                       existsSync("TASKS");

    if (!isOnboarded) {
      console.log(chalk.yellow("⚠️  Repository not onboarded to agent system"));
      const shouldOnboard = await inquirer.prompt({
        type: "confirm",
        name: "onboard",
        message: "Onboard this repository now?",
        default: true,
      });

      if (shouldOnboard.onboard) {
        await this.runOnboarding();
      } else {
        console.log(chalk.red("Cannot proceed without onboarding"));
        process.exit(1);
      }
    }

    // Load project context
    const manifesto = readFileSync("PROJECT_MANIFESTO.md", "utf-8");
    const compatibility = JSON.parse(readFileSync("AGENT_COMPATIBILITY_MAP.md", "utf-8"));
    const status = JSON.parse(readFileSync("TASKS/STATUS.json", "utf-8"));

    return {
      path: cwd,
      name: path.basename(cwd),
      manifesto,
      compatibility,
      status,
      isOnboarded: true,
    };
  }

  private async promptForAction(): Promise<ActionChoice> {
    const choices = [
      {
        name: "🚀 Start new feature/project",
        value: "new_feature",
        description: "Use vision-challenger → architecture → implementation flow",
      },
      {
        name: "🔧 Fix bugs or improve existing code", 
        value: "improve_code",
        description: "Use error-manager → task-executor → test-guardian flow",
      },
      {
        name: "📚 Generate documentation",
        value: "documentation",
        description: "Use folder-documenter → ai-context-builder flow",
      },
      {
        name: "🏗️  Refactor or optimize",
        value: "refactor",
        description: "Use foundation-architect → task-executor flow",
      },
      {
        name: "🎯 Custom agent workflow",
        value: "custom",
        description: "Build your own agent sequence",
      },
      {
        name: "📊 View project dashboard",
        value: "dashboard",
        description: "Launch monitoring interface",
      },
    ];

    const answer = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "What would you like to accomplish?",
      choices,
    });

    return answer.action;
  }

  private async handleAction(action: ActionChoice) {
    switch (action) {
      case "new_feature":
        await this.handleNewFeature();
        break;
      case "improve_code":
        await this.handleImproveCode();
        break;
      case "documentation":
        await this.handleDocumentation();
        break;
      case "refactor":
        await this.handleRefactor();
        break;
      case "custom":
        await this.handleCustomWorkflow();
        break;
      case "dashboard":
        await this.launchDashboard();
        break;
    }
  }

  private async handleNewFeature() {
    console.log(chalk.green("🚀 Starting new feature development..."));
    
    // Get feature description
    const featureInput = await inquirer.prompt({
      type: "input",
      name: "description",
      message: "Describe your feature idea:",
      validate: (input) => input.length > 0 || "Please provide a description",
    });

    // Analyze and suggest agent sequence
    const suggestedSequence = this.analyzeFeaturesAndSuggestSequence(featureInput.description);
    
    console.log(chalk.blue("🤔 Analyzing your request..."));
    this.displaySuggestedSequence(suggestedSequence);

    const proceed = await inquirer.prompt({
      type: "confirm",
      name: "start",
      message: `Start with ${suggestedSequence[0].name}?`,
      default: true,
    });

    if (proceed.start) {
      await this.executeAgentSequence(suggestedSequence, featureInput.description);
    }
  }

  private async executeAgentSequence(sequence: AgentDefinition[], context: string) {
    for (let i = 0; i < sequence.length; i++) {
      const agent = sequence[i];
      const isLast = i === sequence.length - 1;

      console.log(chalk.blue(`🤖 Launching ${agent.name} agent...`));
      console.log(chalk.gray(`   └── ${agent.description}`));

      // Spawn Claude Code with agent-specific context
      const result = await this.spawnClaudeCodeWithAgent(agent, context);

      // Monitor progress
      await this.monitorAgentProgress(agent.name);

      if (result.status === "completed") {
        console.log(chalk.green(`✅ ${agent.name} completed`));
        if (!isLast) {
          const nextAgent = sequence[i + 1];
          console.log(chalk.blue(`🎯 Next recommended: ${nextAgent.name}`));
          
          const continueSequence = await inquirer.prompt({
            type: "confirm",
            name: "continue",
            message: "Continue with sequence?",
            default: true,
          });

          if (!continueSequence.continue) {
            break;
          }
        }
      } else if (result.status === "error") {
        console.log(chalk.red(`❌ ${agent.name} encountered an error`));
        
        const handleError = await inquirer.prompt({
          type: "list",
          name: "action",
          message: "How would you like to handle this?",
          choices: [
            "Retry agent",
            "Skip to next agent",
            "Launch error-manager",
            "Stop sequence",
          ],
        });

        // Handle error based on user choice
        await this.handleAgentError(agent, result.error, handleError.action);
      }
    }
  }

  private async spawnClaudeCodeWithAgent(agent: AgentDefinition, context: string) {
    return new Promise((resolve) => {
      const claudeProcess = spawn("claude", [], {
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          CLAUDE_AGENT_CONTEXT: JSON.stringify({
            agent: agent.name,
            context,
            manifesto: this.currentProject.manifesto,
            compatibility: this.currentProject.compatibility,
          }),
        },
      });

      // Send initial agent prompt
      const initialPrompt = this.buildAgentPrompt(agent, context);
      claudeProcess.stdin.write(initialPrompt + "\n");

      // Monitor output and progress
      let output = "";
      claudeProcess.stdout.on("data", (data) => {
        output += data.toString();
        this.handleAgentOutput(agent.name, data.toString());
      });

      claudeProcess.on("exit", (code) => {
        resolve({
          status: code === 0 ? "completed" : "error",
          output,
          error: code !== 0 ? `Process exited with code ${code}` : null,
        });
      });
    });
  }

  private buildAgentPrompt(agent: AgentDefinition, context: string): string {
    return `
You are the ${agent.name} agent in the Claude Code Agent System.

Your role: ${agent.description}

Project Context:
${context}

Please follow the Agent Header Protocol:
1. Read PROJECT_MANIFESTO.md
2. Read PROJECT_LOG.md  
3. Log your activation
4. Execute your specialized task
5. Log completion and handoff

Begin your work now.
`;
  }

  private async monitorAgentProgress(agentName: string) {
    // Create progress monitoring interface
    const progressSpinner = ora(`${agentName} is working...`).start();

    // Monitor PROJECT_LOG.md for updates
    const logWatcher = fs.watchFile("PROJECT_LOG.md", (curr, prev) => {
      if (curr.mtime > prev.mtime) {
        // Parse log for agent updates
        const updates = this.parseAgentUpdatesFromLog(agentName);
        if (updates.length > 0) {
          progressSpinner.text = updates[updates.length - 1];
        }
      }
    });

    // Monitor TASKS/ folder for status changes
    const taskWatcher = fs.watchFile("TASKS/STATUS.json", (curr, prev) => {
      if (curr.mtime > prev.mtime) {
        const status = JSON.parse(fs.readFileSync("TASKS/STATUS.json", "utf-8"));
        const activeTask = status.active_tasks.find(t => t.agent === agentName);
        if (activeTask) {
          progressSpinner.text = `${agentName}: ${activeTask.progress}`;
        }
      }
    });

    return { progressSpinner, logWatcher, taskWatcher };
  }
}
```

### **3. Claude Code Hooks Integration**

```yaml
# .claude/hooks.yaml
hooks:
  - name: "agent-coordinator"
    matcher:
      type: "tool"
      tool: ".*"
    trigger: "PreToolUse"
    command: "node ./claude-agent-system/hooks/coordinate.js"
    env:
      AGENT_NAME: "${CLAUDE_AGENT_CONTEXT.agent}"
      PROJECT_PATH: "${PWD}"
    
  - name: "progress-monitor"
    matcher:
      type: "tool" 
      tool: ".*"
    trigger: "PostToolUse"
    command: "node ./claude-agent-system/hooks/monitor.js"
    env:
      AGENT_NAME: "${CLAUDE_AGENT_CONTEXT.agent}"
      
  - name: "agent-handoff"
    matcher:
      type: "subagent"
    trigger: "SubagentStop"
    command: "node ./claude-agent-system/hooks/handoff.js"
```

```javascript
// hooks/coordinate.js - Pre-tool coordination
const fs = require('fs');
const path = require('path');

const agentName = process.env.AGENT_NAME;
const projectPath = process.env.PROJECT_PATH;

// Read current project log
const logPath = path.join(projectPath, 'PROJECT_LOG.md');
const currentLog = fs.readFileSync(logPath, 'utf-8');

// Check for conflicts with other agents
const activeAgents = parseActiveAgents(currentLog);
if (activeAgents.length > 1) {
  console.log(`⚠️  Multiple agents active: ${activeAgents.join(', ')}`);
  // Implement coordination logic
}

// Log tool usage
const logEntry = `
### ${new Date().toISOString()} - ${agentName} - TOOL_USE
About to use tool: ${process.argv[2] || 'unknown'}
Context: ${process.env.CLAUDE_TOOL_CONTEXT || 'none'}
`;

fs.appendFileSync(logPath, logEntry);
```

---

## User Experience Flow

### **1. Onboarding Experience**
```bash
$ claude-agents

🔍 Repository not onboarded. Starting onboarding process...

┌─ Repository Analysis ─┐
│ Language: TypeScript   │
│ Framework: Next.js     │  
│ Stage: MVP/Beta        │
│ Risk Level: Medium     │
└────────────────────────┘

✅ Onboarding complete! 30+ agents now available.
```

### **2. Guided Agent Selection**
```bash  
$ claude-agents

Current project: my-ecommerce-app (Next.js, MVP stage)
📊 Recent activity: 3 agents active this week

┌─ Intelligent Suggestions ─┐
│                           │
│ 💡 Based on your recent   │
│    commits, you might     │
│    want to:               │
│                           │
│ • Add tests (80% of new   │
│   code lacks coverage)    │
│   → test-guardian         │
│                           │  
│ • Document new features   │
│   → folder-documenter     │
│                           │
│ • Optimize performance    │  
│   → foundation-architect  │
│                           │
└───────────────────────────┘
```

### **3. Real-Time Monitoring**
```bash
🤖 vision-challenger is active...

╭─── Agent Dashboard ───╮
│ Status: Analyzing     │
│ Progress: ████░░ 67%  │
│ Time: 00:02:34        │
│ Files: 3 modified     │
╰───────────────────────╯

📝 Recent decisions:
  • Simplified user profile structure
  • Added privacy controls requirement
  • Identified integration with auth system

🎯 Predicted next agent: architecture-designer (94% confidence)
```

---

## Technical Architecture Benefits

### **1. Deep Claude Code Integration**
- **Native MCP Resources**: Agents appear as first-class resources in Claude Code
- **Hook-Based Monitoring**: Real-time progress tracking and coordination
- **Context Sharing**: Seamless information flow between agents
- **CLI Wrapper**: Familiar interface with enhanced capabilities

### **2. Intelligent Orchestration**
- **Context-Aware Suggestions**: Recommends agents based on project state
- **Sequence Optimization**: Learns from successful agent patterns
- **Error Recovery**: Automatic error handling and recovery strategies
- **Progress Prediction**: Estimates time and next steps

### **3. Monitoring & Coordination**
- **Real-Time Status**: Live agent progress and system health
- **Conflict Prevention**: Detects and resolves agent conflicts
- **Decision Logging**: Complete audit trail of all agent decisions
- **Human Intervention Points**: Clear escalation when needed

This architecture provides the interview-style, monitoring-aware CLI you envisioned while leveraging Claude Code's native capabilities for maximum integration and effectiveness.