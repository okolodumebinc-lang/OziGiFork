# Contributing to Ozigi ⚡

First off, thank you for considering contributing to Ozigi! We are building a high-performance Context Engine designed to eliminate "AI-isms" and help creators ship authentic content.

To maintain the quality and aesthetic of the project, please adhere to these guidelines.

## 🎨 Our Engineering Philosophy
- **Staff Engineer Aesthetic:** We prefer high-contrast, professional, and slightly aggressive UI (Tailwind `slate-900`, `red-700`, `fafafa`).
- **Human-First Output:** Any changes to the AI logic must strictly enforce the **Banned Lexicon** (no "delve", "tapestry", "robust").
- **Performance:** We prioritize sub-8s latency. Avoid adding heavy client-side libraries unless absolutely necessary.

## 🛠 Local Development Setup
1. Fork and clone the repository.
2. Install dependencies: `pnpm install`.
3. Set up your `.env.local` (Request access to the dev environment if needed).
4. Create a branch: `git checkout -b feature/your-feature-name`.

## 📐 Pull Request Guidelines
- **Atomic Commits:** Keep your changes focused. One PR = One Feature/Fix.
- **Testing:** Ensure all Playwright tests pass before submitting: `pnpm exec playwright test`.
- **Styling:** Use the established Framer Motion variants (`fadeUp`, `staggerContainer`) for all new UI components.

## 📝 Commit Messages
We follow a simplified conventional commit style:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation updates
- `chore:` for maintenance

---
*By contributing to Ozigi, you agree that your contributions will be licensed under the project's MIT License.*