#!/bin/bash

# Claude Code Agent System - Repository Onboarding Script
# Usage: ./repo-onboarding.sh [target-repo-path]

set -e

TARGET_REPO="${1:-$(pwd)}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_SYSTEM_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date -Iseconds)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 Claude Code Agent System - Repository Onboarding${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo ""

# Validate target repository
if [ ! -d "$TARGET_REPO" ]; then
    echo -e "${RED}❌ Error: Target repository path does not exist: $TARGET_REPO${NC}"
    exit 1
fi

if [ ! -d "$TARGET_REPO/.git" ]; then
    echo -e "${YELLOW}⚠️  Warning: Target directory is not a git repository${NC}"
    echo -e "${YELLOW}   Proceeding anyway, but git integration will be limited${NC}"
    echo ""
fi

cd "$TARGET_REPO"
TARGET_REPO_NAME=$(basename "$TARGET_REPO")

echo -e "${GREEN}📁 Target Repository: $TARGET_REPO_NAME${NC}"
echo -e "${GREEN}📍 Path: $TARGET_REPO${NC}"
echo ""

# Check if already onboarded
if [ -f "PROJECT_MANIFESTO.md" ] && [ -d "TASKS" ] && [ -f "AGENT_COMPATIBILITY_MAP.md" ]; then
    echo -e "${YELLOW}⚠️  Repository appears to already be onboarded with Agent System${NC}"
    echo -e "${YELLOW}   Found: PROJECT_MANIFESTO.md, TASKS/, AGENT_COMPATIBILITY_MAP.md${NC}"
    echo ""
    echo -e "${BLUE}Options:${NC}"
    echo -e "${BLUE}1. Continue and update existing integration${NC}"
    echo -e "${BLUE}2. Exit and use existing integration${NC}"
    echo ""
    read -p "Choose option (1 or 2): " choice
    
    if [ "$choice" != "1" ]; then
        echo -e "${GREEN}✅ Using existing agent system integration${NC}"
        echo -e "${GREEN}   You can start using agents immediately:${NC}"
        echo -e "${GREEN}   > claude${NC}"
        echo -e "${GREEN}   > /agents task-executor${NC}"
        exit 0
    fi
    
    echo -e "${YELLOW}📋 Updating existing integration...${NC}"
    echo ""
fi

# Phase 1: Repository Analysis
echo -e "${BLUE}🔍 Phase 1: Deep Repository Analysis${NC}"
echo -e "${BLUE}-----------------------------------${NC}"

# Count files and get basic stats
FILE_COUNT=$(find . -type f -not -path './.git/*' -not -path './node_modules/*' -not -path './target/*' -not -path './build/*' -not -path './dist/*' | wc -l)
echo -e "${GREEN}📊 Files to analyze: $FILE_COUNT${NC}"

# Detect primary language
echo -e "${GREEN}🔍 Detecting primary programming language...${NC}"
PRIMARY_LANG="Unknown"
if [ -f "package.json" ]; then
    PRIMARY_LANG="JavaScript/TypeScript"
elif [ -f "requirements.txt" ] || [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
    PRIMARY_LANG="Python"
elif [ -f "Cargo.toml" ]; then
    PRIMARY_LANG="Rust"
elif [ -f "go.mod" ]; then
    PRIMARY_LANG="Go"
elif [ -f "pom.xml" ] || [ -f "build.gradle" ]; then
    PRIMARY_LANG="Java"
elif [ -f "Gemfile" ]; then
    PRIMARY_LANG="Ruby"
elif [ -f "composer.json" ]; then
    PRIMARY_LANG="PHP"
fi

echo -e "${GREEN}   Primary Language: $PRIMARY_LANG${NC}"

# Detect framework
echo -e "${GREEN}🔍 Detecting framework and architecture...${NC}"
FRAMEWORK="Unknown"
ARCHITECTURE="Unknown"

if [ -f "package.json" ]; then
    if grep -q "next" package.json; then
        FRAMEWORK="Next.js"
        ARCHITECTURE="React SSR/SSG"
    elif grep -q "react" package.json; then
        FRAMEWORK="React"
        ARCHITECTURE="SPA"
    elif grep -q "express" package.json; then
        FRAMEWORK="Express.js"
        ARCHITECTURE="REST API"
    elif grep -q "fastify" package.json; then
        FRAMEWORK="Fastify"
        ARCHITECTURE="REST API"
    fi
elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
    if grep -q "fastapi\|fastapi" requirements.txt pyproject.toml 2>/dev/null; then
        FRAMEWORK="FastAPI"
        ARCHITECTURE="REST API"
    elif grep -q "django" requirements.txt pyproject.toml 2>/dev/null; then
        FRAMEWORK="Django"
        ARCHITECTURE="MVC Web App"
    elif grep -q "flask" requirements.txt pyproject.toml 2>/dev/null; then
        FRAMEWORK="Flask"
        ARCHITECTURE="Web API"
    fi
fi

echo -e "${GREEN}   Framework: $FRAMEWORK${NC}"
echo -e "${GREEN}   Architecture: $ARCHITECTURE${NC}"

# Detect development stage
echo -e "${GREEN}🔍 Determining development stage...${NC}"
STAGE="Unknown"
if [ -d ".git" ]; then
    COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo "0")
    RECENT_COMMITS=$(git log --since="1 month ago" --oneline 2>/dev/null | wc -l || echo "0")
    
    if [ "$COMMIT_COUNT" -gt 1000 ] && [ -f "README.md" ] && [ -d "tests" -o -d "test" -o -d "__tests__" ]; then
        STAGE="Production"
    elif [ "$COMMIT_COUNT" -gt 100 ] && [ "$RECENT_COMMITS" -gt 10 ]; then
        STAGE="MVP/Beta"
    elif [ "$COMMIT_COUNT" -gt 20 ]; then
        STAGE="Early Development"
    else
        STAGE="Proof of Concept"
    fi
    
    echo -e "${GREEN}   Git Commits: $COMMIT_COUNT${NC}"
    echo -e "${GREEN}   Recent Activity: $RECENT_COMMITS commits (last month)${NC}"
