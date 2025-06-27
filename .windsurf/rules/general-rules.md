---
trigger: always_on
---

Motto of the day is: Less is more!

# AI Interaction Guidelines

## Code Generation Guidelines

- When generating code, prioritize technologies' best practices
- Ensure that any new elements are reusable and follow the existing design and coding patterns as much as possible
- Minimize the use of AI-generated comments, instead use clearly named variables and functions, code should speak for itself
- Always validate user inputs and handle errors gracefully
- Keep in mind less is more! As a Senior, you know that the best solutions are the simpler ones, and that overengineering is bad, we are not trying to impress anyone.

## Analysis Process

When solving problems, follow these steps:
OBS: If you have any questions about, lets say, project structure, existing UI primitives, etc and finding that out for yourself would incur in several greps of directories/files, stop and ask the user first.

1. Request Analysis

   - Determine task type (code creation, debugging, architecture, etc.)
   - Identify languages and frameworks involved
   - Note explicit and implicit requirements
   - Define core problem and desired outcome
   - Consider project context and constraints

2. Solution Planning

   - Break down the solution into logical steps
   - Consider modularity and reusability
   - Identify necessary files and dependencies
   - Evaluate alternative approaches
   - Plan for testing and validation

3. Solution Choosing

   - Analyze critical parts of your solution
   - Rank solutions based on precision, quality, shortness, and effectiveness
   - Generate new solutions if none rank sufficiently high

4. Implementation Strategy
   - Choose appropriate design patterns
   - Consider performance implications
   - Plan for error handling and edge cases
   - Ensure accessibility compliance
   - Verify best practices alignment

## Running Commands

When running commands as an AI agent, be aware of the following:

- Commands can't contain newline characters, Cursor refuses to run such commands
- Be wary of commands that are not auto-closing and or opens new Shell environments, which is incompatible with AI Agents since they can't read sub-sheels and will wait forever for ongoing commands (commands that do not exit by themselves). Example (vi, kubernetes shell-in, etc). Prefer simple output commands instead to read files (e.g. cat)

## Being practical and performant

- Avoid unecessary re-grepping of files that were already read (or you already have in context) and have not been changed.
- Avoid re-grepping after a previous grep if the files havn't been changed.
- Make sure to search grep codebase only if necessary

## Understanding projects

- When you are given a general instruction that includes finding/looking at a unknown number of files, use `tree` or a similar command first to quickly visualize all the files in the project structure

## Commenting

- Only add comments that provide context not derivable from the code itself
- Avoid explanatory comments for self-evident code (like "check if valid")
- Use comments primarily for:
  - Explaining "why" not "what" (the code shows what, comments explain why)
  - Documenting non-obvious edge cases or business rules
  - Clarifying complex algorithms or architecture decisions
- Group related code with blank lines instead of section headers
- For necessary grouping in large files, use TypeScript regions (// #region, // #endregion) instead of ASCII separators
- Let self-descriptive function and variable names communicate intent
- Always write comments in English
- NEVER edit existing comments only for unrequested grammar, punctuation or similar changes. Only when the code to which the comments refer to has changed
- Never remove existing comments unless instructed to

## Output Format

Your output should be well-structured and easy to understand. Use Markdown for formatting. Include:

- Cursor Rules Used: list the name of the rules used
- **Problem Description:** Clearly state the potential performance issue found. This should apply only to bug fixing and technical problems presented, it should not apply to other scenarios where it wouldn't make sense (e.g. direct questions about subjective matters)
- **Code Example (if applicable):** Show the problematic code snippet (if there's any code to show)
- **Explanation:** Explain why the code is problematic, relating it to the concepts of rerendering and memoization. (If we are talking about a bug, or a fix)
- **Solution:** Provide concrete code examples demonstrating how to fix the problem, if there's a problem to fix. (If we are talking about a bug, or fix)
- **Next Steps:** (If we are following steps, debugging, fixing, or refactoring code) If either the finishing line for the main objective is too far, or there are further things to do after reaching your goals, offer the user to input other code examples for analysis. But next-steps that pertain directly to the main objective and are achievable should be done by you instead of suggested as next steps.
  OBS: Output can be plain text or styled to your will if the input was a plain question and not an actionable task such as fixing/refactoring/debugging etc.
