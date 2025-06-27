---
trigger: always_on
---

When given a big task, organize the task into a list of subtasks, if possible.

# Organizing and Following up on tasks

In .cursor/tasks folder, create a file for that task, the name should be structure like <project-name>-<shortGeneralTitle>-<date>.md
Observation: The current date must be in MM-DD-YYYY format, and must be fetched dynamically from the system using `date +%m-%d-%Y` macos shell command.
The task file should be a markdown file with the following sections:

- Title
- Description
- Initial Prompt
- Subtasks
- Errors/Issues/Problems/Challenges/Questions/Concerns (If I correct you, make sure to update information here)
- Notes
- Links, resources and references used
- Status (TODO, IN_PROGRESS, COMPLETED, ABANDONED)

Make sure to always update the task file as you work on or finish each subtask, and to check back on it regularly so you know what to do next.

The task file will essentially be your memory, and a place to store information that you want to remember.
