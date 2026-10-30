---
name: nextjs-blog-post
description: Write a complete blog post for a Next.js site — markdown/MDX in the site's own format, AI-generated hero and in-post images (realistic or cartoon, matched to the site's existing image style), and the site's CallToAction component placed at random points. Use when asked to write, draft or generate a blog post or article for a Next.js project.
---

# Next.js Blog Post Generator

> `<skill-dir>` below means the folder this SKILL.md lives in (Claude Code shows it as the skill's base directory when the skill loads). Use that absolute path when running the bundled script.

## Sites built with nextjs-blog-starter

If the project was made with the `nextjs-blog-starter` skill (look for `content/POST_FORMAT.md`, `lib/site.ts` with `ARTICLE_CTAS`, and posts in `content/posts/*.md`), its conventions are already known — still confirm them by reading `POST_FORMAT.md`:
- Posts: `content/posts/<slug>.md`, frontmatter `slug`, `category` (one of `CATEGORIES` in `lib/site.ts`), `title` (single-quoted if it has a colon, under ~60 chars), `description` (`>-` block), `thumbnail`, `author`, `date` (`'YYYY-MM-DD'`), `authorImage`. A future date schedules the post — there is no `draft` field.
- Hero → `public/images/blog/thumbnails/<slug>.webp`, 16:9 (generate at `1536x864`, or `1536x1024` if the model rejects that size), set as `thumbnail`.
- In-post images → `public/images/blog/uploads/<slug>-<topic>.webp`, inserted as `![alt](/images/blog/uploads/...)`.
- CTAs: a line containing only `<CallToAction />`, up to three per post, each after a section break. If the component takes a `variant` prop, give each CTA in the post a different one (`<CallToAction variant={0} />`, `{1}`, `{2}`) so the wording doesn't repeat — but only if existing posts or `POST_FORMAT.md` show that syntax is supported; otherwise use the bare tag.
- Don't start the body with a `#` heading; the title is the page H1.

Produce one publish-ready blog post inside the current Next.js project: the post file, its images saved into `public/`, and `<CallToAction />` blocks scattered through the body. Everything follows the conventions the project already uses — never invent a new structure when an existing one is there.

Work through the phases in order. Do not write the post before Phase 1 is finished; the project's conventions decide the file format, frontmatter and image paths.

---

## Phase 1 — Inspect the project (silent, no questions yet)

### 1a. Confirm it's Next.js and find the blog content
- Read `package.json` → confirm `next` is a dependency; note whether `@next/mdx`, `next-mdx-remote`, `contentlayer`/`contentlayer2`, `velite`, `gray-matter`, `react-markdown`, `remark`/`rehype` are present. This tells you how posts are rendered.
- Locate existing posts. Search in this order and stop at the first that has posts:
  `content/**`, `posts/**`, `_posts/**`, `src/content/**`, `data/blog/**`, `app/blog/**`, `src/app/blog/**` — for `*.md` and `*.mdx`.
- If the project has a post-format guide (`content/POST_FORMAT.md`, `POST_FORMAT.md`, `CONTRIBUTING.md`, a `docs/` page about posts), read it first — it overrides anything you'd infer from examples.
- Open the **3 most recent posts** and record:
  - File extension (`.md` vs `.mdx`) and naming (`slug.mdx`, `YYYY-MM-DD-slug.md`, `slug/index.mdx`, `page.mdx` in a route folder…)
  - Exact frontmatter keys, their order and value formats (date format, tags as array vs string, `draft`, `author`, `image`/`coverImage`/`hero`/`thumbnail`, `description`/`excerpt`, `readingTime`, etc.)
  - Heading style (does the body start with an H1 or rely on the title?), typical length, tone, use of code blocks, tables, lists
  - How images are referenced: markdown `![alt](/images/blog/slug/x.webp)`, `<Image />`, a custom `<Figure />`, relative paths, etc.
- If a content schema exists (`contentlayer.config.*`, `velite.config.*`, `content.config.*`, `lib/posts.ts`, a zod schema), read it — required fields there are mandatory.

If no posts exist at all, find the blog route (`app/blog/[slug]/page.tsx` or similar) and the loader it uses, and derive the format from that code. If there is no blog route either, stop and tell the user this project has no blog set up yet.

### 1b. Find the CallToAction component
- Search for it: `Grep` for `CallToAction` across `components/`, `src/components/`, `app/`, `src/app/` (`*.tsx`, `*.jsx`, `*.ts`, `*.js`).
- Read the component file and record its **props** (names, types, required vs optional, defaults).
- Check how it reaches post content:
  - MDX: look in `mdx-components.tsx`, the `components={{...}}` passed to `MDXRemote`/`<MDXContent>`, or the Contentlayer/Velite MDX component map. It must be registered there for `<CallToAction />` to render inside a post.
  - Plain `.md`: JSX only renders if the site's markdown pipeline handles it. Check the post page/loader (`lib/posts.ts`, `app/blog/[slug]/page.tsx`) for code that turns a `<CallToAction />` line, a shortcode, or a directive (`:::cta`) into the component. If existing `.md` posts already contain `<CallToAction />` lines, that's proof it works — use the same syntax.
- Check existing posts for prior CTA usage — copy that exact syntax and the props they pass.

Outcomes:
- **Component exists and is wired into posts** → use it.
- **Component exists but isn't registered for post content** → tell the user and offer the one-line fix (add it to the MDX components map). Don't change it without a yes.
- **No CallToAction component found** → tell the user, and ask whether to skip CTAs or create a basic one. Never insert a tag for a component that doesn't exist.

### 1c. Find existing images and their style
- Find where blog images live: check `public/images/blog/`, `public/blog/`, `public/images/posts/`, `public/assets/`, and the paths referenced in the posts you read.
- Collect the **hero images** (the ones in frontmatter or at the top of posts) of the 3–5 most recent posts, and 2–3 in-body images.
- Open them with the `Read` tool (it renders images) and write a short **style brief** for yourself:
  - Realistic photo vs illustration vs 3D vs flat vector vs cartoon
  - Palette and dominant colours, lighting, contrast
  - Composition (centered subject, wide scene, close-up), background treatment
  - Whether there is text in the images
  - Aspect ratio and file format/size (check with `file`/`identify` or the image dimensions)
- Also note the site's brand colours from `tailwind.config.*`, `globals.css` CSS variables, or the theme, for use if no images exist yet.

---

## Phase 2 — Ask the user (two short rounds)

Skip any question the user already answered in their request.

### Round 1 — Topic and keywords (plain chat message, free-text answers)

Ask these together in one message and wait for the reply:

1. **Topic** — what the post is about (skip if given).
2. **Target SEO keyword** — the main keyword phrase they want to rank for (e.g. "deploy fastapi to vps"). If they have none, offer to propose one from the topic and confirm it before continuing.
3. **Additional keywords (optional)** — a list of secondary keywords or phrases to work into the post. Tell them they can paste a comma-separated or line-by-line list, or say "none".
4. **Word count (optional)** — a target length for the post, e.g. "1500" or "around 2,000". Mention the default so they can just skip it: the typical length of their existing posts (state the number you measured in Phase 1a), or 1,200–1,800 words if there are no posts yet.

Normalize the reply: trim, lowercase for matching, de-duplicate, and drop any secondary keyword that duplicates the target keyword.

### Round 2 — Structure and images (one AskUserQuestion call, up to 4 questions)

1. **Use the target keyword as the title and slug?**
   - `Yes — title and slug both (Recommended)` — the title is the keyword phrase, title-cased, with minimal words added only if needed for it to read naturally; the slug is the keyword exactly, slugified (`deploy-fastapi-to-vps`)
   - `Slug only` — slug is the slugified keyword; write a more compelling title that still contains the keyword
   - `Neither` — write the title and slug freely, keeping the keyword in the title
2. **Image style**:
   - `Match existing site images (Recommended)` — only offer when Phase 1c found images; describe the detected style in the option's description
   - `Realistic` — photographic, natural lighting
   - `Cartoon` — clean illustrated / cartoon style
3. **How many in-post images** — `2`, `3 (Recommended)`, `4`, `None (hero only)`
4. **How many CTAs** — `2 (Recommended)`, `1`, `3`. Skip if no CTA component exists.

If the user picks Realistic or Cartoon while the site already has a different style, keep their choice but tell them in one line that it won't match existing posts.

---

## Phase 3 — Write the post

- Match the voice and structure of the existing posts.
- **Length**: hit the user's word count within ±10% (body text only — exclude frontmatter, code blocks, image markup and CTA tags). If they gave none, match the typical length of existing posts, or 1,200–1,800 words if there are none. Scale the number of H2 sections to the length (roughly one per 250–350 words). If the requested count is very short (under ~600) or very long (over ~4,000) for the topic, mention it in one line but still write to their number.
- Structure: hook intro (2–3 short paragraphs) → H2 sections (count set by the length rule above) with H3s where useful → practical takeaways → conclusion. Use the site's heading convention from 1a.
- **Title and slug** follow the Round 2 answer. If a post with the same slug already exists, tell the user and ask before overwriting or pick a variant they approve.
- **Target keyword** — place it, in its exact form, in: the title, the slug (if chosen), the first 100 words, at least one H2, the meta description (150–160 chars), and the hero image alt text. Use it 2–4 more times through the body where it reads naturally; aim for roughly 0.5–1.5% density and never force it into a sentence that sounds wrong.
- **Additional keywords** — work each one into the post where it genuinely fits the content: an H2/H3 when a section is about that idea, otherwise body text, a list item, or a child image's alt text. Use each one at least once and at most 2–3 times; small grammatical changes (plural, tense) are fine. Never stuff keywords into a list, a "related keywords" block, hidden text, or a sentence that only exists to hold one. If a keyword doesn't fit the topic at all, leave it out and report it rather than forcing it.
- If the frontmatter has a `keywords`, `tags` or similar field, fill it with the target keyword plus the most relevant additional keywords, in the format the site uses.
- Slug = lowercase, hyphenated, no stop-word padding (unless the user chose the keyword as the exact slug).
- Frontmatter: exactly the keys and formats from 1a, in the same order. Date = today in the format the site uses. If a `draft` field exists, set it to `true` unless the user said to publish.
- Add internal links to 1–3 related existing posts, using the site's URL pattern.
- Code blocks get language tags. Don't fabricate statistics, quotes, or sources — if a claim needs a number, either leave it out or say it's an estimate.

Leave image placeholders as HTML comments while drafting, e.g. `<!-- IMAGE: hero -->`, `<!-- IMAGE: 1 | what it shows -->`, so Phase 4 can fill them.

---

## Phase 4 — Generate and insert images

### Planning
- **Hero**: represents the whole post. Landscape — use the aspect ratio of existing heroes, else `1536x1024`.
- **Children**: one per chosen section, each illustrating that section's specific idea (not generic stock filler). Spread them evenly; never two images back to back; never directly above or below a CTA.

### Prompts
Write each prompt as: **subject + scene + style block + constraints**.
- **Style block** — reuse the same block word-for-word for every image in the post so they look like a set:
  - Match existing: build it from the 1c style brief (medium, palette, lighting, composition).
  - Realistic: "Photorealistic editorial photograph, natural lighting, shallow depth of field, shot on a 35mm lens, true-to-life colours."
  - Cartoon: "Clean modern cartoon illustration, bold outlines, flat shading with soft gradients, friendly and expressive, cohesive limited palette of [brand colours]."
- **Constraints** (always): "No text, letters, logos, watermarks or UI screenshots. No real people's faces or recognizable brands/characters."
- Children images should share the hero's palette and style block so the post feels consistent.

### Generating
Use the bundled script (Node 18+, no dependencies). It needs `OPENAI_API_KEY` in the environment or in the project's `.env.local` / `.env`. If neither has it, stop and ask the user to add it — never ask them to paste the key into chat.

```bash
node "<skill-dir>/scripts/generate-image.mjs" \
  --prompt "..." \
  --out public/images/blog/<slug>/hero.webp \
  --size 1536x1024
```

To match the existing style more closely, pass 1–3 existing images as references (the script switches to the edits endpoint):

```bash
node "<skill-dir>/scripts/generate-image.mjs" \
  --prompt "... Match the art style, palette and lighting of the reference images; new subject: ..." \
  --ref public/images/blog/older-post/hero.webp \
  --out public/images/blog/<slug>/hero.webp
```

- Use `--ref` for the hero when "Match existing" was chosen, and use the **new hero** as the `--ref` for the child images so the set is consistent.
- Save to the image folder convention from 1c (default `public/images/blog/<slug>/` when the site has no convention). Name files descriptively: `hero.webp`, `<short-topic>.webp`.
- Match the existing file format (`--format webp|png|jpeg`); default `webp`.
- Run independent child-image generations in parallel (separate Bash calls in the same turn).
- After generating, open each image with `Read` and check it: on-topic, no garbled text, no artifacts, style consistent. Regenerate (max 2 retries each) if not.

### Inserting
- Hero → the frontmatter image field from 1a (path relative to `public`, e.g. `/images/blog/<slug>/hero.webp`). If the site shows heroes in the body instead, put it where existing posts do.
- Children → replace each placeholder using the site's image syntax from 1a. Write specific, descriptive alt text (what's in the image + context), never "image of…".
- If the frontmatter has `imageAlt`/`coverAlt`/similar, fill it.

