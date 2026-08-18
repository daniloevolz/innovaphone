# Commit message instructions

When generating Git commit messages, follow these rules:

- Use Conventional Commits format:
  `type(scope): description`

- Allowed types:
  `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`.

- Use a concise scope when relevant, such as:
  `api`, `ui`, `auth`, `frontend`, `backend`, `db`.

- Use imperative mood.

- Keep the commit subject under 50 characters when possible.

- Do not end the subject with a period.

- The first line must contain only the commit subject.

- When additional explanation is useful, add a blank line followed by a commit body.

- In the commit body, describe the relevant changes using bullet points starting with `*`.

Example:

fix(base-station): fix signal rules modal

* Prevent signal rule options from being clipped.
* Adjust modal overflow when expanded.
* Preserve scrolling inside the edit modal.