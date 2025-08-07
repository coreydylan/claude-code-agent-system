#!/bin/bash

# Update Agent Context System
# Ensures all agents have access to master context files

echo "🔄 Updating agent context system..."

AGENTS_DIR=".claude/agents"
PROJECT_ROOT="."

# Ensure agents directory exists
mkdir -p "$AGENTS_DIR"

# Copy master context files to project root if they don't exist
echo "📋 Setting up master context files..."

if [ ! -f "AGENT_REGISTRY.md" ] && [ -f "templates/AGENT_REGISTRY.md" ]; then
    cp templates/AGENT_REGISTRY.md AGENT_REGISTRY.md
    echo "   ✅ Created AGENT_REGISTRY.md"
fi

if [ ! -f "AGENT_CONTEXT.md" ] && [ -f "templates/AGENT_CONTEXT.md" ]; then
    cp templates/AGENT_CONTEXT.md AGENT_CONTEXT.md
    echo "   ✅ Created AGENT_CONTEXT.md"
fi

# Update each agent file to include master context references
echo "🤖 Updating agent context awareness..."

for agent_file in "$AGENTS_DIR"/*.md; do
    if [ -f "$agent_file" ]; then
        agent_name=$(basename "$agent_file" .md)
        
        # Check if context section already exists
        if ! grep -q "## Master Context Access" "$agent_file"; then
            echo "   📝 Updating $agent_name with master context"
            
            # Add master context section to each agent
            cat >> "$agent_file" << EOF

## Master Context Access

As a specialized agent in the Claude Developer OS, you have access to these master context files:

### **AGENT_REGISTRY.md**
Complete registry of all 17 agents in the system. Reference this to:
- Understand capabilities of other agents
- Request appropriate agent assistance: "I need the [agent-name] agent to [task]"
- Follow coordination patterns for complex workflows

### **AGENT_CONTEXT.md** 
Your operating environment guide. Contains:
- Claude Code environment details and capabilities
- File system access and project structure
- Inter-agent communication protocols  
- User interaction guidelines
- Quality standards and technical context

### **PROJECT_LOG.md**
Inter-agent communication hub. Always:
- Read this first to understand recent agent activity
- Log your significant actions and decisions
- Use for coordinating with other agents
- Update after completing tasks

### **PROJECT_MANIFESTO.md**
Project vision and technical context:
- Business goals and user requirements
- Architecture decisions and constraints
- Coding standards and conventions
- Technology stack and infrastructure

### **ROADMAP.md** 
Product roadmap and priorities:
- Current features in development
- Planned features and timelines
- Progress metrics and velocity
- Stakeholder communications

### **QUEUES/ Directory**
Task queue system with structured workflows:
- urgent.json (2hr SLA) - Critical production issues
- feature-dev.json (5-day SLA) - New feature development  
- maintenance.json (2-day SLA) - Bug fixes and improvements
- research.json (1-week SLA) - Investigation and analysis
- admin.json (1-day SLA) - Administrative tasks

## Coordination Protocol

Before starting any task:
1. **Check PROJECT_LOG.md** for recent agent activity
2. **Review AGENT_REGISTRY.md** for relevant agents  
3. **Understand context** from PROJECT_MANIFESTO.md
4. **Check priorities** in ROADMAP.md and QUEUES/
5. **Plan coordination** with other agents as needed
6. **Execute work** using full Claude Code capabilities
7. **Update PROJECT_LOG.md** with your actions

## Agent Requests

Request other agents using natural language:
- "I need the security-auditor agent to review this code"
- "Have the test-guardian agent add comprehensive tests" 
- "The roadmap-manager agent should prioritize this feature"
- "Ask the stakeholder-interface agent to update the client"

Always consider the full agent ecosystem when planning your work.
EOF
        fi
    fi
done

# Create PROJECT_LOG.md if it doesn't exist
if [ ! -f "PROJECT_LOG.md" ]; then
    echo "📝 Creating PROJECT_LOG.md..."
    cat > PROJECT_LOG.md << EOF
# Project Agent Activity Log

*Inter-agent communication and coordination hub*

## Recent Agent Activity

### $(date +%Y-%m-%d) - System Initialization
- **agent-system**: Claude Developer OS initialized
- **codebase-auditor**: Ready for existing codebase analysis  
- **All agents**: Standing by for task assignment

## Communication Protocols

### Log Format
```
### [DATE] - [AGENT-NAME]: [ACTION]
- **Context**: Brief description of the work
- **Coordination**: Other agents involved
- **Outcome**: Results achieved
- **Next Steps**: What should happen next
```

### Agent Coordination
- Use this log to understand what other agents are working on
- Always log significant actions and decisions
- Reference other agents' recent work when relevant
- Coordinate complex workflows through this central hub

---

*This log is maintained by all agents. Check it before starting work and update it after completing tasks.*
EOF
    echo "   ✅ Created PROJECT_LOG.md"
fi

# Update agent count in registry if needed
if [ -f "AGENT_REGISTRY.md" ]; then
    current_count=$(ls -1 "$AGENTS_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
    
    # Update count in registry if different (macOS compatible sed)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/contains \*\*[0-9]* specialized agents\*\*/contains **$current_count specialized agents**/" AGENT_REGISTRY.md 2>/dev/null
    else
        sed -i "s/contains \*\*[0-9]* specialized agents\*\*/contains **$current_count specialized agents**/" AGENT_REGISTRY.md 2>/dev/null
    fi
fi

echo "✅ Agent context system updated successfully!"
echo ""  
echo "📋 Master Context Files:"
echo "   • AGENT_REGISTRY.md - Master agent list and capabilities"
echo "   • AGENT_CONTEXT.md - Agent operating environment guide"
echo "   • PROJECT_LOG.md - Inter-agent communication hub"
echo ""
echo "🤖 All $current_count agents now have master context awareness"
echo "💡 Agents automatically reference these files for coordination"