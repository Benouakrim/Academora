# 🤖 AI Agent Navigation System - AcademOra

**Last Updated**: 2025-11-10  
**Version**: 1.0.0

---

## 🎯 Purpose
This directory contains the complete architectural documentation for AI agents working on AcademOra. **READ THIS FIRST** before implementing any feature, making changes, or analyzing the codebase.

---

## 📋 Quick Start for AI Agents

### Before ANY Code Changes:
1. ✅ Read `INDEX.md` (this file) - Overview and navigation
2. ✅ Read `PHILOSOPHY.md` - Code structure and conventions
3. ✅ Read `FILE_REGISTRY.md` - Locate existing functionality
4. ✅ Read `TECH_STACK.md` - Technologies and dependencies
5. ✅ Check `KNOWN_ISSUES.md` - Current bugs and limitations
6. ✅ Review `DESIGN_SYSTEM.md` - Styling architecture

### When Implementing Features:
1. Search `FILE_REGISTRY.md` for existing similar functionality
2. Check `ARCHITECTURE.md` for structural patterns
3. Verify naming conventions in `PHILOSOPHY.md`
4. Follow style rules in `DESIGN_SYSTEM.md`
5. Update `CHANGELOG.md` with your changes
6. Document new bugs in `KNOWN_ISSUES.md`

---

## 📂 Documentation Structure

### Core References (Read First)
| File | Purpose | When to Use |
|------|---------|-------------|
| **INDEX.md** | This file - navigation hub | Always start here |
| **PHILOSOPHY.md** | Code structure, naming, conventions | Before writing any code |
| **FILE_REGISTRY.md** | Complete file inventory with purposes | Before adding new files |
| **ARCHITECTURE.md** | System design and patterns | When implementing features |

### Technical Specifications
| File | Purpose | When to Use |
|------|---------|-------------|
| **TECH_STACK.md** | Technologies, versions, dependencies | Setup, dependencies, upgrades |
| **DESIGN_SYSTEM.md** | Styling architecture and tokens | Any UI/styling work |
| **API_CONTRACTS.md** | Backend API endpoints and schemas | Data fetching, mutations |
| **DATABASE_SCHEMA.md** | Supabase tables and relationships | Database queries |

### Development Workflow
| File | Purpose | When to Use |
|------|---------|-------------|
| **CHANGELOG.md** | Chronological change history | After implementing changes |
| **KNOWN_ISSUES.md** | Current bugs and technical debt | Before fixing bugs, planning work |
| **TESTING_GUIDE.md** | Testing strategy and patterns | Writing tests |
| **DEPLOYMENT.md** | Build and deployment process | Deployment issues |

### Feature Documentation
| File | Purpose | When to Use |
|------|---------|-------------|
| **FEATURES_MAP.md** | Complete feature inventory | Checking if feature exists |
| **COMPONENTS_LIBRARY.md** | Reusable component catalog | Before creating components |
| **HOOKS_LIBRARY.md** | Custom React hooks inventory | Before creating hooks |
| **UTILITIES_INDEX.md** | Helper functions and utilities | Before writing utility functions |

---

## 🚨 Critical Rules for AI Agents

### ⛔ DO NOT:
- ❌ Create new files without checking `FILE_REGISTRY.md` first
- ❌ Add new components without checking `COMPONENTS_LIBRARY.md`
- ❌ Use inline styles (see `DESIGN_SYSTEM.md`)
- ❌ Duplicate existing functionality
- ❌ Ignore naming conventions in `PHILOSOPHY.md`
- ❌ Create new design patterns without architectural justification
- ❌ Add dependencies without documenting in `TECH_STACK.md`
- ❌ Skip updating `CHANGELOG.md` after changes

### ✅ ALWAYS:
- ✅ Search existing codebase before creating new code
- ✅ Follow established patterns in `ARCHITECTURE.md`
- ✅ Use design system components from `COMPONENTS_LIBRARY.md`
- ✅ Maintain naming conventions from `PHILOSOPHY.md`
- ✅ Update documentation after making changes
- ✅ Reference design tokens for all styling
- ✅ Check API contracts before data fetching
- ✅ Document new bugs immediately

---

## 🗺️ Project Structure Overview