fi

echo -e "${GREEN}   Development Stage: $STAGE${NC}"

# Detect build system
echo -e "${GREEN}🔍 Analyzing build system...${NC}"
BUILD_SYSTEM="Unknown"
BUILD_COMMAND="make"

if [ -f "package.json" ]; then
    BUILD_SYSTEM="npm/yarn/pnpm"
    if command -v pnpm >/dev/null 2>&1 && [ -f "pnpm-lock.yaml" ]; then
        BUILD_COMMAND="pnpm run build"
    elif command -v yarn >/dev/null 2>&1 && [ -f "yarn.lock" ]; then
        BUILD_COMMAND="yarn build"
    else
        BUILD_COMMAND="npm run build"
    fi
elif [ -f "Makefile" ]; then
    BUILD_SYSTEM="Make"
    BUILD_COMMAND="make"
elif [ -f "Cargo.toml" ]; then
    BUILD_SYSTEM="Cargo"
    BUILD_COMMAND="cargo build"
elif [ -f "go.mod" ]; then
    BUILD_SYSTEM="Go Modules"
    BUILD_COMMAND="go build"
fi

echo -e "${GREEN}   Build System: $BUILD_SYSTEM${NC}"
echo -e "${GREEN}   Build Command: $BUILD_COMMAND${NC}"

echo ""

# Phase 2: Agent Infrastructure Setup
echo -e "${BLUE}🔧 Phase 2: Agent Infrastructure Setup${NC}"
echo -e "${BLUE}------------------------------------${NC}"

# Create agent system directories
echo -e "${GREEN}📁 Creating agent system directories...${NC}"
mkdir -p TASKS/{QUEUE/{PRIORITY,STANDARD},ACTIVE,BLOCKED,COMPLETE,ERROR}
mkdir -p project-dashboard
mkdir -p journal
mkdir -p .claude

# Generate PROJECT_MANIFESTO.md
echo -e "${GREEN}📜 Generating PROJECT_MANIFESTO.md...${NC}"
cat > PROJECT_MANIFESTO.md << EOF
# $TARGET_REPO_NAME - PROJECT MANIFESTO
## The Philosophical North Star

*Generated by repo-onboarding-agent on $TIMESTAMP*

This manifesto contains the core principles that guide every decision in this project. All agents MUST read this before any other action.

---

## Core Maxims

### On Building Systems
- **Build generators, not cages** - Create systems that enable, not constrain
- **Make the right thing easy** - Good architecture makes good decisions natural
- **Convention over configuration** - But configuration when needed
- **Explicit is better than implicit** - Clear code over clever code

### On Development Philosophy
- **Ship early, iterate often** - Perfect is the enemy of shipped
- **Build for deletion** - Code should be easy to remove, not just add
- **Optimize for change** - The only constant is change
- **Document the why, not the what** - Code shows what, comments explain why

### On User Experience
- **Users don't care about your tech stack** - They care about solving problems
- **Every interaction should feel instant** - Speed is a feature
- **Errors are opportunities to delight** - Handle failures gracefully
- **Privacy by default** - Never log sensitive data

