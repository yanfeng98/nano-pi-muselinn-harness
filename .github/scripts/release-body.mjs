// Builds the GitHub Release body from the tagged version's CHANGELOG.md
// section. Fails loudly when the section is missing, so a release can never
// ship with an empty "What's new" again.
//
// Usage: RELEASE_TAG=v0.9.18 node .github/scripts/release-body.mjs
// Prints the full markdown body to stdout.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const tag = process.env.RELEASE_TAG ?? process.argv[2];
if (!tag) throw new Error("RELEASE_TAG (or argv[2]) required, e.g. v0.9.18");
const version = tag.replace(/^v/, "");

const changelog = readFileSync(resolve(process.cwd(), "CHANGELOG.md"), "utf8");
const re = new RegExp(`^## ${version}\\n([\\s\\S]*?)(?=^## |\\z)`, "m");
const section = changelog.match(re)?.[1]?.trim();
if (!section) throw new Error(`No "## ${version}" section in CHANGELOG.md`);

process.stdout.write(`## What's new in ${version}

${section}

## Install

\`\`\`bash
pi install npm:pi-muselinn-harness
npm install pi-muselinn-harness@${version}
\`\`\`

## Compatibility

- pi 0.81.x–0.83.x
- Node 24/26
`);
