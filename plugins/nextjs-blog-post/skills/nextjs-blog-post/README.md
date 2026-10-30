# Next.js Blog Post: a Claude Code skill

A [Claude Code](https://claude.com/claude-code) skill from
[Builds With Brandon](https://www.youtube.com/@BuildsWithBrandon) that
writes complete blog posts for your Next.js site. You answer a few questions;
Claude does the rest.

**What you get**

- A post written in your site's own format: the same frontmatter, file naming, headings and image syntax your existing posts use (`.md` or `.mdx`, Contentlayer, Velite, `next-mdx-remote`, `@next/mdx`)
- SEO built in: your target keyword in the title, slug, intro, an H2, the meta description and the hero alt text
- Your extra keywords worked in where they fit naturally, never stuffed, with a count of each at the end
- Your word count, hit within 10% (or matched to your existing posts)
- A hero image and in-post images, realistic or cartoon, or generated from your existing images so they match your site's style
- Your `<CallToAction />` cards placed at random section breaks, never at the top and never next to an image
- Internal links to your related posts
- A final check of image paths, frontmatter, keywords and word count

Built for sites made with
[`nextjs-blog-starter`](https://github.com/callmeshades/nextjs-blog-starter),
and works on any other Next.js blog too.

## Install

Install it as a plugin from Claude Code (see the
[repo README](../../../../README.md) for the exact commands):

```
/plugin install nextjs-blog-post@nextjs-blog-post
```

Or copy this folder into your Claude Code skills folder:

```bash
# macOS / Linux
mkdir -p ~/.claude/skills
cp -R nextjs-blog-post ~/.claude/skills/
```

On Windows, copy it to `%USERPROFILE%\.claude\skills\`.

## What you need

- A Next.js project with a blog (markdown or MDX)
- Node.js 18 or newer
- An OpenAI API key in your project's `.env.local`:

```
OPENAI_API_KEY=sk-...
# optional, defaults to gpt-image-2
IMAGE_MODEL=gpt-image-2
```

## What Claude asks you

First, in chat:

- The topic
- Your target SEO keyword (or Claude suggests one)
- Extra keywords to include (optional, paste a list)
- A word count (optional)

Then as quick multiple choice:

- Use the keyword as the title and slug, the slug only, or neither
- Image style: match your existing images, realistic, or cartoon
- How many in-post images
- How many calls to action

## The CallToAction component

The skill looks for a component named `CallToAction` in your project and
only uses it if your posts can render it. Sites made with
`nextjs-blog-starter` already have it. For an MDX site, register it in your
MDX components, for example in `mdx-components.tsx`:

```tsx
import { CallToAction } from "@/components/CallToAction";

export function useMDXComponents(components) {
  return { ...components, CallToAction };
}
```

If it's missing or not registered, Claude tells you and asks before changing
anything.

## The image script

`scripts/generate-image.mjs` has no dependencies and works on its own:

```bash
node scripts/generate-image.mjs \
  --prompt "Clean modern cartoon illustration of a developer deploying an app" \
  --out public/images/blog/thumbnails/my-post.webp \
  --size 1536x1024 \
  --ref public/images/blog/thumbnails/older-post.webp   # optional: match a style
```

Flags: `--size`, `--quality high|medium|low|auto`, `--format webp|png|jpeg`,
`--model`, and `--ref` (repeatable).

---

More builds and tutorials on [Builds With Brandon](https://www.youtube.com/@BuildsWithBrandon).