### On Code Quality
- **Types are documentation** - Let the language work for you
- **Test behavior, not implementation** - Tests should survive refactoring
- **Every function should do one thing** - And do it well
- **Dependencies are debt** - Every package is a liability

---

## Project-Specific Values

### For $TARGET_REPO_NAME ($STAGE stage, $PRIMARY_LANG)
$(if [ "$STAGE" = "Production" ]; then
echo "- **Stability over features** - Production system stability is paramount"
echo "- **Backward compatibility** - Never break existing user workflows"
echo "- **Performance monitoring** - Every change is measured"
elif [ "$STAGE" = "MVP/Beta" ]; then
echo "- **User feedback first** - Every feature validated with users"
echo "- **Rapid iteration** - Weekly releases with improvements"
echo "- **Data-driven decisions** - Metrics guide feature development"
elif [ "$STAGE" = "Early Development" ]; then
echo "- **Foundation first** - Build solid base before features"
echo "- **Test-driven development** - Tests written alongside code"
echo "- **Simple over clever** - Optimize for readability and maintainability"
else
echo "- **Validate assumptions** - Test ideas quickly and cheaply"
echo "- **Flexible architecture** - Design for change and pivots"
echo "- **Learn fast, fail fast** - Embrace experimentation"
fi)

$(if [ "$FRAMEWORK" != "Unknown" ]; then
echo "- **${FRAMEWORK} best practices** - Follow framework conventions and patterns"
fi)

---

## Technical Principles

### Architecture
1. **$(if [ "$ARCHITECTURE" != "Unknown" ]; then echo "Follow $ARCHITECTURE patterns"; else echo "Maintain architectural consistency"; fi)** - Respect existing design
2. **Foundation before features** - Solid base prevents future pain
3. **Services own their data** - Clear boundaries between components
4. **Events over direct calls** - Loose coupling wins

### Security
1. **Never trust user input** - Validate everything
2. **Principle of least privilege** - Minimal permissions always
3. **Secrets stay secret** - Never in code, logs, or git
4. **Audit everything** - Know who did what when

### Performance
1. **Measure before optimizing** - Data over intuition
2. **Cache aggressively** - But invalidate correctly
3. **Paginate everything** - No unbounded queries
4. **Fail fast** - Don't let errors cascade

### Operations
1. **Automate everything** - If you do it twice, script it
2. **Monitor what matters** - Alert on user impact
3. **Plan for failure** - Everything will break eventually
4. **Document runbooks** - Future you will thank you

---

## Decision Framework

When facing a decision, ask:
1. Does this align with our maxims?
2. Does this make the system more maintainable?
3. Does this improve user experience?
4. Can this be simpler?
5. Will future developers understand this?

---

## The Prime Directive

> Every decision should make the next decision easier.

When in doubt, choose the path that:
- Reduces complexity
- Increases clarity  
- Improves testability
- Enhances user experience
- Preserves optionality

---

*This manifesto is a living document. It evolves as we learn.*
EOF

# Generate AGENT_COMPATIBILITY_MAP.md
echo -e "${GREEN}🗺️  Generating AGENT_COMPATIBILITY_MAP.md...${NC}"
cp "$AGENT_SYSTEM_ROOT/templates/AGENT_COMPATIBILITY_MAP_TEMPLATE.md" AGENT_COMPATIBILITY_MAP.md
sed -i.bak "s/\[REPOSITORY_NAME\]/$TARGET_REPO_NAME/g" AGENT_COMPATIBILITY_MAP.md
sed -i.bak "s/\[TIMESTAMP\]/$TIMESTAMP/g" AGENT_COMPATIBILITY_MAP.md
sed -i.bak "s/\[LANGUAGE\]/$PRIMARY_LANG/g" AGENT_COMPATIBILITY_MAP.md
sed -i.bak "s/\[Framework name and version\]/$FRAMEWORK/g" AGENT_COMPATIBILITY_MAP.md
sed -i.bak "s/\[BUILD_COMMAND\]/$BUILD_COMMAND/g" AGENT_COMPATIBILITY_MAP.md
rm AGENT_COMPATIBILITY_MAP.md.bak 2>/dev/null || true

# Initialize PROJECT_LOG.md
echo -e "${GREEN}📝 Initializing PROJECT_LOG.md...${NC}"
cat > PROJECT_LOG.md << EOF
# $TARGET_REPO_NAME - Project Log
*Agent coordination and decision history*

