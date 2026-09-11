---
name: commit-push
description: Stage, commit and push the current changes with a strict Conventional Commit message in English. Use when the user asks to commit, push, or "commit and push".
---

# Commit and push

Commit the current working-tree changes and push them to the remote, following the rules below
exactly. Never ask for confirmation of the message unless the intent of the changes is unclear.

## Steps

1. Inspect: `git status`, `git diff` (staged and unstaged), `git log --oneline -10` for the
   repo's existing style and scopes.
2. If a commitlint config exists (`commitlint.config.*`, `.commitlintrc*`, `package.json`
   `commitlint` key), read it and respect its `type-enum` / `scope-enum` / `header-max-length`.
3. If on the default branch (`main`/`master`) in a repo that uses feature branches, stop and ask
   before committing - do not create a branch on your own.
4. Stage the relevant files explicitly (`git add <paths>`); never `git add -A` blindly. Skip
   secrets, build output and unrelated files.
5. Commit with the message format below, using a heredoc so the body is preserved.
6. Push: `git push`. If the branch has no upstream, `git push -u origin <branch>`.
7. Report the commit hash and the pushed branch. Never force-push; never amend a pushed commit.

## Message rules (strict)

- **Conventional Commits** header: `<type>(<scope>): <subject>` - scope optional.
  Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
  Breaking changes: `!` after type/scope and a `BREAKING CHANGE:` footer.
- **English only.**
- **ASCII only**: no Unicode characters and no character absent from the Portuguese (pt-PT)
  keyboard layout. No em dashes, curly quotes, arrows, emoji or ellipsis characters; use `-`,
  `"` `'`, `->` and `...` instead.
- Subject: imperative mood, lower-case first letter, no trailing period, **<= 72 characters**,
  as concise as possible.
- Body (optional, only when the header does not say it all): a blank line, then a bulleted list
  with **one bullet per intent, never one per file**. Each bullet says *what* and *why* in one
  short line. No file listings, no narration of the process.
- If the diff contains several unrelated intents, prefer several commits (one per intent) over
  one commit with a long body.
- **Never** add `Co-Authored-By`, `Generated with Claude Code`, or any mention of Claude /
  Anthropic - no trailer, no footer, no signature of any kind.

## Example

```
feat(cart): persist promo code in the session cookie

- store the applied code next to the cart lines so it survives reloads
- clear it on checkout to avoid reapplying a used discount
```
