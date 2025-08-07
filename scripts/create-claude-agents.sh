#!/bin/bash

# Create Claude Code subagents for the agent system
# Uses Claude Code's native /agents command and file structure

# Use user's personal agents directory where Claude Code looks for agents
USER_AGENTS_DIR="$HOME/.claude/agents"

echo "🤖 Creating Claude Code subagents..."

# Create agents directory if it doesn't exist
mkdir -p "$USER_AGENTS_DIR"

echo "📍 Creating agents in: $USER_AGENTS_DIR"
echo "🎯 These will be personal agents available across all your Claude Code sessions"

# Agent definitions - using individual variables for better compatibility
create_agent() {
  local agent_name="$1"
  local description="$2"
  local agent_file="$USER_AGENTS_DIR/${agent_name}.md"
  
  # Check if agent already exists
  if [ -f "$agent_file" ]; then
    echo "📝 Updating agent: $agent_name (already exists)"
  else
    echo "📝 Creating agent: $agent_name"
  fi
  
  cat > "$agent_file" << EOF
# $agent_name

## Description
$description

## Tools
- All available Claude Code tools
- Project-specific context from PROJECT_MANIFESTO.md
- Task management integration with TASKS/ folder
- Access to project documentation and codebase

## Context
This agent is part of the Claude Developer OS system and has access to:
- PROJECT_LOG.md for coordination with other agents
- TASKS/ folder for task management
- Full project codebase and documentation
- Development environment and infrastructure

## Usage
Invoke this agent when you need specialized help with tasks related to its domain expertise.

## Integration
This agent works seamlessly with the broader agent system and can coordinate with other agents through the PROJECT_LOG.md file.
EOF
}

# Create all agents
create_agent "task-executor" "Specialized agent for executing development tasks from the TASKS/ folder. Handles implementation, testing, and integration while maintaining project consistency."
create_agent "vision-challenger" "Challenges and refines product vision and requirements. Analyzes PRDs, identifies gaps, and ensures technical feasibility."
create_agent "architecture-designer" "Designs system architecture and technical solutions. Creates implementation plans and ensures scalability."
create_agent "test-guardian" "Ensures comprehensive testing coverage. Writes and maintains unit, integration, and e2e tests."
create_agent "database-architect" "Handles database design, migrations, and schema management. Optimizes queries and ensures data integrity."
create_agent "api-builder" "Builds and maintains REST/GraphQL APIs. Ensures proper documentation and error handling."
create_agent "ui-specialist" "Creates and maintains user interfaces. Ensures responsive design and accessibility."
create_agent "deployment-manager" "Handles CI/CD, deployments, and infrastructure management. Ensures reliable production deployments."
create_agent "security-auditor" "Performs security reviews and implements security best practices. Identifies vulnerabilities."
create_agent "performance-optimizer" "Optimizes application performance, identifies bottlenecks, and improves scalability."
create_agent "feature-intake-agent" "Receives and processes feature requests from users, stakeholders, and team members. Validates requests, estimates effort, and routes to appropriate queues."
create_agent "roadmap-manager" "Maintains and updates the product roadmap. Prioritizes features, manages releases, and coordinates with stakeholders. Reviews and adjusts roadmap based on progress and feedback."
create_agent "task-orchestrator" "Orchestrates task queues and assigns work to available agents. Monitors progress, handles dependencies, and ensures optimal resource allocation across the development pipeline."
create_agent "queue-manager" "Manages multiple task queues (urgent, feature-dev, maintenance, research). Handles queue priorities, SLA monitoring, and load balancing across agents."
create_agent "admin-dashboard-agent" "Provides administrative visibility into all queues, agent status, and system health. Generates reports, metrics, and alerts for project managers and stakeholders."
create_agent "stakeholder-interface" "Handles communication with external stakeholders. Provides status updates, collects feedback, and manages expectations. Translates business requirements into technical specifications."
create_agent "codebase-auditor" "Performs comprehensive analysis of existing codebases during onboarding. Analyzes code quality, security, architecture, dependencies, and technical debt. Provides detailed audit reports and improvement recommendations."

# Count created agents
agent_count=$(ls -1 "$USER_AGENTS_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')

echo "✅ Created 17 Claude Code subagents in $USER_AGENTS_DIR"

# Update agent context system
echo ""
echo "🔄 Setting up master agent context..."
if [ -f "scripts/update-agent-context.sh" ]; then
    bash scripts/update-agent-context.sh
else
    echo "⚠️  Master context update script not found"
fi

echo ""
echo "🚀 Next steps:"
echo "   1. Run 'claude --interactive' to start Claude Code"
echo "   2. Use '/agents' to see all available agents"  
echo "   3. Request specific agents: 'Use the task-executor agent to implement the user auth feature'"
echo "   4. Check AGENT_REGISTRY.md for complete agent capabilities"
echo ""
echo "📍 Important: These are PERSONAL agents (in $USER_AGENTS_DIR/)"
echo "   • They will appear in your '/agents' list in Claude Code"
echo "   • They work across all your Claude Code projects"  
echo "   • They have access to project context when invoked in project directories"
echo "   • Available immediately - no need to restart Claude Code"
echo ""
echo "💡 Agents are now integrated with your existing Claude Code authentication!"
echo "🤖 All 17 agents have master context awareness and coordination capabilities"