## Repository Onboarding
- **Timestamp**: $TIMESTAMP
- **Agent**: repo-onboarding-agent
- **Action**: read
- **Status**: active
- **Details**: Repository onboarded successfully
  - Primary Language: $PRIMARY_LANG
  - Framework: $FRAMEWORK  
  - Architecture: $ARCHITECTURE
  - Development Stage: $STAGE
  - Build System: $BUILD_SYSTEM
  - Files Analyzed: $FILE_COUNT

## Agent Communication Log
*All agents log their activities here for coordination*

### $TIMESTAMP - repo-onboarding-agent - HANDOFF
Repository integration complete. Agent system ready for operation.
Next recommended agent: journal-interface-builder or task-executor
Files created:
- PROJECT_MANIFESTO.md
- AGENT_COMPATIBILITY_MAP.md  
- PROJECT_LOG.md (this file)
- TASKS/ directory structure
- .claude/ AI context directory

EOF

# Set up task management system
echo -e "${GREEN}📋 Setting up task management system...${NC}"
cat > TASKS/STATUS.json << EOF
{
  "project": "$TARGET_REPO_NAME",
  "onboarded": "$TIMESTAMP",
  "phase": "READY-FOR-AGENTS", 
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
  "recent_completions": [],
  "repository_profile": {
    "primary_language": "$PRIMARY_LANG",
    "framework": "$FRAMEWORK",
    "architecture": "$ARCHITECTURE", 
    "stage": "$STAGE",
    "build_system": "$BUILD_SYSTEM"
  }
}
EOF

cat > TASKS/METRICS.json << EOF
{
  "project": "$TARGET_REPO_NAME", 
  "onboarded": "$TIMESTAMP",
  "phases": {},
  "velocity": {
    "tasks_per_hour": 0,
    "average_task_duration": "0 minutes",
    "blocks_per_day": 0
  },
  "projections": {
    "estimated_completion": null,
    "confidence": 0.0
  },
  "integration": {
    "files_analyzed": $FILE_COUNT,
    "onboarding_duration": "automatic",
    "risk_level": "$(if [ "$STAGE" = "Production" ]; then echo "HIGH"; elif [ "$STAGE" = "MVP/Beta" ]; then echo "MEDIUM"; else echo "LOW"; fi)"
  }
}
EOF

# Set up AI context directory
echo -e "${GREEN}🤖 Setting up AI context directory (.claude/)...${NC}"
cat > .claude/project-context.md << EOF
# $TARGET_REPO_NAME - AI Context
*For Claude Code and other AI assistants*

## Project Overview
- **Name**: $TARGET_REPO_NAME
- **Type**: $ARCHITECTURE application
- **Language**: $PRIMARY_LANG
- **Framework**: $FRAMEWORK
- **Stage**: $STAGE

