ScoreSpace

A small web app for searching IMSLP (the International Music Score Library Project) more easily. Search for a work, filter by composer, and get a direct link to the score on IMSLP.


Why I built it

IMSLP's search box sends the query to Google and shows the results on a Google results page, not on IMSLP's own site. That makes it awkward to browse works, and there is no simple way to narrow results by composer. I built ScoreSpace to make that one task quicker: find a piece, filter by composer, open the score.

It is also a personal project for practising system design and API integration, using a stack similar to one I had already used in a university team project.

Features
Search for a musical work
Filter works by composer
Links to the score PDF on IMSLP, so you can download it from the source
Stores frequently searched composers and works (Supabase)
How it works
You search for a work.
ScoreSpace queries IMSLP's API for matching works and their composers.
Results can be filtered by composer.
Each result links to IMSLP. ScoreSpace does not host or copy any scores.
Tech stack
Next.js 16 (App Router) with TypeScript
React 19
Tailwind CSS 4
Supabase (Postgres) via @supabase/supabase-js
ESLint
Getting started
bash
git clone https://github.com/gian-dln/scorespace.git
cd scorespace
npm install
npm run dev

Then open http://localhost:3000.

Environment variables

Create a .env.local file with your Supabase project details:

NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
<!-- Check these names match what the code actually reads -->
Status and limitations

This is an early personal project. It currently has no user accounts, and Supabase is only used to store frequently searched composers and works. It has not been tested with users other than me.

How it was built

Most of the code was written with AI assistance. I defined the problem, chose the approach (use IMSLP's API, link out to IMSLP rather than rehosting scores, use frameworks I already know), and directed and checked the result.

Disclaimer

ScoreSpace is not affiliated with or endorsed by IMSLP. All scores are hosted by IMSLP and remain subject to its licences and terms. Please check the licence on each score's IMSLP page before use.
