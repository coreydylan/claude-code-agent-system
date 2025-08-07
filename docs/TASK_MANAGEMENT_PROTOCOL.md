# Task Management Protocol
## Universal System for Agent Task Coordination

This protocol defines how ALL agents interact with the TASKS/ folder structure to maintain perfect coordination and visibility.

---

## Task File Structure

```
TASKS/
├── ACTIVE/                    # Currently being worked on
│   ├── agent-name-task.md    # One file per active agent
│   └── ...
├── QUEUE/                     # Ready to start
│   ├── PRIORITY/             # Must do next
│   │   └── [ ] task-name.md
│   └── STANDARD/             # Normal priority
│       └── [ ] task-name.md
├── BLOCKED/                   # Waiting on dependencies
│   └── [!] task-name.md      # With blocker details
├── COMPLETE/                  # Finished tasks
│   └── [x] task-name.md      # With completion notes
├── ERROR/                     # Failed tasks
│   └── [E] task-name.md      # With error details
├── PHASE-0-TOOLING/          # Phase-specific organization
├── PHASE-1-FOUNDATION/
├── PHASE-2-VERTICAL/
├── PHASE-3-ADMIN/
├── PHASE-4-SERVICES/
├── PHASE-5-DELIVERY/
├── PHASE-6-DEVOPS/
├── PHASE-7-PRODUCTION/
├── STATUS.json               # Real-time status
├── METRICS.json              # Progress metrics
└── README.md                 # This protocol

```

---

## Task Status Prefixes

Every task filename MUST start with a status prefix:

- `[ ]` - Not started (in QUEUE)
- `[~]` - In progress (in ACTIVE)
- `[x]` - Complete (in COMPLETE)
- `[!]` - Blocked (in BLOCKED)
- `[E]` - Error (in ERROR)
- `[P]` - Priority (in QUEUE/PRIORITY)

---

## Task File Format

Every task file MUST follow this structure:

```markdown
# Task: [Clear task name]
**ID**: TASK-[PHASE]-[NUMBER]
**Status**: [ ] | [~] | [x] | [!] | [E]
**Priority**: HIGH | MEDIUM | LOW
**Agent**: [assigned-agent-name or "unassigned"]
**Created**: [ISO-8601 timestamp]
**Started**: [ISO-8601 timestamp or null]
**Completed**: [ISO-8601 timestamp or null]

## Objective
[One clear sentence describing what needs to be done]

## Dependencies
- [ ] Dependency 1 (TASK-ID)
- [ ] Dependency 2 (TASK-ID)

## Steps
1. [Specific action]
2. [Next specific action]
3. [Continue with exact steps]

## Acceptance Criteria
- [ ] Tests pass
- [ ] Types compile
- [ ] Documentation updated
- [ ] [Specific success criteria]

## Time Estimate
[X hours]

## Agent Log
### [Timestamp] - [Agent Name] - CLAIMED
Taking ownership of this task.

### [Timestamp] - [Agent Name] - STARTED
Beginning work. [Initial observations]

### [Timestamp] - [Agent Name] - UPDATE
[Progress update]

### [Timestamp] - [Agent Name] - BLOCKED
Blocked by: [Specific blocker]
Need: [What would unblock]

### [Timestamp] - [Agent Name] - COMPLETED
Task complete. [Summary of what was done]
Files created: [list]
Files modified: [list]
Next task: [TASK-ID]

## Notes
[Any additional context, decisions, or learnings]
```

---

## Agent Task Interaction Protocol

### 1. Finding Next Task

```bash
# Check for priority tasks first
ls TASKS/QUEUE/PRIORITY/\[ \]*.md | head -1

# If none, check standard queue
ls TASKS/QUEUE/STANDARD/\[ \]*.md | head -1

# If none, check phase-specific
ls TASKS/PHASE-*/\[ \]*.md | head -1
```

### 2. Claiming a Task

```bash
# 1. Move from queue to active
mv TASKS/QUEUE/STANDARD/[ ]\ task-name.md \
   TASKS/ACTIVE/[~]\ agent-name-task-name.md

# 2. Update task file
sed -i 's/Status: \[ \]/Status: [~]/' [task-file]
sed -i "s/Agent: unassigned/Agent: $AGENT_NAME/" [task-file]

# 3. Add claim entry to Agent Log
echo "### $(date -Iseconds) - $AGENT_NAME - CLAIMED" >> [task-file]
echo "Taking ownership of this task." >> [task-file]

# 4. Update STATUS.json
jq ".active_tasks += [{\"task\": \"$TASK_ID\", \"agent\": \"$AGENT_NAME\"}]" \
   TASKS/STATUS.json > tmp && mv tmp TASKS/STATUS.json
```

### 3. Working on a Task

```bash
# Regular updates (every significant step)
echo "### $(date -Iseconds) - $AGENT_NAME - UPDATE" >> [task-file]
echo "[What you just did or discovered]" >> [task-file]

# Update metrics
jq ".tasks_in_progress = $COUNT" TASKS/METRICS.json > tmp && mv tmp TASKS/METRICS.json
```

### 4. Handling Blocks

