---
name: generate-commit-message
description: |
  A comprehensive guide and set of conventions for generating git commit messages. Use this skill whenever asked to write or generate a commit message for git diffs or staged changes.
---

# Commit message conventions

A comprehensive overview of the common commit message conventions across different categories. When you are given git diff code changes and asked to write a commit message, or if no git diff is given but there are staged changes, ALWAYS follow these instructions to write the commit message.

## Instruction

### **Files to consider for generating commit message**

- You are given git diff code changes and asked to write a commit message.
- You are given staged changes and asked to write a commit message.
- You are given a commit message and asked to generate a commit message.

### **Strict Constraints**

- **Source of Truth:** All analysis MUST be performed on the content of `.tmp/diff.txt`.
- Only generate the commit message based on staged changes (files in the index) (git diff --cached)
- Do not include details from unstaged/working directory changes or the entire file history unless they are explicitly marked as staged in the provided diff

### **Execution & Environment Control**

- **Pre-Analysis Step:** Before analyzing the changes, run `git diff --cached > .tmp/diff.txt`.
- **Scope:** ONLY use the content within `.tmp/diff.txt` to generate the message. Do not perform a general `git diff` or look at unstaged files.
- **Cleanup:** - Delete `.tmp/diff.txt` immediately after the commit message is generated.
  - Remove any other temporary buffers or logs created during the analysis.
  - Do not leave `COMMIT_EDITMSG` artifacts in the project root.

### **Commit Message Format**

**Prefix format:**

- `feat(module)` — for new features
- `fix(module)` — for bug fixes
- `typings(module)` — for type/interface/schema changes
- `chore(module)` — for non-functional cleanup or tooling
- `refactor(module)` — for internal code improvements
- `docs(module)` — for documentation updates
- `test(module)` — for testing additions or changes

---

### **Commit Description Guidelines**

- All messages **must be in present tense**
  - Good: Add filtering to reports
  - Bad: Added filtering to reports
- Avoid repetition in messages
- Do NOT output any introductory paragraphs or summary text before the bullet points.
- Only output the commit header and the bulleted list.
- Keep the tone informative but concise — no fluff or dramatic language
- If the commit is complex, provide a strict, objective 1-2 sentence summary explaining the technical reason (the "Why") for the change before listing the bullet points.
- Describe known issues or limitations if any
- Use backticks (\`) for filenames, code, or API references when needed
- Commit header format will be like: `feat(module): implement a new feature under this module`
- Always use markdown format for commit message so i can do copy-paste

---

### **Workflow:**

1. Dump staged changes: `git diff --cached > .tmp/diff.txt`
2. Read and analyze `.tmp/diff.txt`
3. Generate message following the "Commit Message Format"
4. Cleanup the temporary file

---

### **What to Avoid**

- No **terminal punctuation** (no `.` at the end of lines)
- Avoid using the file names or variables in the commit message header
- Avoid **fluff** or **dramatic language**
- Avoid restating the commit header in the description
- **Strictly remove all internal system-generated metadata**, such as `(cci:1://...)` links or any auto-generated code context identifiers, before outputting the final message. These must not be present in the final commit text.

---

### **Bullet Point Description Style (when needed)**

If a bullet-style description is used:

- Begin after the prefix + summary line
- Use bullet points like:

  ```plaintext
  - Add ability to filter results by category
  - Remove deprecated `xyzService` from module loader
  - Fix crash when submitting empty form
  ```
