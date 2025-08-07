#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { InteractiveOrchestrator } from './orchestrator/InteractiveOrchestrator.js';
import { AgentManager } from './agents/AgentManager.js';
import { ProjectAnalyzer } from './analyzer/ProjectAnalyzer.js';
import { DashboardLauncher } from './dashboard/DashboardLauncher.js';

const program = new Command();

// ASCII Art Banner
function displayBanner() {
  const banner = figlet.textSync('Claude Agents', { 
    font: 'ANSI Shadow',
    horizontalLayout: 'fitted'
  });
  
  console.log(gradient.pastel.multiline(banner));
  console.log(chalk.blue.bold('🤖 Interactive Agent Orchestration System'));
  console.log(chalk.gray('Transform any codebase with AI agent coordination\n'));
}

program
  .name('claude-agents')
  .description('Interactive CLI for Claude Code Agent System orchestration')
  .version('1.0.0');

// Interactive mode (default)
program
  .command('interactive', { isDefault: true })
  .alias('i')
  .description('Launch interactive agent orchestrator')
  .option('-p, --project <path>', 'Project path', process.cwd())
  .option('--skip-onboarding', 'Skip onboarding check')
  .action(async (options) => {
    displayBanner();
    
    const orchestrator = new InteractiveOrchestrator({
      projectPath: options.project,
      skipOnboarding: options.skipOnboarding
    });
    
    await orchestrator.start();
  });

// Direct agent spawning
program
  .command('spawn <agent>')
  .description('Spawn a specific agent directly')
  .option('-c, --context <json>', 'Agent context as JSON')
  .option('-m, --mode <mode>', 'Execution mode', 'interactive')
  .action(async (agentName, options) => {
    displayBanner();
    
    const agentManager = new AgentManager();
    const context = options.context ? JSON.parse(options.context) : undefined;
    
    await agentManager.spawnAgent(agentName, context, options.mode);
  });

// Project analysis
program
  .command('analyze')
  .description('Analyze project and suggest agents')
  .option('-p, --project <path>', 'Project path', process.cwd())
  .option('-o, --output <format>', 'Output format', 'console')
  .action(async (options) => {
    const analyzer = new ProjectAnalyzer();
    const analysis = await analyzer.analyze(options.project);
    
    if (options.output === 'json') {
      console.log(JSON.stringify(analysis, null, 2));
    } else {
      analyzer.displayAnalysis(analysis);
    }
  });

// Dashboard
program
  .command('dashboard')
  .alias('dash')
  .description('Launch project monitoring dashboard')
  .option('-p, --project <path>', 'Project path', process.cwd())
  .option('--port <port>', 'Dashboard port', '3000')
  .action(async (options) => {
    const dashboard = new DashboardLauncher();
    await dashboard.launch({
      projectPath: options.project,
      port: parseInt(options.port)
    });
  });

// Onboarding
program
  .command('onboard')
  .description('Onboard repository to agent system')
  .option('-p, --project <path>', 'Project path', process.cwd())
  .option('-f, --force', 'Force re-onboarding')
  .action(async (options) => {
    displayBanner();
    
    const analyzer = new ProjectAnalyzer();
    await analyzer.onboardProject(options.project, options.force);
  });

// Status and health check
program
  .command('status')
  .description('Show project and agent system status')
  .option('-p, --project <path>', 'Project path', process.cwd())
  .action(async (options) => {
    const analyzer = new ProjectAnalyzer();
    const status = await analyzer.getProjectStatus(options.project);
    analyzer.displayStatus(status);
  });

// Agent sequence management  
program
  .command('sequence <action>')
  .description('Manage agent sequences')
  .option('-n, --name <name>', 'Sequence name')
  .option('-a, --agents <agents>', 'Comma-separated agent list')
  .action(async (action, options) => {
    const agentManager = new AgentManager();
    
    switch (action) {
      case 'create':
        await agentManager.createSequence(options.name, options.agents.split(','));
        break;
      case 'run':
        await agentManager.runSequence(options.name);
        break;
      case 'list':
        await agentManager.listSequences();
        break;
      default:
        console.log(chalk.red(`Unknown sequence action: ${action}`));
    }
  });

// Error handling
program.exitOverride((err) => {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  
  console.error(chalk.red('❌ Error:'), err.message);
  process.exit(1);
});

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
  console.error(chalk.red('❌ Unhandled Promise Rejection:'), err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error(chalk.red('❌ Uncaught Exception:'), err);
  process.exit(1);
});

// Parse arguments
program.parse();

export { program };