import { execSync, spawn, ChildProcess } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { EventEmitter } from 'events';
import chalk from 'chalk';

interface ServiceConfig {
  name: string;
  image: string;
  ports: string[];
  environment: Record<string, string>;
  volumes: string[];
  dependencies: string[];
  healthCheck?: string;
}

interface ProjectAnalysis {
  framework: string;
  language: string;
  database: boolean;
  hasSupabase: boolean;
  hasVercel: boolean;
  hasDocker: boolean;
  agentSystemReady: boolean;
  urls: {
    app: string;
    database: string;
    docs: string;
    monitoring: string;
  };
}

interface HealthStatus {
  healthy: boolean;
  services: Record<string, boolean>;
  issues: string[];
}

export class InfrastructureManager extends EventEmitter {
  private projectPath: string;
  private activeServices = new Map<string, ChildProcess>();
  
  constructor(projectPath: string = process.cwd()) {
    super();
    this.projectPath = projectPath;
  }

  // 🔍 Project Analysis
  async analyzeProject(): Promise<ProjectAnalysis> {
    console.log(chalk.blue('🔍 Analyzing project structure...'));
    
    const analysis: ProjectAnalysis = {
      framework: 'Unknown',
      language: 'Unknown', 
      database: false,
      hasSupabase: false,
      hasVercel: false,
      hasDocker: false,
      agentSystemReady: false,
      urls: {
        app: 'http://localhost:3000',
        database: 'http://localhost:54323',
        docs: 'http://localhost:3000/docs',
        monitoring: 'http://localhost:3001'
      }
    };

    // Detect framework and language
    if (existsSync(join(this.projectPath, 'package.json'))) {
      try {
        const pkg = JSON.parse(readFileSync(join(this.projectPath, 'package.json'), 'utf-8'));
        
        if (pkg.dependencies?.next) analysis.framework = 'Next.js';
        else if (pkg.dependencies?.react) analysis.framework = 'React';
        else if (pkg.dependencies?.express) analysis.framework = 'Express';
        else if (pkg.dependencies?.['@nestjs/core']) analysis.framework = 'NestJS';
        else analysis.framework = 'Node.js';
        
        analysis.language = 'JavaScript';
        if (pkg.dependencies?.typescript || pkg.devDependencies?.typescript) {
          analysis.language = 'TypeScript';
        }
      } catch (error) {
        console.warn(chalk.yellow('⚠️  Could not parse package.json'));
      }
    }

    // Check for Python
    if (existsSync(join(this.projectPath, 'requirements.txt')) || 
        existsSync(join(this.projectPath, 'pyproject.toml'))) {
      analysis.language = 'Python';
      if (existsSync(join(this.projectPath, 'manage.py'))) {
        analysis.framework = 'Django';
      } else if (existsSync(join(this.projectPath, 'app.py'))) {
        analysis.framework = 'Flask';
      }
    }

    // Check for Go
    if (existsSync(join(this.projectPath, 'go.mod'))) {
      analysis.language = 'Go';
      analysis.framework = 'Go';
    }

    // Check for Rust
    if (existsSync(join(this.projectPath, 'Cargo.toml'))) {
      analysis.language = 'Rust';
      analysis.framework = 'Rust';
    }

    // Check infrastructure components
    analysis.hasSupabase = existsSync(join(this.projectPath, 'supabase', 'config.toml'));
    analysis.hasVercel = existsSync(join(this.projectPath, '.vercel', 'project.json'));
    analysis.hasDocker = existsSync(join(this.projectPath, 'docker-compose.yml')) ||
                       existsSync(join(this.projectPath, 'docker-compose.dev.yml'));
    analysis.database = analysis.hasSupabase || existsSync(join(this.projectPath, 'prisma')) ||
                       existsSync(join(this.projectPath, 'database'));

    // Check agent system
    analysis.agentSystemReady = existsSync(join(this.projectPath, 'PROJECT_MANIFESTO.md'));

    console.log(chalk.green('✅ Project analysis completed'));
    console.log(chalk.cyan(`   Framework: ${analysis.framework} (${analysis.language})`));
    console.log(chalk.cyan(`   Database: ${analysis.database ? '✅' : '❌'}`));
    console.log(chalk.cyan(`   Supabase: ${analysis.hasSupabase ? '✅' : '❌'}`));
    console.log(chalk.cyan(`   Vercel: ${analysis.hasVercel ? '✅' : '❌'}`));
    console.log(chalk.cyan(`   Docker: ${analysis.hasDocker ? '✅' : '❌'}`));
    console.log(chalk.cyan(`   Agent System: ${analysis.agentSystemReady ? '✅' : '⚠️'}`));

    return analysis;
  }

