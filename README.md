# Builds With Brandon: Next.js Blog Post skill

A Claude Code skill from [Builds With Brandon](https://www.youtube.com/@BuildsWithBrandon).
This repo is a plugin marketplace, so you can install it with two commands.

## Skills

| Plugin | What it does |
|---|---|
| [`nextjs-blog-post`](plugins/nextjs-blog-post/skills/nextjs-blog-post) | Writes a complete SEO blog post for any Next.js site, in that site's own format. Asks for your target keyword, extra keywords and word count, generates realistic or cartoon images that match your site's style, and drops your call to action cards in at random. |

Pairs with [`nextjs-blog-starter`](https://github.com/callmeshades/nextjs-blog-starter): build the blog with that one, then fill it with this one.

## Install

You'll need [Claude Code](https://claude.com/claude-code). Inside a Claude Code
session, run:

```
/plugin marketplace add callmeshades/nextjs-blog-post
/plugin install nextjs-blog-post@nextjs-blog-post
```

Or from your terminal:

```bash
claude plugin marketplace add callmeshades/nextjs-blog-post
claude plugin install nextjs-blog-post@nextjs-blog-post
```

To pick up new versions later:

```bash
claude plugin marketplace update nextjs-blog-post
```

### Without the marketplace

Copy the skill folder into your personal skills folder instead:

```bash
# macOS / Linux
mkdir -p ~/.claude/skills
cp -R plugins/nextjs-blog-post/skills/nextjs-blog-post ~/.claude/skills/
```

On Windows, copy it to `%USERPROFILE%\.claude\skills\`.

## Setup

Images are generated with the OpenAI Images API. Add your key to your
Next.js project's `.env.local` (keep `.env.local` in `.gitignore`):

```
OPENAI_API_KEY=sk-...
# optional, defaults to gpt-image-2
IMAGE_MODEL=gpt-image-2
```

## Use

1. Open your Next.js project in VS Code (or your terminal).
2. Start Claude Code.
3. Say "write a blog post about …", or type `/nextjs-blog-post:nextjs-blog-post`
   (just `/nextjs-blog-post` if you copied the folder by hand).

Claude reads your site's posts, then asks for your topic, target keyword,
extra keywords and word count, whether the keyword should be the title and
slug, the image style and how many images and calls to action you want. Then
it writes the post, generates the images and checks everything. See the
[skill's README](plugins/nextjs-blog-post/skills/nextjs-blog-post/README.md)
for the details.

## Repo layout

```
.claude-plugin/marketplace.json        the catalog Claude Code reads
plugins/
  nextjs-blog-post/
    .claude-plugin/plugin.json         the plugin's name, version and author
    skills/nextjs-blog-post/           the skill itself (SKILL.md, scripts)
```

## License

[MIT](LICENSE)