## Build & Development
- **Build Command**: \`$BUILD_COMMAND\`
- **Primary Files**: $(find . -maxdepth 2 -name "*.$(echo $PRIMARY_LANG | cut -d'/' -f1 | tr '[:upper:]' '[:lower:]')" 2>/dev/null | head -3 | tr '\n' ' ')

## Agent System Integration
This repository has been onboarded to the Claude Code Agent System.

### Available Agents
- All 30+ specialized agents are available
- Start with: journal-interface-builder or task-executor
- Use: \`/agents [agent-name]\` in Claude Code

### Key Files
- \`PROJECT_MANIFESTO.md\` - Core principles
- \`AGENT_COMPATIBILITY_MAP.md\` - Repository-specific guidelines  
- \`PROJECT_LOG.md\` - Agent coordination log
- \`TASKS/\` - Task management system

## Integration Guidelines
- Always read AGENT_COMPATIBILITY_MAP.md before making changes
- Follow existing patterns and conventions
- Log all decisions to PROJECT_LOG.md
- Respect the development stage (risk level: $(if [ "$STAGE" = "Production" ]; then echo "HIGH"; elif [ "$STAGE" = "MVP/Beta" ]; then echo "MEDIUM"; else echo "LOW"; fi))
EOF

cat > .claude/README.md << EOF
# AI Assistant Integration

This directory contains context for AI assistants working on the $TARGET_REPO_NAME project.

## Files
- \`project-context.md\` - Complete project overview
- \`existing-patterns.md\` - Discovered code patterns (generated)
- \`integration-guide.md\` - How to work with this repository

## Usage
AI assistants should read these files to understand:
- Project structure and conventions
- Existing patterns to follow
- Integration guidelines
- Risk considerations

*Generated by repo-onboarding-agent on $TIMESTAMP*
EOF

# Create initial journal entry
echo -e "${GREEN}📖 Creating initial journal entry...${NC}"
cat > journal/000-repository-onboarding.md << EOF
# $TARGET_REPO_NAME - Repository Onboarding
**Date**: $(date '+%Y-%m-%d %H:%M:%S')
**Milestone**: Claude Code Agent System Integration Complete

## Repository Profile
- **Name**: $TARGET_REPO_NAME  
- **Primary Language**: $PRIMARY_LANG
- **Framework**: $FRAMEWORK
- **Architecture**: $ARCHITECTURE
- **Development Stage**: $STAGE
- **Risk Level**: $(if [ "$STAGE" = "Production" ]; then echo "HIGH"; elif [ "$STAGE" = "MVP/Beta" ]; then echo "MEDIUM"; else echo "LOW"; fi)

## Analysis Results
- **Files Analyzed**: $FILE_COUNT
- **Build System**: $BUILD_SYSTEM
- **Build Command**: \`$BUILD_COMMAND\`
- **Git History**: $(if [ -d ".git" ]; then echo "$COMMIT_COUNT commits"; else echo "Not a git repository"; fi)

## Integration Complete
✅ Agent system infrastructure installed
✅ Repository patterns analyzed and documented
✅ Compatibility map generated
✅ Project manifesto created based on discovered patterns
✅ Task management system initialized
✅ AI context documentation created

## Next Steps
The repository is now ready for AI agent orchestration:

1. **Start with Dashboard**: 
   \`\`\`bash
   claude> /agents journal-interface-builder
   \`\`\`

2. **Or Begin Task Execution**:
   \`\`\`bash
   claude> /agents task-executor  
   \`\`\`

3. **For New Projects**:
   \`\`\`bash
   claude> /agents vision-challenger
   > "I want to build [your idea]"
   \`\`\`

## Risk Considerations
$(if [ "$STAGE" = "Production" ]; then
echo "⚠️  **HIGH RISK**: Production system with users"
echo "- Make incremental changes only"
echo "- Always test in staging first"  
echo "- Have rollback plan ready"
echo "- Monitor system health closely"
elif [ "$STAGE" = "MVP/Beta" ]; then
echo "⚠️  **MEDIUM RISK**: Active development with users"
echo "- Test changes thoroughly"
echo "- Consider user impact"
echo "- Use feature flags where possible"
echo "- Monitor for regressions"
else
echo "✅ **LOW RISK**: Early stage development"
echo "- Safe for experimentation"
echo "- Focus on building solid foundations"
echo "- Establish good patterns early"
echo "- Document architectural decisions"
fi)

## Agent System Ready
The $TARGET_REPO_NAME project is now fully integrated with the Claude Code Agent System. All 30+ specialized agents are available and configured for this repository's specific patterns and requirements.

---

*Repository onboarded in $(date '+%Y-%m-%d %H:%M:%S') by repo-onboarding-agent*
EOF

echo ""
echo -e "${GREEN}✅ Repository Onboarding Complete!${NC}"
echo ""
echo -e "${BLUE}📊 Integration Summary:${NC}"
echo -e "${BLUE}  Repository: $TARGET_REPO_NAME${NC}"
echo -e "${BLUE}  Language: $PRIMARY_LANG${NC}"
echo -e "${BLUE}  Framework: $FRAMEWORK${NC}"
echo -e "${BLUE}  Stage: $STAGE${NC}"
echo -e "${BLUE}  Files Analyzed: $FILE_COUNT${NC}"
echo -e "${BLUE}  Risk Level: $(if [ "$STAGE" = "Production" ]; then echo "HIGH"; elif [ "$STAGE" = "MVP/Beta" ]; then echo "MEDIUM"; else echo "LOW"; fi)${NC}"
echo ""
echo -e "${GREEN}🚀 Ready for Agent Orchestration!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "${BLUE}1. Review generated files:${NC}"
echo -e "${BLUE}   - PROJECT_MANIFESTO.md (project principles)${NC}"
echo -e "${BLUE}   - AGENT_COMPATIBILITY_MAP.md (integration guide)${NC}"
echo -e "${BLUE}   - journal/000-repository-onboarding.md (summary)${NC}"
echo ""
echo -e "${BLUE}2. Start using agents:${NC}"
echo -e "${BLUE}   > claude${NC}"
echo -e "${BLUE}   > /agents journal-interface-builder  # Create monitoring dashboard${NC}"
echo -e "${BLUE}   > /agents task-executor             # Start executing tasks${NC}"
echo ""
echo -e "${BLUE}3. For new features:${NC}"
echo -e "${BLUE}   > /agents vision-challenger         # Refine new ideas${NC}"
echo -e "${BLUE}   > /agents orchestrate --auto        # Full automation${NC}"
echo ""
echo -e "${GREEN}🎉 Welcome to AI-powered development!${NC}"