```
academora/
├── .ai/                          # ← YOU ARE HERE (AI Documentation)
│   ├── INDEX.md                  # This file - start here
│   ├── PHILOSOPHY.md             # Code structure & conventions
│   ├── FILE_REGISTRY.md          # Complete file inventory
│   ├── ARCHITECTURE.md           # System design patterns
│   ├── TECH_STACK.md            # Technologies & dependencies
│   ├── DESIGN_SYSTEM.md         # Styling architecture
│   ├── API_CONTRACTS.md         # Backend endpoints
│   ├── DATABASE_SCHEMA.md       # Supabase schema
│   ├── CHANGELOG.md             # Change history
│   ├── KNOWN_ISSUES.md          # Bugs & technical debt
│   ├── FEATURES_MAP.md          # Feature inventory
│   ├── COMPONENTS_LIBRARY.md    # Component catalog
│   ├── HOOKS_LIBRARY.md         # Hooks inventory
│   ├── UTILITIES_INDEX.md       # Helper functions
│   ├── TESTING_GUIDE.md         # Testing patterns
│   └── DEPLOYMENT.md            # Deployment process
│
├── src/                          # Source code
│   ├── components/              # Reusable UI components
│   ├── pages/                   # Route pages
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities & services
│   ├── styles/                  # Design system tokens
│   ├── context/                 # React contexts
│   └── types/                   # TypeScript definitions
│
├── server/                       # Backend API
│   ├── routes/                  # Express routes
│   ├── services/                # Business logic
│   └── middleware/              # Express middleware
│
└── docs/                         # Feature documentation
    └── *.md                     # Individual feature guides
```

---

## 🔍 Common Workflows

### 1. "User asks to add a new page"
```
1. Check FILE_REGISTRY.md → "pages/" section
2. Verify page doesn't exist
3. Check PHILOSOPHY.md → Page naming conventions
4. Check ARCHITECTURE.md → Page structure pattern
5. Check COMPONENTS_LIBRARY.md → Reusable layouts
6. Check DESIGN_SYSTEM.md → Styling approach
7. Implement following established patterns
8. Update FILE_REGISTRY.md with new page
9. Update FEATURES_MAP.md if it's a feature page
10. Update CHANGELOG.md with changes
```

### 2. "User asks to fix styling issues"
```
1. Read DESIGN_SYSTEM.md → Styling rules
2. Check STYLE_GUIDELINES.md (root) → NO inline styles
3. Check COMPONENTS_LIBRARY.md → AnimatedBackground, ProgressBar
4. Verify design tokens in src/styles/tokens/
5. Use Tailwind utilities or design components
6. Never add inline style={{}}
7. Update KNOWN_ISSUES.md if bug found
```

### 3. "User asks to add a feature"
```
1. Check FEATURES_MAP.md → Feature already exists?
2. Check FILE_REGISTRY.md → Related files
3. Check COMPONENTS_LIBRARY.md → Reusable components
4. Check API_CONTRACTS.md → Backend support
5. Check ARCHITECTURE.md → Feature structure pattern
6. Implement using existing patterns
7. Update FEATURES_MAP.md with new feature
8. Update CHANGELOG.md
9. Document in docs/ if significant
```

### 4. "User reports a bug"
```
1. Check KNOWN_ISSUES.md → Already documented?
2. Reproduce and analyze
3. Check FILE_REGISTRY.md → Locate affected files
4. Fix following PHILOSOPHY.md patterns
5. Update KNOWN_ISSUES.md → Mark as fixed
6. Update CHANGELOG.md
7. Test thoroughly
```

### 5. "User wants to add a new component"
```
1. Check COMPONENTS_LIBRARY.md → Component exists?
2. Check DESIGN_SYSTEM.md → Styling approach
3. Check PHILOSOPHY.md → Component naming
4. Check ARCHITECTURE.md → Component structure
5. Create in src/components/
6. Update COMPONENTS_LIBRARY.md with new component
7. Update FILE_REGISTRY.md
8. Update CHANGELOG.md
```

---

## 📊 File Hierarchy by Importance

### Tier 1: Critical (Must Read Before Any Work)
1. `INDEX.md` - You are here
2. `PHILOSOPHY.md` - How we write code
3. `FILE_REGISTRY.md` - What exists already
4. `DESIGN_SYSTEM.md` - How we style

### Tier 2: Essential (Read for Feature Work)
5. `ARCHITECTURE.md` - How we structure
6. `FEATURES_MAP.md` - What features exist
7. `COMPONENTS_LIBRARY.md` - What components exist
8. `API_CONTRACTS.md` - How we fetch data

### Tier 3: Reference (Use As Needed)
9. `TECH_STACK.md` - What technologies we use
10. `DATABASE_SCHEMA.md` - What data we store
11. `HOOKS_LIBRARY.md` - What hooks exist
12. `UTILITIES_INDEX.md` - What helpers exist

### Tier 4: Operational (Update After Work)
13. `CHANGELOG.md` - What changed when
14. `KNOWN_ISSUES.md` - What's broken
15. `TESTING_GUIDE.md` - How we test
16. `DEPLOYMENT.md` - How we deploy

---

## 🎓 Understanding the Documentation System

### Why This System Exists
**Problem**: AI agents often:
- Duplicate existing functionality
- Violate architectural patterns
- Add unnecessary code
- Break naming conventions
- Waste tokens on research
- Create technical debt

