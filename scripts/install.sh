#!/usr/bin/env bash
# Install the /dan skill from this checkout into local agent skill folders.
#
#   scripts/install.sh            # symlink into ~/.claude/skills and ~/.codex/skills
#   scripts/install.sh --copy     # copy instead of symlink (pinned to this checkout's version)
#   scripts/install.sh DIR...     # install into specific skill folders
#
# A symlink tracks this checkout, so `git pull` updates the skill. Use --copy to pin.
set -euo pipefail

src="$(cd "$(dirname "$0")/.." && pwd)/skills/dan"
mode=link
targets=()
for arg in "$@"; do
  case "$arg" in
    --copy) mode=copy ;;
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) targets+=("$arg") ;;
  esac
done
[ ${#targets[@]} -eq 0 ] && targets=("$HOME/.claude/skills" "$HOME/.codex/skills")

for dir in "${targets[@]}"; do
  mkdir -p "$dir"
  dest="$dir/dan"
  if [ -e "$dest" ] && [ ! -L "$dest" ]; then
    echo "skip: $dest exists and is not a symlink (move it away first)" >&2
    continue
  fi
  rm -f "$dest"
  if [ "$mode" = copy ]; then cp -R "$src" "$dest"; else ln -s "$src" "$dest"; fi
  echo "installed ($mode): $dest"
done
