#!/usr/bin/env bash
# Install the skills from this checkout into local agent skill folders.
#
#   scripts/install.sh                     # every skill → ~/.claude/skills and ~/.codex/skills
#   scripts/install.sh --skill dan         # only the named skill (repeatable)
#   scripts/install.sh --copy              # copy instead of symlink (pinned to this checkout)
#   scripts/install.sh DIR...              # install into specific skill folders
#   scripts/install.sh --list              # list the skills this checkout provides
#
# A symlink tracks this checkout, so `git pull` updates the skills. Use --copy to pin.
# A destination that exists and is not a symlink is skipped, never overwritten.
set -euo pipefail

skills_root="$(cd "$(dirname "$0")/.." && pwd)/skills"
available=()
for d in "$skills_root"/*/; do
  [ -f "$d/SKILL.md" ] && available+=("$(basename "$d")")
done

mode=link
targets=()
selected=()
while [ $# -gt 0 ]; do
  case "$1" in
    --copy) mode=copy ;;
    --skill)
      [ $# -ge 2 ] || { echo "--skill needs a name" >&2; exit 2; }
      selected+=("$2"); shift ;;
    --list) printf '%s\n' "${available[@]}"; exit 0 ;;
    -h|--help) sed -n '2,11p' "$0"; exit 0 ;;
    -*) echo "unknown option: $1 (see --help)" >&2; exit 2 ;;
    *) targets+=("$1") ;;
  esac
  shift
done
[ ${#targets[@]} -eq 0 ] && targets=("$HOME/.claude/skills" "$HOME/.codex/skills")
[ ${#selected[@]} -eq 0 ] && selected=("${available[@]}")

# Every selector must exactly equal a discovered skill name: no paths, no "..". All are
# checked before anything is created or removed, so a bad selector installs nothing.
for name in "${selected[@]}"; do
  ok=no
  for a in "${available[@]}"; do [ "$name" = "$a" ] && ok=yes && break; done
  [ "$ok" = yes ] || { echo "unknown skill: $name (available: ${available[*]})" >&2; exit 2; }
done

# Without /dan, the shipping skills fall back to prepare-only (see each SKILL.md).
case " ${selected[*]} " in
  *" dan "*) ;;
  *) echo "note: /dan is not in this selection; the other skills will run prepare-only without it" >&2 ;;
esac

for dir in "${targets[@]}"; do
  mkdir -p "$dir"
  for name in "${selected[@]}"; do
    src="$skills_root/$name"
    dest="$dir/$name"
    if [ -e "$dest" ] && [ ! -L "$dest" ]; then
      echo "skip: $dest exists and is not a symlink (move it away first)" >&2
      continue
    fi
    rm -f "$dest"
    if [ "$mode" = copy ]; then cp -R "$src" "$dest"; else ln -s "$src" "$dest"; fi
    echo "installed ($mode): $dest"
  done
done
