import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

interface ProjectContext {
  path: string;
  name: string;
  manifesto?: string;
  compatibility?: any;
  status?: any;
  isOnboarded: boolean;
}

interface AgentSuggestion {
  agentName: string;
  reason: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  context?: any;
}

interface GitAnalysis {
  recentCommits: number;
  uncommittedChanges: boolean;
  branchInfo: string;
  lastCommitTime: Date;
}

interface CodebaseAnalysis {
  fileCount: number;
  hasTests: boolean;
  testCoverage?: number;
  hasDocumentation: boolean;
  recentlyModifiedFiles: string[];
  languageBreakdown: Record<string, number>;
}

export class AgentSuggestionEngine {
  private gitAnalysisCache = new Map<string, GitAnalysis>();
  private codebaseAnalysisCache = new Map<string, CodebaseAnalysis>();
  
  async getSuggestions(project: ProjectContext): Promise<AgentSuggestion[]> {
    const suggestions: AgentSuggestion[] = [];
    
    // Get various analyses
    const gitAnalysis = await this.analyzeGitRepository(project.path);
    const codebaseAnalysis = await this.analyzeCodebase(project.path);
    const taskStatus = this.analyzeTaskStatus(project.status);
    
    // Generate suggestions based on different criteria
    suggestions.push(...this.suggestBasedOnGitActivity(gitAnalysis));
    suggestions.push(...this.suggestBasedOnCodebase(codebaseAnalysis));
    suggestions.push(...this.suggestBasedOnTaskStatus(taskStatus));
    suggestions.push(...this.suggestBasedOnProjectStage(project));
    
    // Sort by priority and confidence
    return suggestions
      .sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      })
      .slice(0, 3); // Return top 3 suggestions
  }

  private async analyzeGitRepository(projectPath: string): Promise<GitAnalysis> {
    const cacheKey = projectPath;
    if (this.gitAnalysisCache.has(cacheKey)) {
      return this.gitAnalysisCache.get(cacheKey)!;
    }

    const analysis: GitAnalysis = {
      recentCommits: 0,
      uncommittedChanges: false,
      branchInfo: 'main',
      lastCommitTime: new Date()
    };

    if (!existsSync(join(projectPath, '.git'))) {
      this.gitAnalysisCache.set(cacheKey, analysis);
      return analysis;
    }

    try {
      // Get recent commit count (last 7 days)
      const recentCommitsResult = await this.execGitCommand(
        projectPath, 
        ['log', '--since=7 days ago', '--oneline']
      );
      analysis.recentCommits = recentCommitsResult.split('\n').filter(line => line.trim()).length;

      // Check for uncommitted changes
      const statusResult = await this.execGitCommand(projectPath, ['status', '--porcelain']);
      analysis.uncommittedChanges = statusResult.trim().length > 0;

      // Get current branch
      const branchResult = await this.execGitCommand(projectPath, ['branch', '--show-current']);
      analysis.branchInfo = branchResult.trim() || 'main';

      // Get last commit time
      const lastCommitResult = await this.execGitCommand(
        projectPath, 
        ['log', '-1', '--format=%ci']
      );
      if (lastCommitResult.trim()) {
        analysis.lastCommitTime = new Date(lastCommitResult.trim());
      }

    } catch (error) {
      // Git commands failed, use defaults
    }

    this.gitAnalysisCache.set(cacheKey, analysis);
    return analysis;
  }

  private async execGitCommand(cwd: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('git', args, { cwd, stdio: 'pipe' });
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => stdout += data.toString());
      process.stderr.on('data', (data) => stderr += data.toString());

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Git command failed: ${stderr}`));
        }
      });
    });
  }

  private async analyzeCodebase(projectPath: string): Promise<CodebaseAnalysis> {
    const cacheKey = projectPath;
    if (this.codebaseAnalysisCache.has(cacheKey)) {
      return this.codebaseAnalysisCache.get(cacheKey)!;
    }

    const analysis: CodebaseAnalysis = {
      fileCount: 0,
      hasTests: false,
      hasDocumentation: false,
      recentlyModifiedFiles: [],
      languageBreakdown: {}
    };

    try {
      // Count files and analyze languages
      const files = this.getAllFiles(projectPath);
      analysis.fileCount = files.length;
      
      for (const file of files) {
        const ext = file.split('.').pop()?.toLowerCase() || '';
        analysis.languageBreakdown[ext] = (analysis.languageBreakdown[ext] || 0) + 1;
        
        // Check for test files
        if (file.includes('test') || file.includes('spec') || ext === 'test') {
          analysis.hasTests = true;
        }
        
        // Check for documentation
        if (file.toLowerCase().includes('readme') || ext === 'md') {
          analysis.hasDocumentation = true;
        }
        
        // Check for recently modified files (last 3 days)
        try {
          const stats = statSync(join(projectPath, file));
          const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
          if (stats.mtime > threeDaysAgo) {
            analysis.recentlyModifiedFiles.push(file);
          }
        } catch {
          // File might not exist anymore
        }
      }

      // Try to detect test coverage if package.json exists
      const packageJsonPath = join(projectPath, 'package.json');
      if (existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
          if (packageJson.scripts?.['test:coverage'] || packageJson.devDependencies?.['jest']) {
            // Could potentially run coverage analysis here
          }
        } catch {
          // Invalid package.json
        }
      }

    } catch (error) {
      // Analysis failed, use defaults
    }

    this.codebaseAnalysisCache.set(cacheKey, analysis);
    return analysis;
  }

  private getAllFiles(dirPath: string, maxFiles: number = 1000): string[] {
    const files: string[] = [];
    const excluded = new Set(['.git', 'node_modules', 'dist', 'build', 'target', '.next']);
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      function traverse(currentPath: string, relativePath: string = '') {
        if (files.length >= maxFiles) return;
        
        const items = fs.readdirSync(currentPath);
        
        for (const item of items) {
          if (files.length >= maxFiles) break;
          if (excluded.has(item) || item.startsWith('.')) continue;
          
          const fullPath = path.join(currentPath, item);
          const relativeItemPath = path.join(relativePath, item);
          
          try {
            const stats = fs.statSync(fullPath);
            if (stats.isFile()) {
              files.push(relativeItemPath);
            } else if (stats.isDirectory()) {
              traverse(fullPath, relativeItemPath);
            }
          } catch {
            // Skip inaccessible files/directories
          }
        }
      }
      
      traverse(dirPath);
    } catch (error) {
      // Directory traversal failed
    }
    
    return files;
  }

  private analyzeTaskStatus(status: any): any {
    if (!status?.summary) return { hasActiveTasks: false, errorCount: 0, completionRate: 0 };
    
    return {
      hasActiveTasks: status.summary.in_progress > 0,
      errorCount: status.summary.errored || 0,
      completionRate: status.summary.total_tasks > 0 ? 
        status.summary.completed / status.summary.total_tasks : 0,
      blockedTasks: status.summary.blocked || 0
    };
  }

  private suggestBasedOnGitActivity(gitAnalysis: GitAnalysis): AgentSuggestion[] {
    const suggestions: AgentSuggestion[] = [];
    
    // High activity suggests need for documentation
    if (gitAnalysis.recentCommits > 10) {
      suggestions.push({
        agentName: 'folder-documenter',
        reason: `High recent activity (${gitAnalysis.recentCommits} commits in 7 days)`,
        description: 'Generate documentation for recent changes',
        confidence: 0.8,
        priority: 'medium'
      });
    }
    
    // Uncommitted changes suggest need for task execution
    if (gitAnalysis.uncommittedChanges) {
      suggestions.push({
        agentName: 'task-executor',
        reason: 'Uncommitted changes detected',
        description: 'Help organize and commit your current work',
        confidence: 0.7,
        priority: 'high'
      });
    }
    
    // Stale repository suggests refactoring
    const daysSinceLastCommit = Math.floor(
      (Date.now() - gitAnalysis.lastCommitTime.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastCommit > 30) {
      suggestions.push({
        agentName: 'foundation-architect',
        reason: `No commits in ${daysSinceLastCommit} days`,
        description: 'Analyze and improve codebase architecture',
        confidence: 0.6,
        priority: 'low'
      });
    }
    
    return suggestions;
  }

  private suggestBasedOnCodebase(codebase: CodebaseAnalysis): AgentSuggestion[] {
    const suggestions: AgentSuggestion[] = [];
    
    // Low test coverage suggests test-guardian
    if (!codebase.hasTests || (codebase.testCoverage && codebase.testCoverage < 0.8)) {
      suggestions.push({
        agentName: 'test-guardian',
        reason: codebase.hasTests ? 
          `Low test coverage (${Math.round((codebase.testCoverage || 0) * 100)}%)` :
          'No tests detected',
        description: 'Add comprehensive test coverage',
        confidence: 0.9,
        priority: 'high'
      });
    }
    
    // Missing documentation suggests folder-documenter
    if (!codebase.hasDocumentation) {
      suggestions.push({
        agentName: 'folder-documenter',
        reason: 'Missing documentation',
        description: 'Generate comprehensive folder documentation',
        confidence: 0.8,
        priority: 'medium'
      });
    }
    
    // Recent file changes suggest need for review
    if (codebase.recentlyModifiedFiles.length > 10) {
      suggestions.push({
        agentName: 'foundation-architect',
        reason: `Many recent file changes (${codebase.recentlyModifiedFiles.length} files)`,
        description: 'Review architecture and ensure consistency',
        confidence: 0.7,
        priority: 'medium'
      });
    }
    
    // Large codebase without proper structure
    if (codebase.fileCount > 100 && !codebase.hasDocumentation) {
      suggestions.push({
        agentName: 'ai-context-builder',
        reason: `Large codebase (${codebase.fileCount} files) without AI context`,
        description: 'Create AI context documentation for better navigation',
        confidence: 0.8,
        priority: 'medium'
      });
    }
    
    return suggestions;
  }

  private suggestBasedOnTaskStatus(taskStatus: any): AgentSuggestion[] {
    const suggestions: AgentSuggestion[] = [];
    
    // Active errors suggest error-manager
    if (taskStatus.errorCount > 0) {
      suggestions.push({
        agentName: 'error-manager',
        reason: `${taskStatus.errorCount} failed tasks need attention`,
        description: 'Resolve failed tasks and clear error queue',
        confidence: 0.9,
        priority: 'high'
      });
    }
    
    // Blocked tasks suggest task-executor
    if (taskStatus.blockedTasks > 0) {
      suggestions.push({
        agentName: 'task-executor',
        reason: `${taskStatus.blockedTasks} blocked tasks detected`,
        description: 'Resolve blocked tasks and continue progress',
        confidence: 0.8,
        priority: 'high'
      });
    }
    
    // Low completion rate suggests foundation issues
    if (taskStatus.completionRate > 0 && taskStatus.completionRate < 0.3) {
      suggestions.push({
        agentName: 'foundation-architect',
        reason: `Low task completion rate (${Math.round(taskStatus.completionRate * 100)}%)`,
        description: 'Analyze and fix foundational issues blocking progress',
        confidence: 0.7,
        priority: 'medium'
      });
    }
    
    return suggestions;
  }

  private suggestBasedOnProjectStage(project: ProjectContext): AgentSuggestion[] {
    const suggestions: AgentSuggestion[] = [];
    
    // Analyze project stage from compatibility map
    const stage = project.compatibility?.['Repository Profile']?.['Development Stage']?.toLowerCase() || '';
    
    if (stage.includes('production')) {
      suggestions.push({
        agentName: 'monitoring-deployer',
        reason: 'Production system needs comprehensive monitoring',
        description: 'Set up advanced monitoring and alerting',
        confidence: 0.8,
        priority: 'high'
      });
    } else if (stage.includes('mvp') || stage.includes('beta')) {
      suggestions.push({
        agentName: 'test-guardian',
        reason: 'MVP/Beta stage needs solid testing foundation',
        description: 'Establish comprehensive testing before scaling',
        confidence: 0.8,
        priority: 'high'
      });
    } else if (stage.includes('early') || stage.includes('proof')) {
      suggestions.push({
        agentName: 'vision-challenger',
        reason: 'Early stage project could benefit from vision refinement',
        description: 'Validate and refine project concept and goals',
        confidence: 0.7,
        priority: 'medium'
      });
    }
    
    // Check framework-specific suggestions
    const framework = project.compatibility?.['Repository Profile']?.['Primary Framework']?.toLowerCase() || '';
    
    if (framework.includes('react') || framework.includes('next')) {
      suggestions.push({
        agentName: 'design-system-creator',
        reason: 'React/Next.js projects benefit from design systems',
        description: 'Create consistent design system and component library',
        confidence: 0.6,
        priority: 'low'
      });
    }
    
    return suggestions;
  }

  // Public method for getting agent-specific suggestions
  async getSuggestionForContext(context: string, projectPath: string): Promise<AgentSuggestion[]> {
    const suggestions: AgentSuggestion[] = [];
    const keywords = context.toLowerCase();
    
    // Keyword-based agent suggestions
    const agentMappings: Record<string, { agents: string[], confidence: number }> = {
      'bug|error|fix|issue': {
        agents: ['error-manager', 'test-guardian'],
        confidence: 0.9
      },
      'test|testing|coverage': {
        agents: ['test-guardian'],
        confidence: 0.9
      },
      'document|readme|docs': {
        agents: ['folder-documenter', 'ai-context-builder'],
        confidence: 0.8
      },
      'performance|optimize|speed': {
        agents: ['foundation-architect', 'monitoring-deployer'],
        confidence: 0.8
      },
      'deploy|deployment|production': {
        agents: ['devops-automator', 'monitoring-deployer'],
        confidence: 0.8
      },
      'auth|authentication|login': {
        agents: ['clerk-deployer', 'architecture-designer'],
        confidence: 0.8
      },
      'payment|stripe|checkout': {
        agents: ['stripe-deployer', 'architecture-designer'],
        confidence: 0.8
      },
      'new|create|build|feature': {
        agents: ['vision-challenger', 'architecture-designer', 'task-folder-generator'],
        confidence: 0.7
      }
    };

    for (const [pattern, mapping] of Object.entries(agentMappings)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(keywords)) {
        for (const agentName of mapping.agents) {
          suggestions.push({
            agentName,
            reason: `Context matches "${pattern.split('|')[0]}" pattern`,
            description: this.getAgentDescription(agentName),
            confidence: mapping.confidence,
            priority: mapping.confidence > 0.8 ? 'high' : 'medium'
          });
        }
      }
    }

    return suggestions.slice(0, 5); // Limit to top 5 context-based suggestions
  }

  private getAgentDescription(agentName: string): string {
    const descriptions: Record<string, string> = {
      'vision-challenger': 'Stress-test and refine raw concepts',
      'manifesto-generator': 'Create project-specific manifesto with core principles',
      'prd-generator': 'Transform refined concepts into complete PRDs',
      'architecture-designer': 'Design technical architecture from PRD',
      'stack-analyzer': 'Research and recommend optimal tech stack',
      'implementation-planner': 'Create detailed implementation plans',
      'foundation-architect': 'Design the shared foundation layer',
      'build-sequencer': 'Create exact build order with sprint-based plan',
      'task-spec-builder': 'Create detailed task specifications',
      'task-folder-generator': 'Create complete TASKS/ directory structure',
      'task-manager': 'Initialize and maintain the task management system',
      'design-system-creator': 'Create comprehensive design system',
      'ai-context-builder': 'Create .claude folder for AI assistance',
      'journal-keeper': 'Document the development journey',
      'docs-fetcher': 'Download and cache latest documentation',
      'task-executor': 'Execute tasks from TASKS/ folder',
      'vertical-slice-builder': 'Build the critical first path',
      'test-guardian': 'Ensure quality gates are met',
      'folder-documenter': 'Generate comprehensive folder documentation',
      'admin-console-builder': 'Create self-managing admin interface',
      'setup-wizard-creator': 'Build zero-friction onboarding',
      'devops-automator': 'Automate deployment and operations',
      'service-analyzer': 'Analyze project requirements and determine needed services',
      'stripe-deployer': 'Fully configure and deploy Stripe payment processing',
      'clerk-deployer': 'Deploy and configure Clerk authentication',
      'email-deployer': 'Set up email service integration',
      'database-deployer': 'Deploy and configure database services',
      'monitoring-deployer': 'Set up monitoring and analytics',
      'error-manager': 'Specialized agent for resolving stuck/errored tasks'
    };

    return descriptions[agentName] || `Execute ${agentName} functionality`;
  }

  // Clear cache when needed
  clearCache(): void {
    this.gitAnalysisCache.clear();
    this.codebaseAnalysisCache.clear();
  }
}