# ReQuiz

Guess the term. Learn the concept.

ReQuiz is a short web quiz for memorising terms. You see a description that is gradually revealed, and you guess the term it describes. Add your own terms (course vocab, jargon, definitions), then quiz yourself until they stick.

Built for a hackathon with an education theme: make studying easier.

## How it works

- **Play (MAIN `/`):** a random term from your library is picked. You see the first chunk of its description and have 6 lives. Each wrong guess costs a life and reveals the next chunk. A correct guess reveals the full description. Run out of lives (or press Skip) and the term and full description are shown.
- **Add terms (SUBMIT WORD `/submit`):** add a term and a description to your library.
- **Review (RECORDS `/records`):** browse your library as flip cards (term on the front, description on the back) and delete terms you no longer want.

There is no need for a login. Each browser gets its own private library, tracked by an anonymous cookie, so one person's terms never appear in another person's quiz. New libraries start with 5 seed terms so the first visit is playable.

## How to RUN
Open terminal and run:
Docker compose up --build

## Game rules

| Situation | Lives | Result |
|---|---|---|
| Correct guess | stop | Full description and term shown |
| Wrong guess, lives remain | -1 | Next chunk of the description revealed |
| Wrong guess, lives reach 0 | 0 | Term and full description shown |
| Duplicate guess this round | unchanged | Warning: "You already tried that word!" |
| Skip | n/a | Term and full description shown |

**Guess matching:** guesses are normalised before comparing: Unicode NFKC, trimmed, spaces collapsed, lowercased, and symbols, digits and punctuation stripped. A guess is correct only if it equals the normalised term exactly. Multi-word terms such as "software engineer" work.

**Reveal chunks:** the description is split into up to 6 chunks of roughly equal size. Sentences are grouped evenly when there are two or more; otherwise the description is split by words.

## Submit rules

- Term: letters and spaces only, not blank, max 80 characters. Case is preserved for display.
- Description: required, max 4000 characters.
- Terms must be unique within a library (case-insensitive).
- Maximum 500 terms per library.
- No AI moderation in v1. Libraries are private to a cookie, so spam does not affect other users.

## Tech stack

| Layer | Choice |
|---|---|
| App | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (local Docker, then Neon) |
| Hosting | Vercel |
| Identity | `library_id` cookie (httpOnly, secure, sameSite=lax) |

## Data model

```
libraries
  id          uuid PK
  created_at  timestamptz

terms
  id          uuid PK
  library_id  uuid FK -> libraries (ON DELETE CASCADE)
  word        text NOT NULL
  word_key    text NOT NULL        -- lowercased word, for uniqueness
  description text NOT NULL
  created_at  timestamptz
  UNIQUE (library_id, word_key)
```

Round state (lives, guesses, revealed chunks) lives in the browser only. Refreshing `/` starts a new round.

## API

All routes are scoped to the library in the `library_id` cookie.

| Method | Path | Behaviour |
|---|---|---|
| GET | `/api/terms/random?excludeId=` | One random term `{ id, word, description }` |
| GET | `/api/terms` | All terms in this library |
| POST | `/api/terms` | Create a term. 400 on validation error, 409 on duplicate |
| DELETE | `/api/terms/:id` | Delete a term. 404 if not in this library |

<<<<<<< HEAD
=======
## Getting started

Requirements: Docker, and Git.

```bash
git clone https://github.com/zekrever/ReQuiz.git requiz
cd requiz
docker compose up --build
```

Open http://localhost:3000. Node, npm, and Postgres all run inside Docker.

To develop on the host instead (Node 20+):

```bash
npm install
cp .env.example .env.local
docker compose up -d db
npx prisma migrate dev
npm run dev
```

### Environment variables

```
DATABASE_URL=postgresql://requiz:requiz@localhost:5432/requiz
```

Never commit `.env.local`.

### Local PostgreSQL

`docker compose up --build` starts Postgres 16 and the Next.js app. Postgres is on port 5432 with user/password/database `requiz`. Stop everything with `docker compose down`.

>>>>>>> 5b3b11f (Add all dependencies to docker)
## Deploying

1. Push the repo to GitHub.
2. Import it in Vercel.
3. Add `DATABASE_URL` under Project Settings, Environment Variables (Neon).
4. Apply production migrations against that database when the Prisma layer is in place.

## Project structure

```
app/
  page.tsx              # MAIN: game
  submit/page.tsx       # SUBMIT WORD
  records/page.tsx      # RECORDS: flip cards
  api/terms/...         # route handlers (planned)
  components/Nav.tsx
lib/                    # planned: text + library helpers
prisma/                 # planned
docker-compose.yml      # local Postgres 16
.env.example            # DATABASE_URL template
```

## Seed terms

New libraries start with: software engineer, hackathon, database, algorithm, API.

## Definition of done

- A new incognito window gets a cookie and 5 seeds and is playable immediately.
- A wrong guess costs a life, reveals more text, and clears the input.
- A duplicate guess shows a warning and costs no life.
- Correct, 0 lives, or Skip shows the full description and term; Next resets to 6 lives.
- A new term appears in Records and can be drawn in play.
- Duplicate terms are rejected.
- Deleting a term removes it from Records and the quiz.
- A second browser profile sees a different library.

## Out of scope for v1

Describe-the-term mode, login or sync across devices, AI moderation or grading, leaderboards and streaks, study history, and admin tools.

## Known tradeoff

Clearing cookies or site data creates a new, empty library (re-seeded). Old terms remain in the database as orphans unless a cleanup job is added later.
