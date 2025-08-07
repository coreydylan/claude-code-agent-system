import { EventEmitter } from 'events';
import { watchFile, unwatchFile, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

interface MonitoringSession {
  agentName: string;
  projectPath: string;
  startTime: Date;
  lastActivity: Date;
  status: 'starting' | 'active' | 'completed' | 'error' | 'stalled';
  progress?: string;
  filesWatched: string[];
  logEntries: LogEntry[];
}

interface LogEntry {
  timestamp: Date;
  agent: string;
  action: string;
  details: string;
  status?: string;
}

interface TaskStatus {
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  errored: number;
}

export class ProgressMonitor extends EventEmitter {
  private activeSessions = new Map<string, MonitoringSession>();
  private fileWatchers = new Map<string, any>();
  private heartbeatInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.startHeartbeat();
  }

  async startMonitoring(agentName: string, projectPath: string): Promise<ProgressMonitor> {
    const sessionId = `${agentName}-${Date.now()}`;
    
    const session: MonitoringSession = {
      agentName,
      projectPath,
      startTime: new Date(),
      lastActivity: new Date(),
      status: 'starting',
      filesWatched: [],
      logEntries: []
    };

    this.activeSessions.set(sessionId, session);

    // Set up file watchers
    await this.setupFileWatchers(sessionId, session);

    // Emit initial status
    this.emit('agent_started', { agentName, sessionId });

    return this;
  }

  private async setupFileWatchers(sessionId: string, session: MonitoringSession): Promise<void> {
    const filesToWatch = [
      'PROJECT_LOG.md',
      'TASKS/STATUS.json',
      'TASKS/METRICS.json'
    ];

    for (const file of filesToWatch) {
      const filePath = join(session.projectPath, file);
      
      if (existsSync(filePath)) {
        session.filesWatched.push(filePath);
        
        const watcher = watchFile(filePath, { interval: 1000 }, (curr, prev) => {
          if (curr.mtime > prev.mtime) {
            this.handleFileChange(sessionId, filePath, file);
          }
        });

        this.fileWatchers.set(`${sessionId}-${file}`, watcher);
      }
    }
  }

  private async handleFileChange(sessionId: string, filePath: string, filename: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.lastActivity = new Date();

    try {
      switch (filename) {
        case 'PROJECT_LOG.md':
          await this.parseProjectLog(sessionId, filePath);
          break;
        case 'TASKS/STATUS.json':
          await this.parseTaskStatus(sessionId, filePath);
          break;
        case 'TASKS/METRICS.json':
          await this.parseTaskMetrics(sessionId, filePath);
          break;
      }
    } catch (error) {
      this.emit('monitoring_error', { sessionId, error: error.message });
    }
  }

  private async parseProjectLog(sessionId: string, logPath: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    try {
      const logContent = readFileSync(logPath, 'utf-8');
      const newEntries = this.extractNewLogEntries(logContent, session.agentName, session.logEntries);

      for (const entry of newEntries) {
        session.logEntries.push(entry);
        
        // Update session status based on log entry
        this.updateSessionStatus(sessionId, entry);
        
        // Emit progress events
        this.emit('progress', {
          sessionId,
          agentName: session.agentName,
          action: entry.action,
          details: entry.details,
          timestamp: entry.timestamp
        });

        // Check for completion or error
        if (entry.action.includes('COMPLETED') || entry.action.includes('HANDOFF')) {
          this.handleAgentCompletion(sessionId, entry);
        } else if (entry.action.includes('ERROR') || entry.status === 'error') {
          this.handleAgentError(sessionId, entry);
        }
      }
    } catch (error) {
      this.emit('monitoring_error', { sessionId, error: `Failed to parse project log: ${error.message}` });
    }
  }

  private extractNewLogEntries(logContent: string, agentName: string, existingEntries: LogEntry[]): LogEntry[] {
    const lines = logContent.split('\n');
    const newEntries: LogEntry[] = [];
    const existingTimestamps = new Set(existingEntries.map(e => e.timestamp.toISOString()));

    let currentEntry: Partial<LogEntry> | null = null;
    
    for (const line of lines) {
      // Match log entry headers: ### timestamp - agent - action
      const headerMatch = line.match(/^### (.+) - (.+) - (.+)$/);
      
      if (headerMatch) {
        // Save previous entry if it exists
        if (currentEntry && currentEntry.agent === agentName) {
          const entry = this.completeLogEntry(currentEntry);
          if (entry && !existingTimestamps.has(entry.timestamp.toISOString())) {
            newEntries.push(entry);
          }
        }

        // Start new entry
        const timestamp = new Date(headerMatch[1]);
        const agent = headerMatch[2];
        const action = headerMatch[3];

        if (agent === agentName) {
          currentEntry = { timestamp, agent, action, details: '' };
        } else {
          currentEntry = null;
        }
      } else if (currentEntry && line.trim()) {
        // Add details to current entry
        currentEntry.details = (currentEntry.details || '') + line.trim() + ' ';
        
        // Extract status if present
        const statusMatch = line.match(/Status:\s*(\w+)/i);
        if (statusMatch) {
          currentEntry.status = statusMatch[1].toLowerCase();
        }
      }
    }

    // Handle final entry
    if (currentEntry && currentEntry.agent === agentName) {
      const entry = this.completeLogEntry(currentEntry);
      if (entry && !existingTimestamps.has(entry.timestamp.toISOString())) {
        newEntries.push(entry);
      }
    }

    return newEntries;
  }

  private completeLogEntry(partial: Partial<LogEntry>): LogEntry | null {
    if (!partial.timestamp || !partial.agent || !partial.action) {
      return null;
    }

    return {
      timestamp: partial.timestamp,
      agent: partial.agent,
      action: partial.action,
      details: (partial.details || '').trim(),
      status: partial.status
    };
  }

  private updateSessionStatus(sessionId: string, entry: LogEntry): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    if (entry.action.includes('ERROR')) {
      session.status = 'error';
    } else if (entry.action.includes('COMPLETED') || entry.action.includes('HANDOFF')) {
      session.status = 'completed';
    } else if (entry.action.includes('BLOCKED')) {
      session.status = 'stalled';
    } else {
      session.status = 'active';
    }

    // Extract progress information from details
    const progressMatch = entry.details.match(/Progress:\s*(.+)/i);
    if (progressMatch) {
      session.progress = progressMatch[1].trim();
    }
  }

  private async parseTaskStatus(sessionId: string, statusPath: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    try {
      const statusContent = readFileSync(statusPath, 'utf-8');
      const status = JSON.parse(statusContent);

      const taskStatus: TaskStatus = {
        total: status.summary?.total_tasks || 0,
        completed: status.summary?.completed || 0,
        inProgress: status.summary?.in_progress || 0,
        blocked: status.summary?.blocked || 0,
        errored: status.summary?.errored || 0
      };

      // Check if this agent has active tasks
      const agentTasks = status.active_tasks?.filter((task: any) => 
        task.agent === session.agentName
      ) || [];

      if (agentTasks.length > 0) {
        const currentTask = agentTasks[0];
        session.progress = currentTask.progress || `Working on ${currentTask.task}`;
      }

      this.emit('task_status_update', {
        sessionId,
        agentName: session.agentName,
        taskStatus,
        currentTasks: agentTasks
      });

    } catch (error) {
      this.emit('monitoring_error', { sessionId, error: `Failed to parse task status: ${error.message}` });
    }
  }

  private async parseTaskMetrics(sessionId: string, metricsPath: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    try {
      const metricsContent = readFileSync(metricsPath, 'utf-8');
      const metrics = JSON.parse(metricsContent);

      this.emit('metrics_update', {
        sessionId,
        agentName: session.agentName,
        velocity: metrics.velocity,
        projections: metrics.projections,
        phases: metrics.phases
      });

    } catch (error) {
      this.emit('monitoring_error', { sessionId, error: `Failed to parse task metrics: ${error.message}` });
    }
  }

  private handleAgentCompletion(sessionId: string, entry: LogEntry): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.status = 'completed';
    
    this.emit('completed', {
      sessionId,
      agentName: session.agentName,
      duration: Date.now() - session.startTime.getTime(),
      finalEntry: entry
    });

    // Clean up watchers for completed agent
    this.stopMonitoring(sessionId);
  }

  private handleAgentError(sessionId: string, entry: LogEntry): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.status = 'error';
    
    this.emit('error', {
      sessionId,
      agentName: session.agentName,
      error: entry.details,
      errorEntry: entry
    });

    // Don't stop monitoring on error - might recover
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.checkForStalledAgents();
    }, 30000); // Check every 30 seconds
  }

  private checkForStalledAgents(): void {
    const now = Date.now();
    const stalledThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.status === 'active' && 
          now - session.lastActivity.getTime() > stalledThreshold) {
        
        session.status = 'stalled';
        
        this.emit('stalled', {
          sessionId,
          agentName: session.agentName,
          lastActivity: session.lastActivity,
          duration: now - session.startTime.getTime()
        });
      }
    }
  }

  stopMonitoring(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Clean up file watchers
    for (const file of session.filesWatched) {
      const watcherKey = `${sessionId}-${file}`;
      if (this.fileWatchers.has(watcherKey)) {
        unwatchFile(file);
        this.fileWatchers.delete(watcherKey);
      }
    }

    // Remove session
    this.activeSessions.delete(sessionId);

    this.emit('monitoring_stopped', { sessionId, agentName: session.agentName });
  }

  stopAllMonitoring(): void {
    for (const sessionId of this.activeSessions.keys()) {
      this.stopMonitoring(sessionId);
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  getActiveSession(agentName: string): MonitoringSession | null {
    for (const session of this.activeSessions.values()) {
      if (session.agentName === agentName && session.status !== 'completed') {
        return session;
      }
    }
    return null;
  }

  getAllActiveSessions(): MonitoringSession[] {
    return Array.from(this.activeSessions.values());
  }

  getSessionStatus(sessionId: string): MonitoringSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  // Utility method to format progress for display
  formatProgress(sessionId: string): string {
    const session = this.activeSessions.get(sessionId);
    if (!session) return '';

    const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const statusColor = {
      starting: chalk.yellow,
      active: chalk.blue,
      completed: chalk.green,
      error: chalk.red,
      stalled: chalk.yellow
    }[session.status] || chalk.gray;

    return statusColor(`[${timeStr}] ${session.agentName}: ${session.progress || session.status}`);
  }

  // Create a visual progress bar
  createProgressBar(completed: number, total: number, width: number = 20): string {
    if (total === 0) return '□'.repeat(width);
    
    const progress = Math.min(completed / total, 1);
    const filled = Math.floor(progress * width);
    const empty = width - filled;
    
    return '█'.repeat(filled) + '░'.repeat(empty);
  }
}