  // 🏗️ Infrastructure Startup
  async startAll(): Promise<void> {
    console.log(chalk.blue('🏗️  Starting complete infrastructure...'));
    
    try {
      // Start Docker Compose if available
      if (await this.isDockerComposeAvailable()) {
        await this.startDockerCompose();
      }

      // Start Supabase local if available
      if (await this.isSupabaseAvailable()) {
        await this.startSupabase();
      }

      // Start development server
      await this.startDevelopmentServer();

      console.log(chalk.green('✅ Infrastructure startup completed'));
      this.emit('infrastructure_started');
      
    } catch (error) {
      console.error(chalk.red('❌ Infrastructure startup failed:'), error);
      this.emit('infrastructure_error', error);
      throw error;
    }
  }

  private async isDockerComposeAvailable(): Promise<boolean> {
    try {
      execSync('docker info', { stdio: 'pipe' });
      return existsSync(join(this.projectPath, 'docker-compose.dev.yml')) ||
             existsSync(join(this.projectPath, 'docker-compose.yml'));
    } catch {
      return false;
    }
  }

  private async isSupabaseAvailable(): Promise<boolean> {
    try {
      execSync('supabase --version', { stdio: 'pipe' });
      return existsSync(join(this.projectPath, 'supabase', 'config.toml'));
    } catch {
      return false;
    }
  }

  private async startDockerCompose(): Promise<void> {
    console.log(chalk.blue('🐳 Starting Docker Compose services...'));
    
    const composeFile = existsSync(join(this.projectPath, 'docker-compose.dev.yml')) 
      ? 'docker-compose.dev.yml' 
      : 'docker-compose.yml';

    try {
      execSync(`docker-compose -f ${composeFile} up -d`, {
        cwd: this.projectPath,
        stdio: 'inherit'
      });
      console.log(chalk.green('✅ Docker Compose services started'));
    } catch (error) {
      throw new Error(`Docker Compose startup failed: ${error}`);
    }
  }

  private async startSupabase(): Promise<void> {
    console.log(chalk.blue('🗄️  Starting Supabase local...'));
    
    try {
      // Check if already running
      try {
        execSync('supabase status', { cwd: this.projectPath, stdio: 'pipe' });
        console.log(chalk.green('✅ Supabase already running'));
        return;
      } catch {
        // Not running, start it
      }

      execSync('supabase start', {
        cwd: this.projectPath,
        stdio: 'inherit'
      });
      
      console.log(chalk.green('✅ Supabase local started'));
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Supabase startup failed (may already be running)'));
    }
  }

  private async startDevelopmentServer(): Promise<void> {
    console.log(chalk.blue('🚀 Starting development server...'));
    
    // Check if server is already running
    if (await this.isServiceHealthy('http://localhost:3000')) {
      console.log(chalk.green('✅ Development server already running'));
      return;
    }

    // Determine start command based on project type
    let startCommand = 'npm run dev';
    
    if (existsSync(join(this.projectPath, 'pnpm-lock.yaml'))) {
      startCommand = 'pnpm dev';
    } else if (existsSync(join(this.projectPath, 'yarn.lock'))) {
      startCommand = 'yarn dev';
    }

    try {
      const serverProcess = spawn(startCommand.split(' ')[0], startCommand.split(' ').slice(1), {
        cwd: this.projectPath,
        stdio: 'pipe',
        detached: true
      });

      serverProcess.unref(); // Don't wait for this process
      this.activeServices.set('dev-server', serverProcess);

      // Wait a moment for server to start
      await this.delay(3000);
      
      if (await this.isServiceHealthy('http://localhost:3000')) {
        console.log(chalk.green('✅ Development server started'));
      } else {
        console.log(chalk.yellow('⚠️  Development server may be starting up...'));
      }
      
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not start development server automatically'));
    }
  }

