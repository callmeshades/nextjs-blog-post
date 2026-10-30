#!/usr/bin/env node
/**
 * generate-image.mjs — generate one blog image with the OpenAI Images API.
 *
 * Usage:
 *   node generate-image.mjs --prompt "..." --out public/images/blog/slug/hero.webp
 *     [--size 1536x1024] [--quality high|medium|low|auto]
 *     [--format webp|png|jpeg] [--ref path/to/existing.webp ...] [--model gpt-image-2]
 *
 * --ref (repeatable, up to 3 recommended) uses existing images as style references
 * via the edits endpoint, so new images match the site's current look.
 *
 * API key: OPENAI_API_KEY from the environment, or from .env.local / .env in the
 * current working directory. Model: --model, or IMAGE_MODEL env, default gpt-image-2.
 * Requires Node 18+ (built-in fetch, FormData, Blob). No npm dependencies.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, extname, basename, resolve } from "node:path";

function parseArgs(argv) {
  const args = { ref: [] };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      args[name] = true;
    } else {
      if (name === "ref") args.ref.push(value);
      else args[name] = value;
      i++;
    }
  }
  return args;
}

function loadEnvKey(name) {
  if (process.env[name]) return process.env[name];
  for (const file of [".env.local", ".env"]) {
    const p = resolve(process.cwd(), file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && m[1] === name) return m[2].replace(/^['"]|['"]$/g, "");
    }
  }
  return undefined;
}

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.prompt || !args.out) {
    console.error('Usage: node generate-image.mjs --prompt "..." --out path/to/image.webp [--size 1536x1024] [--ref existing.webp]');
    process.exit(1);
  }

  const apiKey = loadEnvKey("OPENAI_API_KEY");
  if (!apiKey) {
    console.error("OPENAI_API_KEY not found. Add it to your environment or the project's .env.local.");
    process.exit(1);
  }

  const model = args.model || loadEnvKey("IMAGE_MODEL") || "gpt-image-2";
  const size = args.size || "1536x1024";
  const quality = args.quality || "high";
  const outExt = extname(args.out).toLowerCase().replace(".", "");
  const format = args.format || (["png", "jpeg", "webp"].includes(outExt) ? outExt : outExt === "jpg" ? "jpeg" : "webp");

  let res;
  if (args.ref.length > 0) {
    const form = new FormData();
    form.append("model", model);
    form.append("prompt", args.prompt);
    form.append("size", size);
    form.append("quality", quality);
    form.append("output_format", format);
    for (const refPath of args.ref) {
      if (!existsSync(refPath)) {
        console.error(`Reference image not found: ${refPath}`);
        process.exit(1);
      }
      const type = MIME[extname(refPath).toLowerCase()] || "image/png";
      form.append("image[]", new Blob([readFileSync(refPath)], { type }), basename(refPath));
    }
    res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
  } else {
    res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: args.prompt, size, quality, output_format: format, n: 1 }),
    });
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`Image API error ${res.status}: ${body?.error?.message || JSON.stringify(body)}`);
    process.exit(1);
  }

  const item = body?.data?.[0];
  let bytes;
  if (item?.b64_json) {
    bytes = Buffer.from(item.b64_json, "base64");
  } else if (item?.url) {
    const img = await fetch(item.url);
    bytes = Buffer.from(await img.arrayBuffer());
  } else {
    console.error("No image returned by the API.");
    process.exit(1);
  }

  mkdirSync(dirname(resolve(args.out)), { recursive: true });
  writeFileSync(args.out, bytes);
  console.log(`Saved ${args.out} (${(bytes.length / 1024).toFixed(0)} KB, ${model}, ${size}${args.ref.length ? `, ${args.ref.length} ref` : ""})`);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
