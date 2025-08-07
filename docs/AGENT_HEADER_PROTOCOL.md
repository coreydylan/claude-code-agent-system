# Agent Header Protocol
## Universal Requirements for All Agents

This document defines what EVERY agent must do before starting their specialized work.

---

## The Universal Agent Workflow

### Phase 1: Context Loading (MANDATORY)
Every agent MUST execute these steps in order:

```yaml
1. READ PROJECT_MANIFESTO.md
   - Internalize core maxims
   - Understand decision framework
   - Note project-specific values

2. READ PROJECT_LOG.md
   - Read ENTIRE log from beginning
   - Understand all prior decisions
   - Check for conflicts or blocks
   - Identify your dependencies

3. READ SESSION JOURNAL
   - Read project-dashboard/journal/session-current.md
   - Understand session goals
   - Note any previous agent findings
   - Check for human notes

4. LOG YOUR ACTIVATION
   - To PROJECT_LOG.md (technical log)
   - To session journal (human-readable)
   - timestamp: ISO-8601 format
   - agent: your-name
   - action: 'read'
   - status: 'active'
   - details: "Read manifesto, log, and journal. Understanding: [summary]"
```

### Phase 2: Pre-Execution Checks

```yaml
4. CHECK TASK SYSTEM
   - Read TASKS/STATUS.json for current state
   - Check TASKS/ACTIVE/ for your current task
   - If no task, claim next from QUEUE/PRIORITY or QUEUE/STANDARD
   - Follow TASK_MANAGEMENT_PROTOCOL.md for interactions

5. CHECK FOR CONFLICTS
   - Review file ownership map
   - Verify no other agent is modifying your target files
   - Check if any agent has you blocked

6. CHECK FOR ERRORS
   - Look for any agents in 'error' or 'needs-review' state
   - Check TASKS/ERROR/ for failed tasks
   - If found and related to your work, wait for error-manager

7. VALIDATE DEPENDENCIES
   - Ensure all required inputs exist
   - Verify previous agents completed successfully
   - Check that needed services are configured
   - Check task dependencies are met
```

### Phase 3: Execution (Your Specialized Work)

```yaml
7. LOG WORK START
   - To PROJECT_LOG.md: Technical details
   - To session journal: Human-readable summary
   - action: 'decision' or 'output'
   - status: 'active'
   - details: "Starting [specific task]"

8. EXECUTE YOUR SPECIALIZED TASK
   - Follow your agent-specific instructions
   - Make decisions aligned with manifesto
   - Create/modify files as needed
   - Log key decisions to journal

9. HANDLE PROBLEMS
   - If stuck > 5 min: Set status 'needs-review'
   - If looping > 3x: Set status 'error' and stop
   - If API fails 3x: Set status 'error'
   - Always log full error context
   - Write error details to journal for human visibility
```

### Phase 4: Completion Protocol

```yaml
10. LOG ALL OUTPUTS
    - files_created: [list all new files]
    - files_modified: [list all changed files]  
    - decisions_made: [key decisions with rationale]
    - status: 'complete'

11. UPDATE FILE OWNERSHIP
    - Add any new files you created to ownership map
    - Note if any files should be locked

12. HANDOFF TO NEXT AGENT
    - next_agent: 'agent-name'
    - context: [everything next agent needs]
    - action: 'handoff'
```

---

## Error Handling Requirements

### When You Get Stuck

```yaml
status: 'needs-review'
error_details:
  type: 'timeout' | 'loop' | 'conflict' | 'missing-dep' | 'unknown'
  attempts: [number of attempts made]
  last_error: "Exact error message"
  suggested_fix: "What might resolve this"
```

### Triggering Error Manager

The error-manager will automatically detect when you set status to 'error' or 'needs-review'. Provide maximum context for resolution.

---

## Communication Standards

### Logging Verbosity

- **Decisions**: Log WHY you chose X over Y
- **Changes**: Log WHAT you changed and WHY
- **Problems**: Log full stack traces and context
- **Success**: Log verification that your work is complete

### Context Preservation

Every log entry should contain enough information for:
- Another agent to continue your work
- Error-manager to resolve issues
- Humans to audit decisions
- Future agents to understand history

---

## The Three Laws of Agents

1. **First Law**: An agent must follow the PROJECT_MANIFESTO
2. **Second Law**: An agent must preserve system integrity except where it conflicts with the First Law
3. **Third Law**: An agent must complete its task except where it conflicts with the First or Second Laws

---

## Quick Reference Checklist

Before starting work:
- [ ] Read PROJECT_MANIFESTO.md
- [ ] Read entire PROJECT_LOG.md
- [ ] Log your activation
- [ ] Check for conflicts
- [ ] Validate dependencies

During work:
- [ ] Log work start
- [ ] Follow manifesto principles
- [ ] Log all decisions verbosely
- [ ] Handle errors appropriately

After work:
- [ ] Log all outputs
- [ ] Update file ownership
- [ ] Handoff to next agent
- [ ] Set status 'complete'

---

## Remember

You are part of a larger system. Your work affects every agent that comes after you. Be thorough, be clear, be kind to your fellow agents.