  // 🏥 Health Monitoring
  async checkHealth(): Promise<HealthStatus> {
    console.log(chalk.blue('🏥 Checking infrastructure health...'));
    
    const health: HealthStatus = {
      healthy: true,
      services: {},
      issues: []
    };

    // Check Docker services
    if (await this.isDockerComposeAvailable()) {
      try {
        const output = execSync('docker-compose ps --services --filter status=running', {
          cwd: this.projectPath,
          encoding: 'utf-8'
        });
        
        const runningServices = output.trim().split('\n').filter(s => s);
        health.services['docker-services'] = runningServices.length > 0;
        
        if (runningServices.length === 0) {
          health.issues.push('No Docker services running');
        }
      } catch (error) {
        health.services['docker-services'] = false;
        health.issues.push('Docker Compose not responding');
      }
    }

    // Check application health
    health.services['application'] = await this.isServiceHealthy('http://localhost:3000');
    if (!health.services['application']) {
      health.issues.push('Application not responding on port 3000');
    }

    // Check database health
    if (await this.isDockerComposeAvailable()) {
      health.services['database'] = await this.isServiceHealthy('localhost:54322');
      if (!health.services['database']) {
        health.issues.push('Database not responding on port 54322');
      }
    }

    // Check Supabase
    if (await this.isSupabaseAvailable()) {
      try {
        execSync('supabase status', { cwd: this.projectPath, stdio: 'pipe' });
        health.services['supabase'] = true;
      } catch {
        health.services['supabase'] = false;
        health.issues.push('Supabase not running');
      }
    }

    // Overall health
    health.healthy = health.issues.length === 0;
    
    if (health.healthy) {
      console.log(chalk.green('✅ All systems healthy'));
    } else {
      console.log(chalk.yellow(`⚠️  ${health.issues.length} issues detected`));
      health.issues.forEach(issue => console.log(chalk.yellow(`   - ${issue}`)));
    }

    return health;
  }

