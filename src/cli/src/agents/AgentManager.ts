import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import * as pty from 'node-pty';

interface AgentDefinition {
  name: string;
  description: string;
  phase: number;
  triggers: string[];
  capabilities: string[];
  dependencies: string[];
}

interface AgentInstance {
  id: string;
  name: string;
  process?: ChildProcess | pty.IPty;
  context: any;
  mode: 'interactive' | 'auto';
  startTime: Date;
  status: 'starting' | 'running' | 'completed' | 'error' | 'stopped';
  output: string[];
  error?: string;
}

interface AgentSequence {
  name: string;
  agents: string[];
  description: string;
  created: Date;
}

interface ClaudeCodeConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  hooks?: any;
}

export class AgentManager extends EventEmitter {
  private activeAgents = new Map<string, AgentInstance>();
  private agentDefinitions = new Map<string, AgentDefinition>();
  private agentSequences = new Map<string, AgentSequence>();
  private claudeConfig: ClaudeCodeConfig;
  
  constructor() {
    super();
    this.loadAgentDefinitions();
    this.loadClaudeConfig();
    this.setupProcessHandlers();
  }

  private loadAgentDefinitions(): void {
    const agents: AgentDefinition[] = [
      {
        name: 'repo-onboarding-agent',
        description: 'Universal repository analysis and agent system integration',
        phase: -1,
        triggers: ['manual'],
        capabilities: ['repository-analysis', 'agent-integration', 'compatibility-mapping'],
        dependencies: []
      },
      {
        name: 'journal-interface-builder',
        description: 'Create human-readable dashboard for monitoring agents',
        phase: 0,
        triggers: ['project-start', 'manual'],
        capabilities: ['dashboard-creation', 'monitoring-setup'],
        dependencies: []
      },
      {
        name: 'vision-challenger',
        description: 'Stress-test and refine raw concepts',
        phase: 1,
        triggers: ['new-idea', 'concept-validation'],
        capabilities: ['concept-analysis', 'feasibility-assessment'],
        dependencies: []
      },
      {
        name: 'manifesto-generator',
        description: 'Create project-specific manifesto with core principles',
        phase: 1,
        triggers: ['after-vision-challenger'],
        capabilities: ['manifesto-creation', 'principle-definition'],
        dependencies: ['vision-challenger']
      },
      {
        name: 'prd-generator',
        description: 'Transform refined concepts into complete PRDs',
        phase: 1,
        triggers: ['after-manifesto-generator'],
        capabilities: ['prd-creation', 'requirements-analysis'],
        dependencies: ['manifesto-generator']
      },
      {
        name: 'architecture-designer',
        description: 'Design technical architecture from PRD',
        phase: 1,
        triggers: ['after-prd-generator'],
        capabilities: ['architecture-design', 'system-design'],
        dependencies: ['prd-generator']
      },
      {
        name: 'stack-analyzer',
        description: 'Research and recommend optimal tech stack',
        phase: 2,
        triggers: ['after-architecture-designer'],
        capabilities: ['stack-analysis', 'technology-research'],
        dependencies: ['architecture-designer']
      },
      {
        name: 'docs-fetcher',
        description: 'Download and cache latest documentation',
        phase: 2,
        triggers: ['after-stack-analyzer'],
        capabilities: ['documentation-fetching', 'cache-management'],
        dependencies: ['stack-analyzer']
      },
      {
        name: 'implementation-planner',
        description: 'Create detailed implementation plans',
        phase: 2,
        triggers: ['after-docs-fetcher'],
        capabilities: ['implementation-planning', 'timeline-creation'],
        dependencies: ['docs-fetcher']
      },
      {
        name: 'foundation-architect',
        description: 'Design the shared foundation layer',
        phase: 2,
        triggers: ['after-implementation-planner'],
        capabilities: ['foundation-design', 'architecture-patterns'],
        dependencies: ['implementation-planner']
      },
      {
        name: 'build-sequencer',
        description: 'Create exact build order with sprint-based plan',
        phase: 3,
        triggers: ['after-foundation-architect'],
        capabilities: ['build-sequencing', 'dependency-management'],
        dependencies: ['foundation-architect']
      },
      {
        name: 'task-spec-builder',
        description: 'Create detailed task specifications',
        phase: 3,
        triggers: ['after-build-sequencer'],
        capabilities: ['task-specification', 'requirement-detailing'],
        dependencies: ['build-sequencer']
      },
      {
        name: 'task-manager',
        description: 'Initialize and maintain the task management system',
        phase: 3,
        triggers: ['after-task-spec-builder'],
        capabilities: ['task-management', 'status-tracking'],
        dependencies: ['task-spec-builder']
      },
      {
        name: 'task-folder-generator',
        description: 'Create complete TASKS/ directory structure',
        phase: 3,
        triggers: ['after-task-manager'],
        capabilities: ['folder-generation', 'task-organization'],
        dependencies: ['task-manager']
      },
      {
        name: 'design-system-creator',
        description: 'Create comprehensive design system',
        phase: 4,
        triggers: ['ui-components-needed'],
        capabilities: ['design-system', 'component-library'],
        dependencies: ['architecture-designer']
      },
      {
        name: 'ai-context-builder',
        description: 'Create .claude folder for AI assistance',
        phase: 4,
        triggers: ['before-execution'],
        capabilities: ['ai-context', 'documentation-generation'],
        dependencies: ['task-folder-generator']
      },
      {
        name: 'journal-keeper',
        description: 'Document the development journey',
        phase: 4,
        triggers: ['milestone-reached'],
        capabilities: ['documentation', 'journey-tracking'],
        dependencies: []
      },
      {
        name: 'task-executor',
        description: 'Execute tasks from TASKS/ folder',
        phase: 5,
        triggers: ['manual', 'task-available'],
        capabilities: ['task-execution', 'code-generation', 'implementation'],
        dependencies: ['task-folder-generator']
      },
      {
        name: 'vertical-slice-builder',
        description: 'Build the critical first path',
        phase: 5,
        triggers: ['foundation-ready'],
        capabilities: ['vertical-slice', 'integration-testing'],
        dependencies: ['foundation-architect']
      },
      {
        name: 'test-guardian',
        description: 'Ensure quality gates are met',
        phase: 5,
        triggers: ['after-task-completion'],
        capabilities: ['testing', 'quality-assurance'],
        dependencies: []
      },
      {
        name: 'folder-documenter',
        description: 'Generate comprehensive folder documentation',
        phase: 5,
        triggers: ['folder-work-complete'],
        capabilities: ['folder-documentation', 'readme-generation'],
        dependencies: []
      },
      {
        name: 'admin-console-builder',
        description: 'Create self-managing admin interface',
        phase: 6,
        triggers: ['admin-interface-needed'],
        capabilities: ['admin-interface', 'management-ui'],
        dependencies: ['vertical-slice-builder']
      },
      {
        name: 'setup-wizard-creator',
        description: 'Build zero-friction onboarding',
        phase: 6,
        triggers: ['onboarding-needed'],
        capabilities: ['setup-wizard', 'onboarding-flow'],
        dependencies: ['admin-console-builder']
      },
      {
        name: 'devops-automator',
        description: 'Automate deployment and operations',
        phase: 6,
        triggers: ['deployment-needed'],
        capabilities: ['devops', 'ci-cd', 'deployment'],
        dependencies: ['setup-wizard-creator']
      },
      {
        name: 'service-analyzer',
        description: 'Analyze project requirements and determine needed services',
        phase: 7,
        triggers: ['service-integration-needed'],
        capabilities: ['service-analysis', 'integration-planning'],
        dependencies: ['prd-generator']
      },
      {
        name: 'stripe-deployer',
        description: 'Fully configure and deploy Stripe payment processing',
        phase: 7,
        triggers: ['payment-processing-needed'],
        capabilities: ['stripe-integration', 'payment-processing'],
        dependencies: ['service-analyzer']
      },
      {
        name: 'clerk-deployer',
        description: 'Deploy and configure Clerk authentication',
        phase: 7,
        triggers: ['authentication-needed'],
        capabilities: ['clerk-integration', 'authentication'],
        dependencies: ['service-analyzer']
      },
      {
        name: 'email-deployer',
        description: 'Set up email service integration',
        phase: 7,
        triggers: ['email-needed'],
        capabilities: ['email-integration', 'notification-system'],
        dependencies: ['service-analyzer']
      },
      {
        name: 'database-deployer',
        description: 'Deploy and configure database services',
        phase: 7,
        triggers: ['database-needed'],
        capabilities: ['database-setup', 'data-management'],
        dependencies: ['service-analyzer']
      },
      {
        name: 'monitoring-deployer',
        description: 'Set up monitoring and analytics',
        phase: 7,
        triggers: ['monitoring-needed'],
        capabilities: ['monitoring', 'analytics', 'observability'],
        dependencies: ['devops-automator']
      },
      {
        name: 'error-manager',
        description: 'Specialized agent for resolving stuck/errored tasks',
        phase: 8,
        triggers: ['error-detected', 'agent-stuck'],
        capabilities: ['error-resolution', 'recovery', 'debugging'],
        dependencies: []
      }
    ];

    for (const agent of agents) {
      this.agentDefinitions.set(agent.name, agent);
    }
  }

