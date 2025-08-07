#!/bin/bash

# Claude Code Agent System - Status Check Script
# Usage: ./agent-status.sh

set -e

if [ ! -f "TASKS/STATUS.json" ]; then
    echo "❌ No agent system detected in current directory"
    echo "Run this from a project initialized with the Claude Code Agent System"
    exit 1
fi

echo "📊 Claude Code Agent System Status"
echo "=================================="

# Project info
PROJECT=$(jq -r '.project // "Unknown"' TASKS/STATUS.json)
PHASE=$(jq -r '.phase // "Unknown"' TASKS/STATUS.json)
echo "🏗️  Project: $PROJECT"
echo "📍 Current Phase: $PHASE"
echo ""

# Task summary
echo "📋 Task Summary"
echo "---------------"
TOTAL=$(jq -r '.summary.total_tasks // 0' TASKS/STATUS.json)
COMPLETED=$(jq -r '.summary.completed // 0' TASKS/STATUS.json)
IN_PROGRESS=$(jq -r '.summary.in_progress // 0' TASKS/STATUS.json)
BLOCKED=$(jq -r '.summary.blocked // 0' TASKS/STATUS.json)
ERRORED=$(jq -r '.summary.errored // 0' TASKS/STATUS.json)
QUEUED=$(jq -r '.summary.queued // 0' TASKS/STATUS.json)

echo "📊 Total Tasks: $TOTAL"
echo "✅ Completed: $COMPLETED"
echo "🔄 In Progress: $IN_PROGRESS"
echo "⚠️  Blocked: $BLOCKED"
echo "❌ Errored: $ERRORED"
echo "⏳ Queued: $QUEUED"

if [ "$TOTAL" -gt 0 ]; then
    PROGRESS=$(echo "scale=1; $COMPLETED * 100 / $TOTAL" | bc -l)
    echo "📈 Progress: ${PROGRESS}%"
fi

echo ""

# Active tasks
if [ "$IN_PROGRESS" -gt 0 ]; then
    echo "🔄 Active Tasks"
    echo "---------------"
    jq -r '.active_tasks[]? | "🤖 \(.agent): \(.task)"' TASKS/STATUS.json
    echo ""
fi

# Blocked tasks
if [ "$BLOCKED" -gt 0 ]; then
    echo "⚠️  Blocked Tasks"
    echo "-----------------"
    jq -r '.blocked_tasks[]? | "🚧 \(.task): \(.blocker)"' TASKS/STATUS.json
    echo ""
fi

# Recent completions
RECENT_COUNT=$(jq -r '.recent_completions | length' TASKS/STATUS.json)
if [ "$RECENT_COUNT" -gt 0 ]; then
    echo "✅ Recent Completions"
    echo "--------------------"
    jq -r '.recent_completions[]? | "✓ \(.task) (\(.completed | split("T")[0]))"' TASKS/STATUS.json | head -5
    echo ""
fi

# Velocity metrics
if [ -f "TASKS/METRICS.json" ]; then
    echo "📊 Velocity Metrics"
    echo "-------------------"
    TASKS_PER_HOUR=$(jq -r '.velocity.tasks_per_hour // 0' TASKS/METRICS.json)
    AVG_DURATION=$(jq -r '.velocity.average_task_duration // "unknown"' TASKS/METRICS.json)
    echo "🚀 Tasks/Hour: $TASKS_PER_HOUR"
    echo "⏱️  Avg Duration: $AVG_DURATION"
    
    EST_COMPLETION=$(jq -r '.projections.estimated_completion // null' TASKS/METRICS.json)
    if [ "$EST_COMPLETION" != "null" ]; then
        echo "🎯 Est. Completion: $(echo $EST_COMPLETION | cut -d'T' -f1)"
    fi
    echo ""
fi

# Next steps
echo "🎯 Next Steps"
echo "-------------"
if [ "$IN_PROGRESS" -eq 0 ] && [ "$QUEUED" -gt 0 ]; then
    echo "Ready for next agent to claim a task"
elif [ "$IN_PROGRESS" -gt 0 ]; then
    echo "Agents are actively working..."
elif [ "$BLOCKED" -gt 0 ]; then
    echo "⚠️  Review blocked tasks and resolve blockers"
elif [ "$TOTAL" -eq 0 ]; then
    echo "🚀 Run vision-challenger agent to start the project"
else
    echo "🎉 All tasks complete! Project ready for deployment"
fi

# Dashboard link
if [ -d "project-dashboard" ]; then
    echo ""
    echo "🖥️  View real-time dashboard: open project-dashboard/index.html"
fi