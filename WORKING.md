# Working on Terra OS

Two Next.js projects live on this machine with near-identical stacks. Work has
leaked between them. This file exists so that starting in the wrong one is
something you have to do deliberately rather than by accident.

## Start work — copy one line

```
cd ~/code/terraos && claude
```

```
cd ~/code/65roses && claude
```

Adjust the paths once to match your machine, then never type them again — use
the aliases below.

## Ports

| Project  | Dev port | Database      |
| -------- | -------- | ------------- |
| Terra OS | **3100** | `terraos_dev` |
| 65 Roses | **3000** | `roses65`     |

Both can run at once. If `localhost:3100` shows you a nightlife membership
page, you started the wrong project.

## The zsh block

Paste this into `~/.zshrc`, edit the two paths at the top, then
`source ~/.zshrc`. It gives you `terra` and `65`, each of which moves to the
right directory **and** renames the terminal tab, so the two windows stop
looking identical.

```zsh
# ─── Project switching ──────────────────────────────────────────────────────
# Two Next.js projects, near-identical stacks. Distinct tab titles so you can
# see at a glance which one you are in.

export TERRAOS_DIR="$HOME/code/terraos"
export ROSES_DIR="$HOME/code/65roses"

# Sets the terminal tab/window title. Works in iTerm2, Terminal.app,
# most Linux terminals, and the VS Code integrated terminal.
_set_tab_title() {
  print -Pn "\e]0;$1\a"
}

# Re-title on every prompt, otherwise running a command overwrites the title.
_retitle_precmd() {
  [[ -n "$PROJECT_TAB_TITLE" ]] && _set_tab_title "$PROJECT_TAB_TITLE"
}
autoload -Uz add-zsh-hook
add-zsh-hook precmd _retitle_precmd

terra() {
  cd "$TERRAOS_DIR" || return 1
  export PROJECT_TAB_TITLE="▲ TERRA · 3100"
  _set_tab_title "$PROJECT_TAB_TITLE"
  print -P "%F{green}TERRA OS%f — education capital intelligence · port 3100 · db terraos_dev"
}

65() {
  cd "$ROSES_DIR" || return 1
  export PROJECT_TAB_TITLE="✿ 65 ROSES · 3000"
  _set_tab_title "$PROJECT_TAB_TITLE"
  print -P "%F{red}65 ROSES%f — membership world · port 3000 · db roses65"
}

# Start Claude Code already in the right project.
alias terrac='terra && claude'
alias 65c='65 && claude'
# ────────────────────────────────────────────────────────────────────────────
```

After sourcing:

- `terra` → moves to Terra OS, tab reads **▲ TERRA · 3100**
- `65` → moves to 65 Roses, tab reads **✿ 65 ROSES · 3000**
- `terrac` / `65c` → the same, then launches Claude Code

## If a guard stops you

`scripts/check-repo.mjs` runs before `dev`, `build`, `test` and `db:reset`. It
refuses to continue when `package.json` is not `terra-os`, or when
`DATABASE_URL` points at a database whose name does not contain `terraos`.

That second check is the one that matters: `db:reset` runs
`prisma migrate reset --force`, which drops every table at that URL without
asking. If the guard fires, read the message before overriding it — it is
usually right.

`Confidential — Terra Capital`