```bash
# 1. Move to blocked folder
mv TASKS/ACTIVE/[~]\ task-name.md \
   TASKS/BLOCKED/[!]\ task-name.md

# 2. Update status
sed -i 's/Status: \[~\]/Status: [!]/' [task-file]

# 3. Log the blocker
echo "### $(date -Iseconds) - $AGENT_NAME - BLOCKED" >> [task-file]
echo "Blocked by: [specific issue]" >> [task-file]
echo "Need: [what would unblock]" >> [task-file]

# 4. Update STATUS.json
jq ".blocked_tasks += [{\"task\": \"$TASK_ID\", \"blocker\": \"$REASON\"}]" \
   TASKS/STATUS.json > tmp && mv tmp TASKS/STATUS.json
```

### 5. Completing a Task

```bash
# 1. Move to complete folder
mv TASKS/ACTIVE/[~]\ task-name.md \
   TASKS/COMPLETE/[x]\ task-name.md

# 2. Update status
sed -i 's/Status: \[~\]/Status: [x]/' [task-file]
sed -i "s/Completed: null/Completed: $(date -Iseconds)/" [task-file]

# 3. Log completion
echo "### $(date -Iseconds) - $AGENT_NAME - COMPLETED" >> [task-file]
echo "Task complete. [Summary]" >> [task-file]

# 4. Update metrics
jq ".tasks_completed += 1" TASKS/METRICS.json > tmp && mv tmp TASKS/METRICS.json
```

### 6. Error Handling

```bash
# 1. Move to error folder
mv TASKS/ACTIVE/[~]\ task-name.md \
   TASKS/ERROR/[E]\ task-name.md

# 2. Update status
sed -i 's/Status: \[~\]/Status: [E]/' [task-file]

# 3. Log the error
echo "### $(date -Iseconds) - $AGENT_NAME - ERROR" >> [task-file]
echo "Error: [error message]" >> [task-file]
echo "Attempted fixes: [what you tried]" >> [task-file]

# 4. Trigger error-manager
echo "{\"task\": \"$TASK_ID\", \"error\": \"$ERROR\"}" >> TASKS/ERROR/queue.json
```

---

## STATUS.json Structure

Maintained in real-time by all agents:

```json
{
  "timestamp": "2025-08-07T10:00:00Z",
  "phase": "PHASE-1-FOUNDATION",
  "summary": {
    "total_tasks": 142,
    "completed": 45,
    "in_progress": 3,
    "blocked": 2,
    "errored": 1,
    "queued": 91
  },
  "active_tasks": [
    {
      "task": "TASK-1-001",
      "agent": "foundation-architect",
      "started": "2025-08-07T10:00:00Z",
      "progress": "Creating type system"
    }
  ],
  "blocked_tasks": [
    {
      "task": "TASK-2-005",
      "blocker": "Waiting for database schema",
      "blocked_since": "2025-08-07T09:30:00Z"
    }
  ],
  "recent_completions": [
    {
      "task": "TASK-0-015",
      "agent": "task-executor",
      "completed": "2025-08-07T09:45:00Z"
    }
  ]
}
```

---

## METRICS.json Structure

Progress tracking across all phases:

```json
{
  "project": "Edition",
  "started": "2025-08-07T08:00:00Z",
  "phases": {
    "PHASE-0": { "total": 15, "complete": 15, "status": "DONE" },
    "PHASE-1": { "total": 25, "complete": 10, "status": "ACTIVE" },
    "PHASE-2": { "total": 20, "complete": 0, "status": "PENDING" }
  },
  "velocity": {
    "tasks_per_hour": 4.5,
    "average_task_duration": "13 minutes",
    "blocks_per_day": 3
  },
  "projections": {
    "estimated_completion": "2025-08-09T18:00:00Z",
    "confidence": 0.85
  }
}
```

---

## Quick Status Check

Any agent can instantly understand project state:

```bash
# Overall progress
cat TASKS/STATUS.json | jq '.summary'

# What's being worked on
ls TASKS/ACTIVE/

# What's blocked
ls TASKS/BLOCKED/

# Next priority
ls TASKS/QUEUE/PRIORITY/ | head -1

# Phase progress
cat TASKS/METRICS.json | jq '.phases'
```

---

## Rules for All Agents

1. **One Task at a Time**: An agent can only have ONE task in ACTIVE
2. **Always Log**: Every action on a task must be logged in the task file
3. **Update Status**: STATUS.json must reflect real-time state
4. **Check Dependencies**: Never start a task with unmet dependencies
5. **Clean Handoffs**: When blocked, clearly document what's needed
6. **Priority First**: Always check PRIORITY queue before STANDARD
7. **Phase Order**: Complete lower phases before starting higher ones

---

## Conflict Resolution

If two agents try to claim the same task:
1. First to move file to ACTIVE wins
2. Second agent gets filesystem error
3. Second agent finds next available task
4. No manual intervention needed

---

## The Task Lifecycle

```
QUEUE → ACTIVE → COMPLETE
   ↓       ↓
BLOCKED   ERROR
   ↓       ↓
ACTIVE    ACTIVE (after fix)
```

---

## Human Intervention Points

Humans can:
1. Add tasks to QUEUE/PRIORITY for urgent work
2. Move tasks from BLOCKED back to QUEUE when unblocked
3. Review ERROR tasks and provide fixes
4. Check STATUS.json for real-time progress
5. Read any task file for detailed history

---

## Benefits

- **Perfect Visibility**: Every agent knows exact project state
- **No Conflicts**: Filesystem enforces single ownership
- **Complete History**: Every task has full audit trail
- **Self-Documenting**: Task files contain entire context
- **Automatic Coordination**: No central coordinator needed
- **Human-Friendly**: Easy to understand and intervene

This protocol ensures perfect task coordination across all 28 agents without any central management system.