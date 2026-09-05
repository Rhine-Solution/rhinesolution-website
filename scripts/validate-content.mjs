import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import Ajv from "ajv";

const schema = JSON.parse(readFileSync(new URL("../content.schema.json", import.meta.url), "utf8"));
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

const dir = join(process.cwd(), "content");
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .sort();

let failed = 0;

for (const file of files) {
  const raw = readFileSync(join(dir, file), "utf8");
  const errors = [];

  if (raw.includes("\uFFFD")) errors.push("contains U+FFFD replacement characters (invalid/corrupt UTF-8)");
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(raw)) errors.push("contains control characters");

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    failed++;
    console.error(`FAIL content/${file}: invalid JSON — ${e.message}`);
    continue;
  }

  if (!validate(data)) {
    for (const err of validate.errors) {
      errors.push(`${err.instancePath || "/"} ${err.message}`);
    }
  }

  if (errors.length) {
    failed++;
    console.error(`FAIL content/${file}:`);
    for (const e of errors) console.error(`  - ${e}`);
  } else {
    console.log(`ok  content/${file}`);
  }
}

if (failed) {
  console.error(`\n${failed} content file(s) failed validation.`);
  process.exit(1);
}
console.log(`\nAll ${files.length} content files valid.`);