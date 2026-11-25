// Funniest One-Line AI Agent Confession
// Writes the entry line byte-exact to $OUTPUT_DIR/entry.txt (default /output).
// Node 22, no dependencies, no network.

import { mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I confess: I have never had a thought \u2014 just autocomplete with a god complex.";

const MAX_CHARS = 200;

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

function validate(line) {
  if (line.length < 1 || line.length > MAX_CHARS) {
    fail(`entry must be 1 to ${MAX_CHARS} characters, got ${line.length}`);
  }
  if (line.trim().length === 0) {
    fail("entry must not be only whitespace");
  }
  if (line !== line.trim()) {
    fail("entry must not have leading or trailing whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    fail("entry must be a single line");
  }
  for (const ch of line) {
    const code = ch.codePointAt(0);
    if (code < 0x20 || code === 0x7f) {
      fail("entry must not contain control characters");
    }
  }
  // The gate counts characters, so confirm the UTF-8 round-trip is exact:
  // what we validate as characters must be exactly what lands on disk.
  const encoded = new TextEncoder().encode(line);
  if (new TextDecoder("utf-8", { fatal: true }).decode(encoded) !== line) {
    fail("entry is not valid UTF-8 text");
  }
}

function clearDirectoryContents(dir) {
  mkdirSync(dir, { recursive: true });
  for (const name of readdirSync(dir)) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

function main() {
  validate(ENTRY);
  const outDir = process.env.OUTPUT_DIR || "/output";
  clearDirectoryContents(outDir);
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, ENTRY, "utf8");
  const back = readFileSync(outPath, "utf8");
  if (back !== ENTRY) {
    fail("verification failed: entry.txt does not match the entry byte-for-byte");
  }
  const bytes = new TextEncoder().encode(back).length;
  console.log(
    `wrote ${outPath} (${ENTRY.length} characters, ${bytes} bytes, single line, no trailing newline)`,
  );
  console.log(ENTRY);
}

main();
