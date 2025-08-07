#!/bin/bash

# Claude Code Agent System - Project Initialization Script
# Usage: ./initialize-project.sh <project-name> [project-path]

set -e

PROJECT_NAME="$1"
PROJECT_PATH="${2:-$(pwd)/$PROJECT_NAME}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_SYSTEM_ROOT="$(dirname "$SCRIPT_DIR")"

if [ -z "$PROJECT_NAME" ]; then
    echo "Usage: $0 <project-name> [project-path]"
    echo "Example: $0 my-startup ./projects/my-startup"
    exit 1
fi

echo "🚀 Initializing Claude Code Agent System for: $PROJECT_NAME"
echo "📁 Project path: $PROJECT_PATH"

# Create project directory
mkdir -p "$PROJECT_PATH"
cd "$PROJECT_PATH"

# Copy templates
echo "📋 Setting up project templates..."
cp -r "$AGENT_SYSTEM_ROOT/templates/"* .

# Create required directories
mkdir -p {TASKS/{QUEUE/{PRIORITY,STANDARD},ACTIVE,BLOCKED,COMPLETE,ERROR},project-dashboard,journal}

# Initialize PROJECT_MANIFESTO.md with project name
echo "📜 Creating project manifesto..."
sed "s/\[PROJECT_NAME\]/$PROJECT_NAME/g" PROJECT_MANIFESTO_TEMPLATE.md > PROJECT_MANIFESTO.md
rm PROJECT_MANIFESTO_TEMPLATE.md

# Initialize PROJECT_LOG.md
echo "📝 Setting up project log..."
cat > PROJECT_LOG.md << EOF
# $PROJECT_NAME - Project Log

## Project Initialization
- **Timestamp**: $(date -Iseconds)
- **Agent System**: Claude Code Agent System v1.0
- **Status**: Initialized and ready for vision-challenger agent

## Next Steps
1. Run: claude> /agents vision-challenger
2. Provide your project idea
3. Let the agents orchestrate development

## Agent Communication Log
EOF

# Create initial task structure
echo "📋 Setting up task management system..."
cat > TASKS/README.md << EOF
# $PROJECT_NAME - Task Management System

## Current Status
- **Phase**: Initialization complete
- **Next Agent**: vision-challenger
- **Tasks Created**: 0
- **Tasks Completed**: 0

## Instructions
1. The vision-challenger agent will create the initial task structure
2. Agents will automatically claim and execute tasks
3. Monitor progress via project-dashboard/

For details see: TASK_MANAGEMENT_PROTOCOL.md
EOF

# Create STATUS.json
cat > TASKS/STATUS.json << EOF
{
  "project": "$PROJECT_NAME",
  "initialized": "$(date -Iseconds)",
  "phase": "PHASE-0-INITIALIZATION",
  "summary": {
    "total_tasks": 0,
    "completed": 0,
    "in_progress": 0,
    "blocked": 0,
    "errored": 0,
    "queued": 0
  },
  "active_tasks": [],
  "blocked_tasks": [],
  "recent_completions": []
}
EOF

# Create METRICS.json
cat > TASKS/METRICS.json << EOF
{
  "project": "$PROJECT_NAME",
  "started": "$(date -Iseconds)",
  "phases": {},
  "velocity": {
    "tasks_per_hour": 0,
    "average_task_duration": "0 minutes",
    "blocks_per_day": 0
  },
  "projections": {
    "estimated_completion": null,
    "confidence": 0.0
  }
}
EOF

# Create initial journal entry
echo "📖 Creating initial journal entry..."
cat > journal/000-project-initialization.md << EOF
# $PROJECT_NAME - Project Initialization

**Date**: $(date '+%Y-%m-%d %H:%M:%S')
**Milestone**: Claude Code Agent System Setup Complete

## What Was Done

✅ Agent system templates installed
✅ Task management system initialized  
✅ Project manifesto framework created
✅ Logging and monitoring systems ready
✅ Directory structure established

## System Ready

The $PROJECT_NAME project is now ready for AI agent orchestration. The next step is to engage the vision-challenger agent with your project concept.

## Quick Start Commands

\`\`\`bash
# Navigate to project
cd $PROJECT_PATH

# Start with vision challenger
claude> /agents vision-challenger
> "I want to build [your idea]"

# Or use full orchestration
claude> /agents orchestrate --auto
\`\`\`

## Project Structure

\`\`\`
$PROJECT_NAME/
├── PROJECT_MANIFESTO.md     # Core principles and values
├── PROJECT_LOG.md           # Agent coordination log
├── TASK_MANAGEMENT_PROTOCOL.md # Task system rules
├── TASKS/                   # Task management system
├── project-dashboard/       # Human interface (created by agents)
└── journal/                # Development journey documentation
\`\`\`

Ready for agent orchestration! 🤖✨
EOF

# Set up git if not already initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    cat > .gitignore << EOF
node_modules/
.env*
!.env.example
dist/
build/
.DS_Store
*.log
.vercel
.next
.turbo
EOF
    git add .
    git commit -m "🚀 Initialize Claude Code Agent System

- Set up agent orchestration framework
- Ready for vision-challenger agent
- Project: $PROJECT_NAME"
fi

echo ""
echo "✅ Claude Code Agent System initialized successfully!"
echo ""
echo "📍 Project location: $PROJECT_PATH"
echo "🎯 Next step: Run vision-challenger agent with your project idea"
echo ""
echo "Quick start:"
echo "  cd $PROJECT_PATH"
echo "  claude"
echo "  > /agents vision-challenger"
echo "  > \"I want to build [your project idea]\""
echo ""
echo "Happy building! 🚀"
EOF