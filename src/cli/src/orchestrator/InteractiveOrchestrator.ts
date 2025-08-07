import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { spawn, ChildProcess } from 'child_process';
import { ProjectAnalyzer } from '../analyzer/ProjectAnalyzer.js';
import { AgentManager } from '../agents/AgentManager.js';
import { ProgressMonitor } from '../monitoring/ProgressMonitor.js';
import { AgentSuggestionEngine } from '../suggestions/AgentSuggestionEngine.js';

interface OrchestratorConfig {
  projectPath: string;
  skipOnboarding?: boolean;
}

interface ProjectContext {
  path: string;
  name: string;
  manifesto?: string;
  compatibility?: any;
  status?: any;
  isOnboarded: boolean;
}

interface ActionChoice {
  action: 'new_feature' | 'improve_code' | 'documentation' | 'refactor' | 'custom' | 'dashboard' | 'exit';
  description?: string;
}

export class InteractiveOrchestrator {
  private config: OrchestratorConfig;
  private projectAnalyzer: ProjectAnalyzer;
  private agentManager: AgentManager;
  private progressMonitor: ProgressMonitor;
  private suggestionEngine: AgentSuggestionEngine;
  private currentProject: ProjectContext | null = null;

  constructor(config: OrchestratorConfig) {
    this.config = config;
    this.projectAnalyzer = new ProjectAnalyzer();
    this.agentManager = new AgentManager();
    this.progressMonitor = new ProgressMonitor();
    this.suggestionEngine = new AgentSuggestionEngine();
  }

  async start(): Promise<void> {
    try {
      // Analyze current directory
      this.currentProject = await this.analyzeCurrentDirectory();
      this.displayProjectStatus();

      // Main interaction loop
      while (true) {
        const action = await this.promptForAction();
        
        if (action.action === 'exit') {
          console.log(chalk.green('👋 Happy coding with your AI agents!'));
          break;
        }
        
        await this.handleAction(action);
      }
    } catch (error) {
      console.error(chalk.red('❌ Orchestrator error:'), error);
      process.exit(1);
    }
  }

  private async analyzeCurrentDirectory(): Promise<ProjectContext> {
    const projectPath = this.config.projectPath;
    const projectName = projectPath.split('/').pop() || 'unknown-project';

    console.log(chalk.blue('🔍 Analyzing current directory...'));
    
    // Check if onboarded
    const manifestoPath = join(projectPath, 'PROJECT_MANIFESTO.md');
    const compatibilityPath = join(projectPath, 'AGENT_COMPATIBILITY_MAP.md');
    const tasksPath = join(projectPath, 'TASKS');
    
    const isOnboarded = existsSync(manifestoPath) && 
                       existsSync(compatibilityPath) &&
                       existsSync(tasksPath);

    if (!isOnboarded && !this.config.skipOnboarding) {
      console.log(chalk.yellow('⚠️  Repository not onboarded to agent system'));
      
      const shouldOnboard = await inquirer.prompt([{
        type: 'confirm',
        name: 'onboard',
        message: 'Onboard this repository now?',
        default: true,
      }]);

      if (shouldOnboard.onboard) {
        await this.runOnboarding();
      } else {
        console.log(chalk.red('Cannot proceed without onboarding. Use --skip-onboarding to bypass.'));
        process.exit(1);
      }
    }

    // Load project context if onboarded
    let manifesto, compatibility, status;
    
    if (isOnboarded || this.config.skipOnboarding) {
      try {
        manifesto = existsSync(manifestoPath) ? readFileSync(manifestoPath, 'utf-8') : undefined;
        compatibility = existsSync(compatibilityPath) ? 
          this.parseCompatibilityMap(readFileSync(compatibilityPath, 'utf-8')) : undefined;
        status = existsSync(join(tasksPath, 'STATUS.json')) ? 
          JSON.parse(readFileSync(join(tasksPath, 'STATUS.json'), 'utf-8')) : undefined;
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not load project context files'));
      }
    }

    return {
      path: projectPath,
      name: projectName,
      manifesto,
      compatibility,
      status,
      isOnboarded: isOnboarded || this.config.skipOnboarding
    };
  }

  private parseCompatibilityMap(content: string): any {
    // Simple parsing of markdown compatibility map
    const lines = content.split('\n');
    const result: any = {};
    
    let currentSection = '';
    for (const line of lines) {
      if (line.startsWith('## ')) {
        currentSection = line.replace('## ', '').trim();
        result[currentSection] = {};
      } else if (line.startsWith('- **') && currentSection) {
        const match = line.match(/- \*\*([^*]+)\*\*: (.+)/);
        if (match) {
          result[currentSection][match[1]] = match[2];
        }
      }
    }
    
    return result;
  }

