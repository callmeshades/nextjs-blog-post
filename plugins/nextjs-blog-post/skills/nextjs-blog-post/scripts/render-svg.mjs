#!/usr/bin/env node
/**
 * render-svg.mjs — turn an SVG that Claude drew into a blog image (webp/png/jpeg).
 *
 * Usage:
 *   node render-svg.mjs --in drawing.svg --out public/images/blog/slug/hero.webp
 *     [--size 1536x864] [--format webp|png|jpeg] [--quality 90]
 *
 * Renderers, tried in order:
 *   1. sharp from the current project's node_modules (Next.js usually installs it)
 *   2. rsvg-convert (librsvg) on the PATH
 *   3. ImageMagick (magick) on the PATH
 * If none is available it exits with code 2 so the caller can fall back to
 * using the .svg directly.
 * Requires Node 18+. No npm dependencies of its own.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      args[key.slice(2)] = true;
    } else {
      args[key.slice(2)] = value;
      i++;
    }
  }
  return args;
}

function loadSharp() {
  try {
    return createRequire(resolve(process.cwd(), "package.json"))("sharp");
  } catch {
    return undefined;
  }
}

function onPath(cmd) {
  try {
    execFileSync(process.platform === "win32" ? "where" : "which", [cmd], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.in || !args.out) {
    console.error("Usage: node render-svg.mjs --in drawing.svg --out path/to/image.webp [--size 1536x864]");
    process.exit(1);
  }
  if (!existsSync(args.in)) {
    console.error(`SVG not found: ${args.in}`);
    process.exit(1);
  }

  const svg = readFileSync(args.in);
  const viewBox = svg.toString("utf8").match(/viewBox\s*=\s*["'][\d.\s-]+?\s([\d.]+)\s+([\d.]+)["']/);
  const [w, h] = (args.size || (viewBox ? `${Math.round(viewBox[1])}x${Math.round(viewBox[2])}` : "1536x864"))
    .split("x")
    .map(Number);
  const quality = Number(args.quality || 90);
  const outExt = extname(args.out).toLowerCase().replace(".", "");
  const format = args.format || (["png", "jpeg", "webp"].includes(outExt) ? outExt : outExt === "jpg" ? "jpeg" : "webp");

  mkdirSync(dirname(resolve(args.out)), { recursive: true });

  const sharp = loadSharp();
  if (sharp) {
    await sharp(svg, { density: 300 }).resize(w, h, { fit: "cover" })[format]({ quality }).toFile(args.out);
    console.log(`Saved ${args.out} (${w}x${h}, sharp)`);
    return;
  }

  // The CLI renderers write PNG; ImageMagick converts it on to the target format.
  if (onPath("rsvg-convert") || onPath("magick")) {
    const tmp = mkdtempSync(join(tmpdir(), "render-svg-"));
    const png = join(tmp, "out.png");
    try {
      if (onPath("rsvg-convert")) {
        execFileSync("rsvg-convert", ["-w", String(w), "-h", String(h), "-o", png, args.in]);
      } else {
        execFileSync("magick", ["-background", "none", "-density", "300", args.in, "-resize", `${w}x${h}!`, png]);
      }
      if (format === "png") {
        writeFileSync(args.out, readFileSync(png));
      } else if (onPath("magick")) {
        execFileSync("magick", [png, "-quality", String(quality), args.out]);
      } else {
        console.error(`Rendered a PNG but need ImageMagick or sharp to write ${format}. Use a .png --out instead.`);
        process.exit(2);
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
    console.log(`Saved ${args.out} (${w}x${h}, ${onPath("rsvg-convert") ? "rsvg-convert" : "magick"})`);
    return;
  }

  console.error("No SVG renderer found (sharp in the project, rsvg-convert or magick). Use the .svg file directly.");
  process.exit(2);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