---

## Phase 5 — Insert CallToAction blocks at random positions

1. List the eligible insertion points: the blank lines **immediately before an H2**, excluding:
   - the first H2 (CTA must not appear before the reader is into the content)
   - any H2 directly next to an image
   - positions inside code fences, lists, tables, or blockquotes
2. Choose randomly — don't hand-pick. Run:
   ```bash
   node -e 'const n=+process.argv[1],k=+process.argv[2];const a=[...Array(n).keys()];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}console.log(a.slice(0,k).sort((x,y)=>x-y).join(","))' <eligibleCount> <ctaCount>
   ```
   and use the returned indices into your eligible list. If two picks are adjacent (no section between them), re-run.
3. Insert using the exact syntax and props found in 1b, with a blank line above and below:
   ```mdx

   <CallToAction />

   ```
   If the component takes props (title, description, href, buttonText…), fill them so each CTA fits the surrounding section — or copy the props existing posts use if they're always the same. If it takes a `variant`/index prop that selects different copy, give each CTA in the post a different value.
4. If the post is `.md` and the site uses a shortcode/directive instead of JSX, use that instead.

---

## Phase 6 — Verify and report

- Confirm every image path in the post exists on disk under `public/`.
- Confirm the frontmatter parses (no unquoted colons in titles, valid dates) and has every required schema field.
- If the project has `lint`, `typecheck` or a content build script (`contentlayer build`, `velite`), run it. Don't run a full `next build` unless the user asks.
- Make sure `.env*` files and API keys were not added to any tracked file.
- **Word count check** — count the body words, excluding frontmatter, fenced code blocks, image lines and CTA tags (e.g. `awk '/^---$/{f++; next} f>=2' <file> | sed '/^```/,/^```/d' | grep -v -e '^!\[' -e '<CallToAction' | wc -w`). If it's more than 10% off the target, expand or trim sections and recount.
- **Keyword check** — count the occurrences of the target keyword and of each additional keyword in the final file (case-insensitive, e.g. `grep -oi "<keyword>" <file> | wc -l`). Confirm the target keyword is in the title, first 100 words, an H2 and the meta description. Fix anything missing before reporting.

Finish with a short summary: post file path, title, slug, word count, target keyword placements and count, each additional keyword with its count (and any left out, with the reason), images created (paths), how many CTAs were placed and after which sections, and anything the user should review (e.g. `draft: true`, a CTA that needed the component registered).
