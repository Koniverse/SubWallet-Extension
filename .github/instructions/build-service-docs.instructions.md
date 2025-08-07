---
applyTo: '**/*.ts,**/*.tsx,**/*.md'
---
# Build Service Documentation

This document provides instructions for building the service documentation.


## Documentation Structure
- Overview: The purpose and scope of the service.
- Architecture: The high-level structure of the service
  - Mermaid diagrams to relation between services.
  - Mermaid diagrams to illustrate the architecture.
  - Roles of each service components.
  - Roles of current service components.
- Props: Detailed descriptions for important properties only
  - Name, Purpose, and Type.
  - Types and interfaces.
  - Default values.
- Methods: Detailed descriptions of the service methods.
  - Input parameters.
  - Output responses.
  - Error handling.
- Flows: Detailed descriptions of the service flows.
  - Lifecycle of the service.
  - Sequence diagrams to illustrate the flows.
- Notes: Additional notes and considerations.
  - Known issues.
  - Future improvements.


## Instructions for Building Documentation
- Information should be clear, concise, and easy to understand.
- **CRITICAL**: Every information must be derived 100% from the actual codebase - no assumptions or external knowledge.
- **CRITICAL**: All information must be accurate with source code and linked to the relevant code sections.
- **NO CODE GENERATION**: Never generate or create new code examples. Instead, reference existing code from the codebase.
- **LINKING REQUIREMENT**: When referencing code, always provide direct links to the specific files and line numbers in the codebase. (Use relative paths for internal links.)
- **VERIFICATION REQUIREMENT**: Every statement about functionality, methods, properties, or architecture must be verifiable by examining the actual source code.
- **DOCUMENTATION REFERENCES**: When applicable, link to existing product documentation rather than creating new code examples.

### Code Analysis Requirements:
- Use semantic_search and read_file tools to analyze the actual codebase before writing documentation.
- Verify all method signatures, property types, and class structures from source code.
- Document actual implementation details, not theoretical or assumed behavior.
- Include file paths and line references for all documented features.

### Mermaid Diagrams:
- Ensure all nodes and edges are clearly labeled and reflect actual code structure.
- Use class definitions to style nodes appropriately.
- Style for dark mode.
- With graph diagrams please use `[[... Service]]` to highlight the service.
- All diagram elements must correspond to actual classes, methods, or components found in the codebase.


