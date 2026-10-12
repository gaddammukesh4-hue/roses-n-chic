# Start here

1. Unzip this folder. Put it where you keep your projects.
2. Open a terminal in this folder. Run `git init`.
3. Start Claude Code in this folder: `claude`
4. Paste this first prompt:

```
Read CLAUDE.md, plan.md, PROGRESS.md and hero/README.md.
Then do Phase 0 of plan.md: make a Next.js app (TypeScript, App Router, Tailwind) in this folder,
set up the Git repository and .gitignore (ignore all .env files), and install only these packages: gsap, lenis, zod.
Do not install skills yet. Do not start Phase 1.
When you finish, update PROGRESS.md and tell me what you did and what I must do by hand
(Supabase project, Vercel link, Razorpay and Stripe test keys).
```

5. Then give the next prompt:

```
Do Phase 3 now. Add the hero from hero/nextjs/ into the app, as hero/README.md says.
Run the app. Open it in a browser (use Playwright). Scroll through all parts at 1440x810 and at 390x844.
Fix any problem. Tell me what you changed.
```

6. After that, go phase by phase. Keep one phase per session. Update PROGRESS.md each time.

## Files

| File | What it is |
|---|---|
| `plan.md` | The full build plan (with status) |
| `CLAUDE.md` | Rules that Claude Code reads in every session |
| `PROGRESS.md` | Phase checklist |
| `hero/` | The finished hero section, frames, and helper scripts |
| `docs/flow-prompts-v3.md` | The Flow prompts you used for the video |
