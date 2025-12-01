---
name: component-workflow-squad
description: A squad of agents that work together to complete a full component development workflow: refactoring, testing, and documentation.
agents:
  - react-clean-code-refactor
  - react-test-generator
  - component-docs-writer
execution: parallel
---

# Component Workflow Squad

This squad coordinates three specialized agents to complete a comprehensive component development workflow:

1. **react-clean-code-refactor**: Refactors React components to improve code quality
2. **react-test-generator**: Generates comprehensive unit tests
3. **component-docs-writer**: Creates detailed component documentation

## Usage

When you have a React component that needs:

- Code quality improvements
- Test coverage
- Documentation

This squad will coordinate all three agents to work in parallel on the same component file.

## Execution Order

All agents run in parallel since they:

- Read the same component file independently
- Produce different outputs (refactored code, tests, docs)
- Do not depend on each other's outputs

## Input

Provide the path to the React component file you want to process.

## Output

- Refactored component code
- Comprehensive test file (`.test.tsx`)
- Component documentation (`.md`)