  private loadClaudeConfig(): void {
    try {
      const configPath = join(process.env.HOME || '~', '.claude', 'config.json');
      if (existsSync(configPath)) {
        this.claudeConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
      } else {
        this.claudeConfig = this.getDefaultClaudeConfig();
      }
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not load Claude config, using defaults'));
      this.claudeConfig = this.getDefaultClaudeConfig();
    }
  }

  private getDefaultClaudeConfig(): ClaudeCodeConfig {
    return {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 8192,
      temperature: 0.1,
      hooks: {}
    };
  }

  private setupProcessHandlers(): void {
    // Clean up processes on exit
    process.on('SIGINT', () => {
      this.stopAllAgents();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.stopAllAgents();
      process.exit(0);
    });
  }

  async spawnAgent(
    agentName: string, 
    context: any = {}, 
    mode: 'interactive' | 'auto' = 'interactive'
  ): Promise<{ status: string, error?: string, instance?: AgentInstance }> {
    const agent = this.agentDefinitions.get(agentName);
    
    if (!agent) {
      return { status: 'error', error: `Agent not found: ${agentName}` };
    }

    // Check dependencies
    for (const dep of agent.dependencies) {
      if (!this.hasCompletedAgent(dep)) {
        return { 
          status: 'error', 
          error: `Missing dependency: ${dep} must complete before ${agentName}` 
        };
      }
    }

    const instanceId = `${agentName}-${Date.now()}`;
    
    try {
      // Create agent instance
      const instance: AgentInstance = {
        id: instanceId,
        name: agentName,
        context,
        mode,
        startTime: new Date(),
        status: 'starting',
        output: []
      };

      this.activeAgents.set(instanceId, instance);

      // Build agent prompt
      const prompt = this.buildAgentPrompt(agent, context);
      
      // Spawn Claude Code process
      if (mode === 'interactive') {
        instance.process = await this.spawnInteractiveClaudeProcess(instanceId, prompt);
      } else {
        instance.process = await this.spawnAutomaticClaudeProcess(instanceId, prompt);
      }

      instance.status = 'running';
      
      this.emit('agent_spawned', { instanceId, agentName, mode });
      
      return { status: 'success', instance };
      
    } catch (error) {
      this.activeAgents.delete(instanceId);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private buildAgentPrompt(agent: AgentDefinition, context: any): string {
    const basePrompt = `
You are the ${agent.name} agent in the Claude Code Agent System.

Your role: ${agent.description}

Phase: ${agent.phase}
Capabilities: ${agent.capabilities.join(', ')}

Context:
${JSON.stringify(context, null, 2)}

Project Files Available:
- PROJECT_MANIFESTO.md (read this first)
- PROJECT_LOG.md (log all your actions here)
- AGENT_COMPATIBILITY_MAP.md (repository-specific guidelines)
- TASKS/ (task management system)

CRITICAL: Follow the Agent Header Protocol:
1. Read PROJECT_MANIFESTO.md first
2. Read PROJECT_LOG.md second  
3. Log your activation with timestamp
4. Check for conflicts with other agents
5. Execute your specialized work
6. Log all decisions and changes
7. Log completion and handoff to next agent

Remember: You are working in an existing repository. Respect existing patterns and follow the compatibility guidelines.

Begin your work now.
`;

    return basePrompt.trim();
  }

  private async spawnInteractiveClaudeProcess(instanceId: string, prompt: string): Promise<pty.IPty> {
    const instance = this.activeAgents.get(instanceId);
    if (!instance) throw new Error('Instance not found');

    // Use node-pty for interactive terminal sessions
    const ptyProcess = pty.spawn('claude', [], {
      name: 'xterm-color',
      cols: 120,
      rows: 30,
      cwd: process.cwd(),
      env: {
        ...process.env,
        CLAUDE_AGENT_CONTEXT: JSON.stringify({
          agent: instance.name,
          instanceId,
          context: instance.context
        })
      }
    });

    // Handle output
    ptyProcess.onData((data) => {
      instance.output.push(data);
      this.emit('agent_output', { instanceId, data, agentName: instance.name });
    });

    // Handle process exit
    ptyProcess.onExit(({ exitCode, signal }) => {
      this.handleAgentExit(instanceId, exitCode, signal);
    });

    // Send initial prompt
    setTimeout(() => {
      ptyProcess.write(prompt + '\n');
    }, 1000);

    return ptyProcess;
  }

  private async spawnAutomaticClaudeProcess(instanceId: string, prompt: string): Promise<ChildProcess> {
    const instance = this.activeAgents.get(instanceId);
    if (!instance) throw new Error('Instance not found');

    const process = spawn('claude', ['--non-interactive'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        CLAUDE_AGENT_CONTEXT: JSON.stringify({
          agent: instance.name,
          instanceId,
          context: instance.context
        })
      }
    });

    // Handle stdout
    process.stdout?.on('data', (data) => {
      const output = data.toString();
      instance.output.push(output);
      this.emit('agent_output', { instanceId, data: output, agentName: instance.name });
    });

    // Handle stderr
    process.stderr?.on('data', (data) => {
      const error = data.toString();
      instance.error = error;
      this.emit('agent_error', { instanceId, error, agentName: instance.name });
    });

    // Handle process exit
    process.on('exit', (code, signal) => {
      this.handleAgentExit(instanceId, code, signal);
    });

    // Send prompt to stdin
    process.stdin?.write(prompt + '\n');
    process.stdin?.end();

    return process;
  }

  private handleAgentExit(instanceId: string, exitCode: number | null, signal: string | null): void {
    const instance = this.activeAgents.get(instanceId);
    if (!instance) return;

    if (exitCode === 0) {
      instance.status = 'completed';
      this.emit('agent_completed', { instanceId, agentName: instance.name });
    } else {
      instance.status = 'error';
      instance.error = `Process exited with code ${exitCode}, signal ${signal}`;
      this.emit('agent_failed', { instanceId, agentName: instance.name, error: instance.error });
    }

    // Clean up after a delay
    setTimeout(() => {
      this.activeAgents.delete(instanceId);
    }, 60000); // Keep for 1 minute for debugging
  }

  private hasCompletedAgent(agentName: string): boolean {
    // Check PROJECT_LOG.md for completion
    try {
      const logPath = join(process.cwd(), 'PROJECT_LOG.md');
      if (!existsSync(logPath)) return false;
      
      const logContent = readFileSync(logPath, 'utf-8');
      const completionPattern = new RegExp(`${agentName}.*(?:COMPLETED|HANDOFF)`, 'i');
      
      return completionPattern.test(logContent);
    } catch {
      return false;
    }
  }

  stopAgent(instanceId: string): boolean {
    const instance = this.activeAgents.get(instanceId);
    if (!instance || !instance.process) return false;

    try {
      if ('kill' in instance.process) {
        // ChildProcess
        instance.process.kill('SIGTERM');
      } else {
        // IPty
        instance.process.kill();
      }

      instance.status = 'stopped';
      this.emit('agent_stopped', { instanceId, agentName: instance.name });
      
      return true;
    } catch (error) {
      this.emit('agent_error', { 
        instanceId, 
        error: `Failed to stop agent: ${error}`, 
        agentName: instance.name 
      });
      return false;
    }
  }

  stopAllAgents(): void {
    for (const instanceId of this.activeAgents.keys()) {
      this.stopAgent(instanceId);
    }
  }

  getActiveAgents(): AgentInstance[] {
    return Array.from(this.activeAgents.values())
      .filter(instance => ['starting', 'running'].includes(instance.status));
  }

  getAvailableAgents(): AgentDefinition[] {
    return Array.from(this.agentDefinitions.values())
      .sort((a, b) => a.phase - b.phase);
  }

  getAgentDefinition(agentName: string): AgentDefinition | undefined {
    return this.agentDefinitions.get(agentName);
  }

  // Agent sequence management
  async createSequence(name: string, agents: string[]): Promise<void> {
    const validAgents = agents.filter(agentName => this.agentDefinitions.has(agentName));
    
    if (validAgents.length !== agents.length) {
      const invalid = agents.filter(name => !this.agentDefinitions.has(name));
      throw new Error(`Invalid agents: ${invalid.join(', ')}`);
    }

    const sequence: AgentSequence = {
      name,
      agents: validAgents,
      description: `Custom sequence: ${validAgents.join(' → ')}`,
      created: new Date()
    };

    this.agentSequences.set(name, sequence);
    this.saveSequences();
  }

  async runSequence(name: string, context: any = {}): Promise<void> {
    const sequence = this.agentSequences.get(name);
    if (!sequence) {
      throw new Error(`Sequence not found: ${name}`);
    }

    console.log(chalk.blue(`🎯 Running sequence: ${sequence.name}`));
    
    for (let i = 0; i < sequence.agents.length; i++) {
      const agentName = sequence.agents[i];
      const isLast = i === sequence.agents.length - 1;
      
      console.log(chalk.cyan(`  ${i + 1}. Starting ${agentName}...`));
      
      const result = await this.spawnAgent(agentName, context, 'auto');
      
      if (result.status === 'error') {
        console.log(chalk.red(`  ❌ ${agentName} failed: ${result.error}`));
        throw new Error(`Sequence failed at ${agentName}: ${result.error}`);
      }
      
      // Wait for completion
      await this.waitForCompletion(result.instance!.id);
      console.log(chalk.green(`  ✅ ${agentName} completed`));
      
      if (!isLast) {
        console.log(chalk.gray(`     ↓`));
      }
    }
    
    console.log(chalk.green(`🎉 Sequence "${name}" completed successfully!`));
  }

  private waitForCompletion(instanceId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkStatus = () => {
        const instance = this.activeAgents.get(instanceId);
        if (!instance) {
          reject(new Error('Instance not found'));
          return;
        }

        if (instance.status === 'completed') {
          resolve();
        } else if (instance.status === 'error') {
          reject(new Error(instance.error || 'Agent failed'));
        } else {
          setTimeout(checkStatus, 1000); // Check every second
        }
      };

      checkStatus();
    });
  }

  async listSequences(): Promise<void> {
    if (this.agentSequences.size === 0) {
      console.log(chalk.yellow('No custom sequences defined'));
      return;
    }

    console.log(chalk.blue('\n📋 Custom Agent Sequences:\n'));
    
    for (const [name, sequence] of this.agentSequences.entries()) {
      console.log(chalk.cyan(`• ${name}`));
      console.log(chalk.gray(`  Created: ${sequence.created.toLocaleDateString()}`));
      console.log(chalk.gray(`  Agents: ${sequence.agents.join(' → ')}`));
      console.log();
    }
  }

  private saveSequences(): void {
    try {
      const sequencesPath = join(process.cwd(), '.claude-agents-sequences.json');
      const sequences = Object.fromEntries(this.agentSequences.entries());
      writeFileSync(sequencesPath, JSON.stringify(sequences, null, 2));
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not save sequences'));
    }
  }

  private loadSequences(): void {
    try {
      const sequencesPath = join(process.cwd(), '.claude-agents-sequences.json');
      if (existsSync(sequencesPath)) {
        const sequences = JSON.parse(readFileSync(sequencesPath, 'utf-8'));
        for (const [name, sequence] of Object.entries(sequences)) {
          this.agentSequences.set(name, sequence as AgentSequence);
        }
      }
    } catch (error) {
      // Ignore, sequences not essential
    }
  }

  // Get suggested next agents based on current state
  getSuggestedNextAgents(currentAgent?: string): AgentDefinition[] {
    if (!currentAgent) {
      // Suggest starting agents
      return this.getAvailableAgents().filter(agent => 
        agent.phase <= 1 || agent.triggers.includes('manual')
      );
    }

    const currentDef = this.agentDefinitions.get(currentAgent);
    if (!currentDef) return [];

    // Find agents that depend on current agent or are in next phase
    return this.getAvailableAgents().filter(agent => 
      agent.dependencies.includes(currentAgent) ||
      (agent.phase === currentDef.phase + 1) ||
      agent.triggers.includes('manual')
    );
  }
}