# PROJECT MANIFESTO
## The Philosophical North Star

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
- **Types are documentation** - Let TypeScript work for you
- **Test behavior, not implementation** - Tests should survive refactoring
- **Every function should do one thing** - And do it well
- **Dependencies are debt** - Every package is a liability

### On Team Collaboration
- **Strong opinions, loosely held** - Be confident but flexible
- **Assume positive intent** - Everyone wants the project to succeed
- **Share context liberally** - Over-communicate rather than under
- **Celebrate small wins** - Progress compounds

---

## Technical Principles

### Architecture
1. **Vertical slice first** - One complete path before breadth
2. **Foundation before features** - Solid base prevents future pain
3. **Services own their data** - No shared databases
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
2. **Monitor what matters** - Alert on user impact, not CPU
3. **Plan for failure** - Everything will break eventually
4. **Document runbooks** - Future you will thank you

---

## Project-Specific Values

### [To be filled by manifesto-generator agent based on project requirements]
- **Value 1**: [Specific to this project]
- **Value 2**: [Specific to this project]
- **Value 3**: [Specific to this project]

---

## Decision Framework

When facing a decision, ask:
1. Does this align with our maxims?
2. Does this make the system more maintainable?
3. Does this improve user experience?
4. Can this be simpler?
5. Will future developers understand this?

---

## Anti-Patterns to Avoid

### Never Do This
- **God objects** - Classes that do everything
- **Magic numbers** - Use named constants
- **Premature optimization** - Profile first
- **Copy-paste programming** - Extract common patterns
- **Ignoring errors** - Handle or explicitly document why not
- **Mixing concerns** - Separate business logic from infrastructure
- **Building for scale you don't have** - YAGNI (You Aren't Gonna Need It)

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

## Remember

We're not just building software. We're building:
- A system that evolves gracefully
- A codebase that teaches
- An experience that delights
- A foundation for the future

Every line of code is a promise to future maintainers. Make it a promise worth keeping.

---

*This manifesto is a living document. It evolves as we learn.*