  private displayProjectStatus(): void {
    if (!this.currentProject) return;

    const statusBox = boxen(
      chalk.white(`📁 Project: ${chalk.bold.cyan(this.currentProject.name)}\n`) +
      chalk.white(`📍 Path: ${chalk.gray(this.currentProject.path)}\n`) +
      chalk.white(`🤖 Agent System: ${this.currentProject.isOnboarded ? 
        chalk.green('✅ Ready') : chalk.red('❌ Not onboarded')}\n`) +
      (this.currentProject.status ? 
        chalk.white(`📊 Tasks: ${this.currentProject.status.summary?.completed || 0} completed, ` +
          `${this.currentProject.status.summary?.in_progress || 0} active`) : ''),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'blue',
        title: '📋 Project Status',
        titleAlignment: 'center'
      }
    );

    console.log(statusBox);

    // Show intelligent suggestions if available
    if (this.currentProject.isOnboarded) {
      this.showIntelligentSuggestions();
    }
  }

  private async showIntelligentSuggestions(): Promise<void> {
    if (!this.currentProject) return;

    const suggestions = await this.suggestionEngine.getSuggestions(this.currentProject);
    
    if (suggestions.length > 0) {
      const suggestionsBox = boxen(
        suggestions.map(s => 
          chalk.yellow(`💡 ${s.reason}\n`) +
          chalk.white(`   → ${chalk.cyan(s.agentName)}: ${s.description}`)
        ).join('\n\n'),
        {
          padding: 1,
          margin: { top: 0, bottom: 1, left: 1, right: 1 },
          borderStyle: 'round',
          borderColor: 'yellow',
          title: '💡 Intelligent Suggestions',
          titleAlignment: 'center'
        }
      );

      console.log(suggestionsBox);
    }
  }

  private async promptForAction(): Promise<ActionChoice> {
    const choices = [
      {
        name: '🚀 Start new feature/project',
        value: 'new_feature',
        short: 'New Feature'
      },
      {
        name: '🔧 Fix bugs or improve existing code',
        value: 'improve_code', 
        short: 'Improve Code'
      },
      {
        name: '📚 Generate documentation',
        value: 'documentation',
        short: 'Documentation'
      },
      {
        name: '🏗️  Refactor or optimize',
        value: 'refactor',
        short: 'Refactor'
      },
      {
        name: '🎯 Custom agent workflow',
        value: 'custom',
        short: 'Custom'
      },
      {
        name: '📊 View project dashboard',
        value: 'dashboard',
        short: 'Dashboard'
      },
      new inquirer.Separator(),
      {
        name: '👋 Exit',
        value: 'exit',
        short: 'Exit'
      }
    ];

    const answer = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to accomplish?',
      choices,
      pageSize: 10
    }]);

    return { action: answer.action };
  }

  private async handleAction(action: ActionChoice): Promise<void> {
    switch (action.action) {
      case 'new_feature':
        await this.handleNewFeature();
        break;
      case 'improve_code':
        await this.handleImproveCode();
        break;
      case 'documentation':
        await this.handleDocumentation();
        break;
      case 'refactor':
        await this.handleRefactor();
        break;
      case 'custom':
        await this.handleCustomWorkflow();
        break;
      case 'dashboard':
        await this.launchDashboard();
        break;
    }
  }

  private async handleNewFeature(): Promise<void> {
    console.log(chalk.green('\n🚀 Starting new feature development...\n'));
    
    // Get feature description
    const featurePrompt = await inquirer.prompt([{
      type: 'input',
      name: 'description',
      message: 'Describe your feature idea:',
      validate: (input: string) => input.trim().length > 0 || 'Please provide a description'
    }]);

    console.log(chalk.blue('\n🤔 Analyzing your request...\n'));
    
    // Analyze and suggest agent sequence
    const suggestedSequence = await this.analyzeFeatureAndSuggestSequence(featurePrompt.description);
    
    this.displaySuggestedSequence(suggestedSequence);

    const proceed = await inquirer.prompt([{
      type: 'confirm',
      name: 'start',
      message: `Start with ${chalk.cyan(suggestedSequence[0]?.name || 'first agent')}?`,
      default: true,
    }]);

    if (proceed.start) {
      await this.executeAgentSequence(suggestedSequence, featurePrompt.description);
    }
  }

  private async analyzeFeatureAndSuggestSequence(description: string): Promise<any[]> {
    // Analyze the feature description to suggest appropriate agent sequence
    const keywords = description.toLowerCase();
    
    if (keywords.includes('new') || keywords.includes('create') || keywords.includes('build')) {
      return [
        { name: 'vision-challenger', description: 'Refine and validate the feature idea' },
        { name: 'architecture-designer', description: 'Design technical approach' },
        { name: 'task-folder-generator', description: 'Create implementation tasks' },
        { name: 'task-executor', description: 'Build the feature' }
      ];
    } else if (keywords.includes('improve') || keywords.includes('enhance')) {
      return [
        { name: 'foundation-architect', description: 'Analyze current architecture' },
        { name: 'task-executor', description: 'Implement improvements' },
        { name: 'test-guardian', description: 'Ensure quality gates' }
      ];
    } else {
      return [
        { name: 'vision-challenger', description: 'Clarify requirements' },
        { name: 'task-executor', description: 'Execute development' }
      ];
    }
  }

  private displaySuggestedSequence(sequence: any[]): void {
    const sequenceText = sequence.map((agent, index) => 
      `${chalk.cyan(index + 1)}. ${chalk.white.bold(agent.name)}\n` +
      `   ${chalk.gray('↳')} ${chalk.white(agent.description)}`
    ).join('\n\n');

    const sequenceBox = boxen(
      sequenceText,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green',
        title: '🎯 Recommended Agent Sequence',
        titleAlignment: 'center'
      }
    );

    console.log(sequenceBox);
  }

  private async executeAgentSequence(sequence: any[], context: string): Promise<void> {
    for (let i = 0; i < sequence.length; i++) {
      const agent = sequence[i];
      const isLast = i === sequence.length - 1;

      console.log(chalk.blue(`\n🤖 Launching ${chalk.bold(agent.name)} agent...`));
      console.log(chalk.gray(`   └── ${agent.description}\n`));

      // Spawn agent and monitor progress
      const result = await this.spawnAndMonitorAgent(agent, context);

      if (result.status === 'completed') {
        console.log(chalk.green(`\n✅ ${agent.name} completed successfully\n`));
        
        if (!isLast) {
          const nextAgent = sequence[i + 1];
          console.log(chalk.blue(`🎯 Next recommended: ${chalk.cyan(nextAgent.name)}`));
          
          const continueChoice = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'What would you like to do next?',
            choices: [
              { name: '▶️  Continue with sequence', value: 'continue' },
              { name: '⏭️  Skip to different agent', value: 'skip' },
              { name: '⏸️  Pause and return to main menu', value: 'pause' }
            ]
          }]);

          if (continueChoice.action === 'pause') {
            break;
          } else if (continueChoice.action === 'skip') {
            const availableAgents = this.agentManager.getAvailableAgents();
            const skipChoice = await inquirer.prompt([{
              type: 'list',
              name: 'agent',
              message: 'Which agent would you like to run instead?',
              choices: availableAgents.map(a => ({ name: a.name, value: a }))
            }]);
            sequence[i + 1] = skipChoice.agent;
          }
        }
      } else if (result.status === 'error') {
        console.log(chalk.red(`\n❌ ${agent.name} encountered an error:\n`));
        console.log(chalk.red(result.error || 'Unknown error'));
        
        const errorChoice = await inquirer.prompt([{
          type: 'list',
          name: 'action',
          message: 'How would you like to handle this error?',
          choices: [
            { name: '🔄 Retry this agent', value: 'retry' },
            { name: '⏭️  Skip to next agent', value: 'skip' },
            { name: '🚨 Launch error-manager', value: 'error_manager' },
            { name: '🛑 Stop sequence', value: 'stop' }
          ]
        }]);

        if (errorChoice.action === 'retry') {
          i--; // Retry current agent
        } else if (errorChoice.action === 'error_manager') {
          await this.agentManager.spawnAgent('error-manager', { 
            error: result.error,
            failedAgent: agent.name 
          });
        } else if (errorChoice.action === 'stop') {
          break;
        }
      }
    }

    console.log(chalk.green('\n🎉 Agent sequence completed!\n'));
  }

  private async spawnAndMonitorAgent(agent: any, context: string): Promise<{ status: string, error?: string }> {
    const spinner = ora(`${agent.name} is initializing...`).start();
    
    try {
      // Start progress monitoring
      const monitor = await this.progressMonitor.startMonitoring(agent.name, this.currentProject?.path || '.');
      
      // Spawn the agent
      const result = await this.agentManager.spawnAgent(agent.name, { context }, 'interactive');
      
      // Update spinner based on progress
      monitor.on('progress', (update: string) => {
        spinner.text = `${agent.name}: ${update}`;
      });
      
      monitor.on('completed', () => {
        spinner.succeed(`${agent.name} completed`);
      });
      
      monitor.on('error', (error: string) => {
        spinner.fail(`${agent.name} failed: ${error}`);
      });

      return result;
    } catch (error) {
      spinner.fail(`Failed to spawn ${agent.name}`);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async handleImproveCode(): Promise<void> {
    console.log(chalk.green('\n🔧 Starting code improvement...\n'));
    
    const improvementType = await inquirer.prompt([{
      type: 'list',
      name: 'type',
      message: 'What type of improvement?',
      choices: [
        { name: '🐛 Fix bugs and issues', value: 'bugs' },
        { name: '⚡ Performance optimization', value: 'performance' },
        { name: '🧪 Add or improve tests', value: 'tests' },
        { name: '🏗️  Code refactoring', value: 'refactor' },
        { name: '🔒 Security improvements', value: 'security' }
      ]
    }]);

    const agentSequence = this.getImprovementSequence(improvementType.type);
    await this.executeAgentSequence(agentSequence, `Code improvement: ${improvementType.type}`);
  }

  private getImprovementSequence(type: string): any[] {
    switch (type) {
      case 'bugs':
        return [
          { name: 'error-manager', description: 'Identify and analyze errors' },
          { name: 'task-executor', description: 'Fix identified issues' },
          { name: 'test-guardian', description: 'Ensure fixes work correctly' }
        ];
      case 'performance':
        return [
          { name: 'foundation-architect', description: 'Analyze performance bottlenecks' },
          { name: 'task-executor', description: 'Implement optimizations' },
          { name: 'monitoring-deployer', description: 'Set up performance monitoring' }
        ];
      case 'tests':
        return [
          { name: 'test-guardian', description: 'Analyze test coverage' },
          { name: 'task-executor', description: 'Add missing tests' },
          { name: 'test-guardian', description: 'Validate test quality' }
        ];
      default:
        return [
          { name: 'foundation-architect', description: 'Analyze current code quality' },
          { name: 'task-executor', description: 'Implement improvements' }
        ];
    }
  }

  private async handleDocumentation(): Promise<void> {
    console.log(chalk.green('\n📚 Starting documentation generation...\n'));
    
    const docType = await inquirer.prompt([{
      type: 'list',
      name: 'type',
      message: 'What documentation do you need?',
      choices: [
        { name: '📁 Folder documentation (README files)', value: 'folders' },
        { name: '🤖 AI context documentation', value: 'ai_context' },
        { name: '📖 Project documentation', value: 'project' },
        { name: '🔧 API documentation', value: 'api' }
      ]
    }]);

    const agentSequence = [
      { name: 'folder-documenter', description: 'Generate comprehensive folder documentation' },
      { name: 'ai-context-builder', description: 'Update AI context files' }
    ];

    await this.executeAgentSequence(agentSequence, `Documentation: ${docType.type}`);
  }

  private async handleRefactor(): Promise<void> {
    console.log(chalk.green('\n🏗️  Starting refactoring process...\n'));
    
    const agentSequence = [
      { name: 'foundation-architect', description: 'Analyze current architecture' },
      { name: 'task-folder-generator', description: 'Plan refactoring tasks' },
      { name: 'task-executor', description: 'Execute refactoring' },
      { name: 'test-guardian', description: 'Ensure everything still works' }
    ];

    await this.executeAgentSequence(agentSequence, 'Code refactoring');
  }

  private async handleCustomWorkflow(): Promise<void> {
    console.log(chalk.green('\n🎯 Building custom agent workflow...\n'));
    
    const availableAgents = this.agentManager.getAvailableAgents();
    
    const selectedAgents = await inquirer.prompt([{
      type: 'checkbox',
      name: 'agents',
      message: 'Select agents for your custom workflow:',
      choices: availableAgents.map(agent => ({
        name: `${agent.name} - ${agent.description}`,
        value: agent
      })),
      validate: (choices) => choices.length > 0 || 'Please select at least one agent'
    }]);

    await this.executeAgentSequence(selectedAgents.agents, 'Custom workflow');
  }

  private async launchDashboard(): Promise<void> {
    console.log(chalk.green('\n📊 Launching project dashboard...\n'));
    
    // This would integrate with the dashboard system
    console.log(chalk.blue('Dashboard functionality would be implemented here'));
    console.log(chalk.gray('Press any key to return to main menu...'));
    
    await inquirer.prompt([{
      type: 'input',
      name: 'continue',
      message: ''
    }]);
  }

  private async runOnboarding(): Promise<void> {
    const spinner = ora('Onboarding repository to agent system...').start();
    
    try {
      await this.projectAnalyzer.onboardProject(this.config.projectPath);
      spinner.succeed('Repository onboarded successfully!');
      
      // Reload project context
      this.currentProject = await this.analyzeCurrentDirectory();
    } catch (error) {
      spinner.fail('Onboarding failed');
      throw error;
    }
  }
}