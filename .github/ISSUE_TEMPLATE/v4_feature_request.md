---
name: V4 Roadmap Feature
about: Standard template for architecting Ozigi V4 capabilities.
title: '[V4]: <Feature Name>'
labels: v4-priority, enhancement
assignees: Dumebii
---

## ⚡ Feature Overview
**Goal:** [A one-sentence summary of what this feature achieves for the user]
**Target Audience:** [e.g., Technical Writers, High-Growth Creators, or Founders]

---

## 🏗️ Technical Architecture & Constraints
*As the CTO, define the engineering boundaries for this task.*

- **Data Flow:** [e.g., Does this require a new Supabase table or an Edge Function?]
- **Large File Handling:** [If video/large assets are involved, detail the Presigned URL or S3/R2 requirements]
- **AI Prompt Updates:** [Specify if the `textPrompt` in `app/api/generate/route.ts` needs new domain adaptation rules]
- **Infrastructure Limits:** [Address the 4.6MB Supabase/Vercel limit or 60s maxDuration]

---

## 🎨 UI/UX Tightening
*Refine the distribution and consumption experience.*

- **Selective Distribution:** [Should the user be able to toggle this platform on/off?]
- **Grid Impact:** [How does this look in the `DistributionGrid`? Does it require new `SocialCard` status states?]
- **Animation Strategy:** [Which Framer Motion variants (`fadeUp`, `staggerContainer`) are required?]

---

## 🧪 Definition of Done (Testing)
- [ ] **E2E Tests:** New Playwright specs added to `tests/` covering the happy path.
- [ ] **Mobile Responsiveness:** Verified layout on small viewports.
- [ ] **Banned Lexicon Check:** AI output verified to contain 0 "AI-isms".

---

## 📅 Context & Previous Work
*Reference existing Ozigi modules that this feature might extend.*
- [ ] Relates to `components/ContextEngine.tsx`
- [ ] Extends `app/api/generate/route.ts`