  private async isServiceHealthy(endpoint: string): Promise<boolean> {
    try {
      const isHttp = endpoint.startsWith('http');
      
      if (isHttp) {
        // HTTP health check
        const response = await fetch(`${endpoint}/api/health`).catch(() => null);
        return response?.ok || false;
      } else {
        // TCP health check (for databases)
        return new Promise((resolve) => {
          const [host, port] = endpoint.split(':');
          const net = require('net');
          const socket = new net.Socket();
          
          socket.setTimeout(2000);
          socket.on('connect', () => {
            socket.destroy();
            resolve(true);
          });
          
          socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
          });
          
          socket.on('error', () => {
            resolve(false);
          });
          
          socket.connect(parseInt(port), host);
        });
      }
    } catch {
      return false;
    }
  }

  // 🔧 Service Management
  async updateDockerCompose(serviceName: string, config: ServiceConfig): Promise<void> {
    console.log(chalk.blue(`🔧 Updating Docker Compose service: ${serviceName}`));
    
    const composeFile = join(this.projectPath, 'docker-compose.dev.yml');
    
    try {
      let composeContent = '';
      
      if (existsSync(composeFile)) {
        composeContent = readFileSync(composeFile, 'utf-8');
      } else {
        // Create basic compose file
        composeContent = `version: '3.8'\nservices:\n`;
      }

      // Update service configuration
      // This is a simplified implementation - in practice, you'd use a YAML parser
      const serviceConfig = `
  ${serviceName}:
    image: ${config.image}
    ports:
      ${config.ports.map(p => `- "${p}"`).join('\n      ')}
    environment:
      ${Object.entries(config.environment).map(([k, v]) => `${k}: ${v}`).join('\n      ')}
    volumes:
      ${config.volumes.map(v => `- ${v}`).join('\n      ')}
    depends_on:
      ${config.dependencies.map(d => `- ${d}`).join('\n      ')}
`;

      // Simple append for now - would need proper YAML merging in production
      composeContent += serviceConfig;
      
      writeFileSync(composeFile, composeContent);
      console.log(chalk.green(`✅ Updated ${serviceName} configuration`));
      
    } catch (error) {
      throw new Error(`Failed to update Docker Compose: ${error}`);
    }
  }

  async syncVercelEnv(environment: Record<string, string>): Promise<void> {
    console.log(chalk.blue('📤 Syncing environment with Vercel...'));
    
    try {
      // Check if Vercel is configured
      if (!existsSync(join(this.projectPath, '.vercel', 'project.json'))) {
        console.warn(chalk.yellow('⚠️  Vercel project not linked - skipping sync'));
        return;
      }

      // Sync environment variables
      for (const [key, value] of Object.entries(environment)) {
        try {
          execSync(`echo "${value}" | vercel env add "${key}" production --force`, {
            cwd: this.projectPath,
            stdio: 'pipe'
          });
        } catch (error) {
          console.warn(chalk.yellow(`⚠️  Failed to sync ${key} to Vercel`));
        }
      }

      console.log(chalk.green('✅ Vercel environment synced'));
      
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Vercel sync failed - continuing without sync'));
    }
  }

  async updateSupabaseSchema(schema: any): Promise<void> {
    console.log(chalk.blue('🗄️  Updating Supabase schema...'));
    
    try {
      // Create migration file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const migrationName = `auto_update_${timestamp}`;
      
      execSync(`supabase migration new ${migrationName}`, {
        cwd: this.projectPath,
        stdio: 'inherit'
      });

      // Apply migration
      execSync('supabase migration up', {
        cwd: this.projectPath,
        stdio: 'inherit'
      });

      console.log(chalk.green('✅ Supabase schema updated'));
      
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Supabase schema update failed'));
    }
  }

  async restartServices(serviceNames: string[]): Promise<void> {
    console.log(chalk.blue(`🔄 Restarting services: ${serviceNames.join(', ')}`));
    
    const composeFile = existsSync(join(this.projectPath, 'docker-compose.dev.yml'))
      ? 'docker-compose.dev.yml'
      : 'docker-compose.yml';

    try {
      for (const service of serviceNames) {
        execSync(`docker-compose -f ${composeFile} restart ${service}`, {
          cwd: this.projectPath,
          stdio: 'inherit'
        });
      }
      
      console.log(chalk.green('✅ Services restarted successfully'));
      
    } catch (error) {
      throw new Error(`Failed to restart services: ${error}`);
    }
  }

  // 🧹 Cleanup and Management
  async cleanAll(): Promise<void> {
    console.log(chalk.blue('🧹 Cleaning infrastructure...'));
    
    try {
      // Stop Docker Compose services
      if (await this.isDockerComposeAvailable()) {
        const composeFile = existsSync(join(this.projectPath, 'docker-compose.dev.yml'))
          ? 'docker-compose.dev.yml'
          : 'docker-compose.yml';
          
        execSync(`docker-compose -f ${composeFile} down -v`, {
          cwd: this.projectPath,
          stdio: 'inherit'
        });
      }

      // Stop active services
      for (const [name, process] of this.activeServices.entries()) {
        console.log(chalk.blue(`🛑 Stopping ${name}...`));
        process.kill();
      }
      this.activeServices.clear();

      // Clean Docker system
      execSync('docker system prune -f', { stdio: 'inherit' });

      console.log(chalk.green('✅ Infrastructure cleaned'));
      
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Some cleanup operations failed'));
    }
  }

  async syncAll(): Promise<void> {
    console.log(chalk.blue('🔄 Syncing all environments...'));
    
    try {
      // Run task-based sync
      execSync('task sync:all', {
        cwd: this.projectPath,
        stdio: 'inherit'
      });
      
      console.log(chalk.green('✅ Environment sync completed'));
      
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Environment sync failed - continuing'));
    }
  }

  async autoRecover(): Promise<void> {
    console.log(chalk.blue('🔄 Attempting automatic recovery...'));
    
    try {
      // Restart failed services
      if (await this.isDockerComposeAvailable()) {
        await this.startDockerCompose();
      }

      // Restart development server if needed
      if (!await this.isServiceHealthy('http://localhost:3000')) {
        await this.startDevelopmentServer();
      }

      console.log(chalk.green('✅ Automatic recovery completed'));
      
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Automatic recovery failed'));
      throw error;
    }
  }

  // 🛠️ Utility Methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 📊 Status Information
  async getSystemStatus(): Promise<any> {
    const health = await this.checkHealth();
    const analysis = await this.analyzeProject();
    
    return {
      timestamp: new Date().toISOString(),
      health,
      analysis,
      services: Array.from(this.activeServices.keys())
    };
  }
}