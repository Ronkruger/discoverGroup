# Git Automation Scripts Guide

## 📋 Available Scripts

### 1. **git-commit.ps1** - Standard Automated Commit
Stages all changes, commits with a message, and pushes to GitHub.

**Usage:**
```powershell
# With custom message
.\git-commit.ps1 "Add video upload feature"

# With auto-generated timestamp message
.\git-commit.ps1
```

**Features:**
- ✅ Checks for changes
- ✅ Displays what will be committed
- ✅ Stages all changes
- ✅ Commits with your message (or auto-generated)
- ✅ Pushes to current branch
- ✅ Colored output
- ✅ Error handling

---

### 2. **git-quick-save.ps1** - Ultra Fast Save
No prompts, no questions - just saves everything instantly.

**Usage:**
```powershell
.\git-quick-save.ps1
```

**Features:**
- ⚡ Fastest option
- ✅ Auto-generated commit message with timestamp
- ✅ One command to save everything
- ✅ Perfect for frequent saves during development

---

### 3. **git-interactive.ps1** - Interactive Mode
Prompts for commit message and confirms before pushing.

**Usage:**
```powershell
.\git-interactive.ps1
```

**Features:**
- 💬 Prompts for commit message
- 📊 Shows changes before committing
- ✅ Asks confirmation before push
- ✅ More control over the process

---

## 🚀 Quick Start

### First Time Setup (One-time only)

1. **Enable PowerShell script execution:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Make scripts easier to run - Add to PowerShell Profile:**
   ```powershell
   # Open your PowerShell profile
   notepad $PROFILE

   # Add these aliases (adjust path if needed)
   Set-Alias gcom "C:\Users\romsl\Desktop\scratch\discoverGroup-clean\git-commit.ps1"
   Set-Alias gsave "C:\Users\romsl\Desktop\scratch\discoverGroup-clean\git-quick-save.ps1"
   Set-Alias gint "C:\Users\romsl\Desktop\scratch\discoverGroup-clean\git-interactive.ps1"

   # Save and reload
   . $PROFILE
   ```

3. **After setup, use shortcuts anywhere in your project:**
   ```powershell
   gcom "Your message"    # Standard commit
   gsave                   # Quick save
   gint                    # Interactive mode
   ```

---

## 📝 Common Workflows

### Daily Development Flow
```powershell
# Make changes to files...

# Quick save frequently
.\git-quick-save.ps1

# Or with a meaningful message
.\git-commit.ps1 "Implement user authentication"
```

### End of Day Save
```powershell
# Review changes and add descriptive message
.\git-interactive.ps1
```

### Feature Completion
```powershell
# Commit with detailed message
.\git-commit.ps1 "Complete tour video upload feature

- Add video field to Tour schema
- Implement upload UI in admin panel
- Add video display on tour detail page
- Update documentation"
```

---

## 🔧 Advanced Usage

### Commit Multiple Times Without Push
```powershell
# Modify git-commit.ps1 to skip push:
# Comment out the push section or pass a -NoPush flag
```

### Auto-commit on File Save (VS Code)
Install "Run on Save" extension and configure:
```json
{
  "emeraldwalk.runonsave": {
    "commands": [
      {
        "match": ".*",
        "cmd": "powershell -File git-quick-save.ps1"
      }
    ]
  }
}
```

### Schedule Automatic Commits
Create a scheduled task in Windows Task Scheduler:
```powershell
# Run git-quick-save.ps1 every hour
schtasks /create /tn "Auto Git Save" /tr "powershell -File C:\path\to\git-quick-save.ps1" /sc hourly
```

---

## 🛡️ Safety Features

All scripts include:
- ✅ Git repository detection
- ✅ Change detection (won't commit if nothing changed)
- ✅ Error handling
- ✅ Clear status messages
- ✅ Exit codes for automation

---

## 🐛 Troubleshooting

### "Cannot be loaded because running scripts is disabled"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Not a git repository"
Make sure you're in the project root folder:
```powershell
cd C:\Users\romsl\Desktop\scratch\discoverGroup-clean
```

### Push fails with authentication error
```powershell
# Configure Git credentials
git config credential.helper store

# Next push will prompt for credentials and save them
```

### Script doesn't run
```powershell
# Use full path
powershell -File "C:\path\to\git-commit.ps1" "message"

# Or navigate to project folder first
cd C:\Users\romsl\Desktop\scratch\discoverGroup-clean
.\git-commit.ps1 "message"
```

---

## 💡 Tips & Best Practices

### Commit Message Guidelines
**Good:**
- ✅ "Add video upload to tour detail page"
- ✅ "Fix carousel navigation bug"
- ✅ "Update tour schema with video_url field"

**Avoid:**
- ❌ "Updates"
- ❌ "Fix"
- ❌ "Changes"

### When to Use Each Script

| Situation | Script | Why |
|-----------|--------|-----|
| Quick save during development | `git-quick-save.ps1` | Fast, no thinking needed |
| Feature complete | `git-commit.ps1 "message"` | Descriptive commit |
| Major milestone | `git-interactive.ps1` | Review before pushing |
| Experimenting | `git-interactive.ps1` | Control over push timing |

### Frequency
- **During active development:** Every 15-30 minutes (quick-save)
- **After completing a feature:** Immediately (with message)
- **Before breaks/end of day:** Always (interactive)
- **Before testing:** Always (with message)

---

## 🔗 Integration with VS Code

### Terminal Integration
Add to VS Code settings.json:
```json
{
  "terminal.integrated.profiles.windows": {
    "PowerShell with Git Shortcuts": {
      "source": "PowerShell",
      "icon": "terminal-powershell",
      "env": {
        "GIT_COMMIT": "C:\\path\\to\\git-commit.ps1",
        "GIT_SAVE": "C:\\path\\to\\git-quick-save.ps1"
      }
    }
  }
}
```

### Keyboard Shortcuts
Add to keybindings.json:
```json
{
  "key": "ctrl+shift+s",
  "command": "workbench.action.terminal.sendSequence",
  "args": { "text": ".\\git-quick-save.ps1\n" }
}
```

---

## 📊 Comparison

| Feature | git-commit.ps1 | git-quick-save.ps1 | git-interactive.ps1 |
|---------|----------------|--------------------|--------------------|
| Speed | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Custom message | ✅ | ❌ | ✅ |
| Auto message | ✅ | ✅ | ✅ |
| Shows changes | ✅ | ❌ | ✅ |
| Confirm push | ❌ | ❌ | ✅ |
| Best for | Regular commits | Quick saves | Important commits |

---

## 🔄 Git Workflow with Scripts

```
┌─────────────────────────────────────────────┐
│  1. Make code changes                       │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  2. Run automation script                   │
│                                             │
│  Quick:      .\git-quick-save.ps1          │
│  Standard:   .\git-commit.ps1 "message"    │
│  Careful:    .\git-interactive.ps1         │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  3. Script automatically:                   │
│     • Stages files (git add -A)            │
│     • Commits (git commit -m)              │
│     • Pushes (git push origin main)        │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  4. Changes live on GitHub! ✅              │
└─────────────────────────────────────────────┘
```

---

## 📚 Related Commands

### Manual Git Commands (for reference)
```powershell
# What scripts do under the hood:
git add -A                          # Stage all
git commit -m "Your message"        # Commit
git push origin main                # Push

# Useful related commands:
git status                          # Check status
git log --oneline -5                # Recent commits
git diff                            # Show changes
git branch                          # Show branches
```

---

**Last Updated:** November 18, 2025
**Tested On:** Windows 11, PowerShell 5.1+
**Project:** DiscoverGroup Travel Platform
