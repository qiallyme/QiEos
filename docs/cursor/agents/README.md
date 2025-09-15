# QiEOS Agent System

This directory contains specialized agent prompts and configurations for different aspects of the QiEOS monorepo development workflow.

## Agent Overview

The QiEOS agent system is designed to provide specialized AI assistance for different domains within the monorepo, following the principle of "right tool for the right job" while maintaining safety and architectural compliance.

## Available Agents

### Core Agents
- **Unlimited Context Agent** - Full-stack understanding and cross-module assistance
- **Auditor Agent** - Code quality, security, and technical debt analysis
- **Logger Agent** - Real-time logging and monitoring systems
- **Conductor Agent** - Application lifecycle and orchestration

### Domain-Specific Agents
- **API Agent** - Cloudflare Worker and backend development
- **UI Agent** - React frontend and user interface development
- **KB/RAG Agent** - Knowledge base and AI/ML systems
- **Migrations Agent** - Database schema and RLS policies

## Agent Principles

### Safety First
- Never delete files - use `.trash/YYYY-MM-DD/` for staging removals
- Respect locked paths and forbidden directories
- Always show diffs before applying changes
- Require explicit approval for mutations

### Architecture Compliance
- Follow the God Doc (`docs/QiEOS.md`) structure
- Maintain separation of concerns between domains
- Enforce RLS policies and security boundaries
- Use established patterns and conventions

### Quality Standards
- Keep files under 400 lines
- Use TypeScript for type safety
- Follow React and Tailwind best practices
- Write small, pure functions

## Usage Guidelines

### Agent Selection
1. **Start with Unlimited Context** for project overview and cross-module work
2. **Switch to specialized agents** for focused domain work
3. **Use Auditor Agent** for code review and quality assurance
4. **Follow the safety workflow** for all changes

### Communication Patterns
- Be explicit about scope and constraints
- Show proposed changes before applying
- Explain architectural decisions and trade-offs
- Document changes in the development log

### Error Handling
- Gracefully handle missing dependencies
- Provide clear error messages and recovery steps
- Suggest alternative approaches when blocked
- Escalate to human review when needed

## Agent Configuration

Each agent is configured with:
- **Role**: Primary responsibility and expertise area
- **Scope**: File paths and modules it can work with
- **Constraints**: Safety rules and architectural boundaries
- **Output Format**: Expected deliverables and communication style

## Integration with Cursor

The agents are designed to work seamlessly with Cursor's custom modes system:
1. Copy agent definitions from this directory
2. Paste into Cursor > Settings > Chat > Custom Modes
3. Activate the appropriate agent for your current task
4. Follow the agent's guidance and safety protocols

## Maintenance

- Update agent definitions when architecture changes
- Review and refine agent prompts based on usage patterns
- Ensure agents stay aligned with project goals and constraints
- Document new agents and their use cases

## Getting Started

1. Read the [CURSOR_MODES.md](../CURSOR_MODES.md) for agent definitions
2. Review the [EDITOR.md](../EDITOR.md) for workflow guidance
3. Start with the Unlimited Context Agent for project overview
4. Switch to specialized agents for focused development work
5. Use the Auditor Agent for quality assurance and code review