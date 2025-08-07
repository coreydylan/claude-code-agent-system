# Edition Development Quick Start

## Starting Fresh?

```bash
# 1. Check current phase
ls TASKS/PHASE-*/[*] | head -1

# 2. Find next task
ls TASKS/PHASE-0*/*.md | grep "^\[ \]" | head -1

# 3. Start task
code "TASKS/PHASE-0/[ ] 01-initialize-repository.md"

# 4. Complete task
mv "TASKS/PHASE-0/[ ] 01-initialize-repository.md" \
   "TASKS/PHASE-0/[x] 01-initialize-repository.md"
```

## Daily Workflow

### Morning

1. Check blocked tasks: `grep -r "BLOCKED:" TASKS/`
2. Review in-progress: `find TASKS -name "*[~]*"`
3. Pick next task from current phase

### During Development

- Mark task `[~]` when starting
- Add notes to task file as you work
- Run phase verification before marking complete

### End of Day

- Update task status
- Check if phase is complete
- Commit task file changes

## Phase Progression

```
PHASE-0 (1 day)    → Tooling Setup
PHASE-1 (3 days)   → Foundation Layer
PHASE-2 (3 days)   → Vertical Slice ← CRITICAL
PHASE-3 (4 days)   → Admin Console
PHASE-4 (4 days)   → Real Services
PHASE-5 (4 days)   → Delivery
PHASE-6 (2 days)   → DevOps
PHASE-7 (∞)        → Production
```

## Key Commands

```bash
# Show all incomplete tasks
find TASKS -name "[ ]*" -o -name "[~]*" | sort

# Check phase status
ls TASKS/PHASE-1*/*.md | wc -l  # Total
ls TASKS/PHASE-1*/[x]*.md | wc -l  # Complete

# Run phase verification
cat TASKS/PHASE-1*/DONE.md

# Mark task complete
./scripts/complete-task.sh "PHASE-1/01-database-schema"
```

## The Three Laws

1. **Never skip phases** - They build on each other
2. **Vertical slice is sacred** - If it breaks, stop everything
3. **Foundation test must pass** - No features until it does

## Getting Help

- Architecture questions → Check build sequence docs
- Implementation details → Check `.claude/` folder
- Task unclear → Check related PRD sections
- Blocked → Add `BLOCKED: reason` and move on

## Remember

We're building a production system. Every task matters. Every test matters. Every type matters.

**Quality over speed. Foundation over features.**
