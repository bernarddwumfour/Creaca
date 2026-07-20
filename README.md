# Kyrios

Kyrios is an online learning platform for practical, job-ready digital skills. Learners browse courses by subject and difficulty, track their own progress, and get access either by purchasing a single course or subscribing to a package that unlocks a wider catalog.

It's built for anyone picking up new digital skills at their own pace, students starting out, career changers, professionals filling a gap. The platform is available in English, French, and Spanish, with a matching mobile app alongside this web client.

## Features

- Course catalog organized by subject and difficulty
- Subscription packages and one-time course purchases
- Progress tracking and a personal learner dashboard
- Secure accounts with optional two-factor login
- Multi-language support
- A separate admin panel for staff running the platform

## Getting started

```bash
npm install
cp .env.example .env.local   # point this at your local API
npm run dev
```

Built with Next.js. See `CLAUDE.md` for internal engineering conventions.

## Related repos

- `kyrios-backend`, the API
- `kyrios-mobile`, the iOS/Android app
