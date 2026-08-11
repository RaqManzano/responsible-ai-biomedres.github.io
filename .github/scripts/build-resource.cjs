"use strict";

const fs = require("fs");
const path = require("path");

const FOLDER_BY_TYPE = {
  Guidance: "guidance",
  Training: "training",
  Materials: "resources",
  Unsure: "resources",
};

function parseSections(body) {
  const lines = (body || "").replace(/\r\n/g, "\n").split("\n");
  const sections = {};
  let current = null;
  let buffer = [];
  for (const line of lines) {
    const m = line.match(/^###\s+(.*)$/);
    if (m) {
      if (current) sections[current] = buffer.join("\n").trim();
      current = m[1].trim();
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  if (current) sections[current] = buffer.join("\n").trim();
  return sections;
}

function val(sections, label) {
  const v = sections[label];
  if (!v || v.trim() === "_No response_") return "";
  return v.trim();
}

function checkedItems(text) {
  if (!text) return [];
  return text
    .split("\n")
    .filter((l) => /^-\s*\[[xX]\]/.test(l.trim()))
    .map((l) => l.replace(/^-\s*\[[xX]\]\s*/, "").trim());
}

function slugify(s) {
  const full = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (full.length <= 60) return full || "resource";
  const truncated = full.slice(0, 60);
  const lastDash = truncated.lastIndexOf("-");
  return (lastDash > 20 ? truncated.slice(0, lastDash) : truncated) || "resource";
}

function truncate(s, n) {
  if (!s) return "";
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > n ? flat.slice(0, n - 1).trimEnd() + "…" : flat;
}

function yamlString(s) {
  return JSON.stringify(String(s));
}

function yamlList(arr) {
  if (!arr.length) return "";
  return arr.map((i) => `  - ${yamlString(i)}`).join("\n");
}

function frontmatter({ title, description, resourceType, status, reviewedOn, contributors, tags, references }) {
  const parts = [
    "---",
    `title: ${yamlString(title)}`,
    `description: ${yamlString(description)}`,
    `resource_type: ${yamlString(resourceType)}`,
    `status: ${yamlString(status)}`,
    `reviewed_on: ${yamlString(reviewedOn)}`,
    "contributors:",
    yamlList(contributors),
    "tags:",
    yamlList(tags),
  ];
  if (references.length) {
    parts.push("references:");
    parts.push(yamlList(references));
  }
  parts.push("---", "");
  return parts.join("\n");
}

function uniquePath(dir, slug) {
  let candidate = path.join(dir, `${slug}.qmd`);
  let n = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${slug}-${n}.qmd`);
    n += 1;
  }
  return candidate;
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function setOutput(name, value) {
  const file = process.env.GITHUB_OUTPUT;
  const line = `${name}<<__EOF__\n${value}\n__EOF__\n`;
  if (file) fs.appendFileSync(file, line);
}

function main() {
  const kind = process.env.KIND;
  const issueNumber = process.env.ISSUE_NUMBER;
  const issueAuthor = process.env.ISSUE_AUTHOR || "unknown";
  const issueUrl = process.env.ISSUE_URL || "";
  const issueTitleRaw = process.env.ISSUE_TITLE || "";
  const generatedDate = process.env.GENERATED_DATE;
  const bodyPath = process.env.ISSUE_BODY_FILE;
  const body = fs.readFileSync(bodyPath, "utf8");

  const sections = parseSections(body);
  const title = issueTitleRaw.replace(/^\[[^\]]+\]:\s*/, "").trim() || `Untitled resource (issue #${issueNumber})`;
  const suggestedBy = `Community suggestion by @${issueAuthor} (issue #${issueNumber})`;

  let resourceType;
  let folder;
  let needsTriage = false;
  let bodySections = [];
  let tags = [];
  let references = [];
  let description;

  if (kind === "resource") {
    resourceType = val(sections, "Resource type") || "Unsure";
    if (!FOLDER_BY_TYPE[resourceType]) resourceType = "Unsure";
    folder = FOLDER_BY_TYPE[resourceType];
    needsTriage = resourceType === "Unsure";

    const summary = val(sections, "What is the resource?");
    const whyMatters = val(sections, "Why does this matter to the project?");
    const link = val(sections, "DOI, stable URL or file reference");
    const notes = val(sections, "Extra notes");

    description = truncate(summary, 150);
    tags = [resourceType.toLowerCase(), "issue-suggested"];
    if (needsTriage) tags.push("needs-triage");
    if (link) references.push(link);

    bodySections.push(`## What is the resource?\n\n${summary || "_Not provided._"}`);
    bodySections.push(`## Why does this matter to the project?\n\n${whyMatters || "_Not provided._"}`);
    if (notes) bodySections.push(`## Extra notes\n\n${notes}`);
  } else if (kind === "literature") {
    resourceType = "Materials";
    folder = "resources";

    const citation = val(sections, "Citation or title") || title;
    const link = val(sections, "DOI or stable link");
    const relevance = checkedItems(val(sections, "Relevance tags"));
    const summary = val(sections, "Short summary");
    const whyMatters = val(sections, "Why is this important to the project?");
    const notes = val(sections, "Follow-up notes");

    description = truncate(summary, 150);
    tags = ["literature", ...relevance.map((r) => r.toLowerCase())];
    if (link) references.push(link);

    bodySections.push(`## Citation\n\n${citation}`);
    bodySections.push(`## Short summary\n\n${summary || "_Not provided._"}`);
    bodySections.push(`## Why this matters\n\n${whyMatters || "_Not provided._"}`);
    if (notes) bodySections.push(`## Follow-up notes\n\n${notes}`);
  } else {
    const section = val(sections, "Best-fit section") || "Unsure";
    resourceType = FOLDER_BY_TYPE[section] ? section : "Unsure";
    folder = FOLDER_BY_TYPE[resourceType];
    needsTriage = resourceType === "Unsure";

    const scenario = val(sections, "Scenario or question");
    const risk = val(sections, "Main uncertainty or risk");
    const takeaway = val(sections, "Expected takeaway");
    const provenance = val(sections, "Provenance or context");

    description = truncate(scenario, 150);
    tags = ["case-example", "issue-suggested"];
    if (needsTriage) tags.push("needs-triage");

    bodySections.push(`## Scenario or question\n\n${scenario || "_Not provided._"}`);
    bodySections.push(`## Main uncertainty or risk\n\n${risk || "_Not provided._"}`);
    bodySections.push(`## Expected takeaway\n\n${takeaway || "_Not provided._"}`);
    if (provenance) bodySections.push(`## Provenance\n\n${provenance}`);
  }

  if (issueUrl) references.push(issueUrl);

  const fm = frontmatter({
    title,
    description: description || title,
    resourceType,
    status: "draft",
    reviewedOn: generatedDate,
    contributors: [suggestedBy],
    tags,
    references,
  });

  const content = `${fm}\n${bodySections.join("\n\n")}\n`;
  const filePath = uniquePath(folder, slugify(title));
  writeFile(filePath, content);

  setOutput("file_path", filePath);
  setOutput("resource_title", title);
  setOutput("resource_type", resourceType);
  setOutput("needs_triage", String(needsTriage));

  console.log(`Wrote ${filePath}`);
}

main();