**Solution**: This documentation system provides:
- Complete codebase inventory
- Clear architectural rules
- Established patterns to follow
- Quick reference for existing code
- Change tracking and history

### How to Use This System

**As an AI Agent, your workflow is:**

```
┌─────────────────────────────────────────────────┐
│  1. User makes request                          │
└────────────────┬────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────┐
│  2. Read INDEX.md (this file)                   │
│     → Understand documentation structure        │
└────────────────┬────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────┐
│  3. Check FILE_REGISTRY.md                      │
│     → Does functionality already exist?         │
│     → Where are related files?                  │
└────────────────┬────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────┐
│  4. Read PHILOSOPHY.md                          │
│     → What are naming conventions?              │
│     → What are structural rules?                │
└────────────────┬────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────┐
│  5. Check relevant specialized docs             │
│     → DESIGN_SYSTEM.md for styling              │
│     → ARCHITECTURE.md for patterns              │
│     → API_CONTRACTS.md for data                 │
└────────────────┬────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────┐
│  6. Implement changes following patterns        │
└────────────────┬────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────┐
│  7. Update documentation                        │
│     → CHANGELOG.md with changes                 │
│     → FILE_REGISTRY.md if new files             │
│     → KNOWN_ISSUES.md if bugs found/fixed       │
│     → Relevant specialized docs                 │
└─────────────────────────────────────────────────┘
```

---

## 🔗 Quick Links

### Before Starting Work
- [Philosophy & Conventions](./PHILOSOPHY.md) - Code structure rules
- [File Registry](./FILE_REGISTRY.md) - What files exist
- [Architecture Guide](./ARCHITECTURE.md) - Design patterns

### During Development  
- [Design System](./DESIGN_SYSTEM.md) - Styling rules
- [Components Library](./COMPONENTS_LIBRARY.md) - Reusable components
- [API Contracts](./API_CONTRACTS.md) - Data fetching

### After Completion
- [Changelog](./CHANGELOG.md) - Document changes
- [Known Issues](./KNOWN_ISSUES.md) - Update bugs
- [File Registry](./FILE_REGISTRY.md) - Register new files

---

## 📞 When in Doubt

**Question**: "Should I create a new [file/component/pattern]?"  
**Answer**: Check `FILE_REGISTRY.md` and `COMPONENTS_LIBRARY.md` first. If it doesn't exist and is truly needed, follow `PHILOSOPHY.md` naming conventions.

**Question**: "How should I style this?"  
**Answer**: Read `DESIGN_SYSTEM.md`. Use Tailwind utilities or design system components. NEVER inline styles.

**Question**: "What's the right way to structure this?"  
**Answer**: Check `ARCHITECTURE.md` for established patterns. Follow existing examples.

**Question**: "Does this feature already exist?"  
**Answer**: Check `FEATURES_MAP.md` for features, `COMPONENTS_LIBRARY.md` for components.

**Question**: "Something is broken, what do I do?"  
**Answer**: Check `KNOWN_ISSUES.md` first. Document new bugs there immediately.

---

## 🎯 Success Criteria for AI Agents

**You are successful when:**
- ✅ You found and reused existing code instead of duplicating
- ✅ You followed naming conventions from `PHILOSOPHY.md`
- ✅ You used design system components from `COMPONENTS_LIBRARY.md`
- ✅ You maintained architectural patterns from `ARCHITECTURE.md`
- ✅ You updated documentation after changes
- ✅ You didn't add unnecessary new files or code
- ✅ You minimized token consumption through documentation reference

**You failed when:**
- ❌ You duplicated existing functionality
- ❌ You violated naming conventions
- ❌ You used inline styles
- ❌ You created new patterns without justification
- ❌ You didn't update documentation
- ❌ You added unnecessary complexity
- ❌ You wasted tokens searching instead of reading docs

---

## 📝 Documentation Maintenance

**Keep documentation updated:**
- Update `CHANGELOG.md` after every session
- Update `FILE_REGISTRY.md` when adding/removing files
- Update `KNOWN_ISSUES.md` when bugs found/fixed
- Update `FEATURES_MAP.md` when features added/removed
- Update specialized docs when patterns change

**Documentation is code.** Treat it with the same care.

---

## 🚀 Version History

- **v1.0.0** (2025-11-10): Initial AI documentation system created
  - Complete file registry
  - Code philosophy and conventions
  - Architecture patterns
  - Design system documentation
  - Change tracking system

---

## 📖 Further Reading

After mastering the core documentation:
1. Explore individual feature docs in `/docs/`
2. Review root-level guides (STYLE_GUIDELINES.md, MVP_LAUNCH_GUIDE.md)
3. Study existing components for patterns
4. Review git history for context on changes

---

**Remember**: This documentation exists to **save time**, **prevent mistakes**, and **maintain consistency**. Use it religiously. Update it diligently. Trust it completely.

**Happy coding! 🎉**
