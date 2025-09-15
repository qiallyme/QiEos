console.log("Starting indexer...");
console.log("Current directory:", process.cwd());

import fs from "fs";
import path from "path";

console.log("Testing file system access...");

// Check if directories exist
const dirs = [
  "public/kb/articles",
  "public/kb/policies", 
  "public/kb/templates",
  "public/kb/playbooks"
];

for (const dir of dirs) {
  console.log(`Checking ${dir}:`, fs.existsSync(dir));
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    console.log(`  Files:`, files);
  }
}

console.log("Creating test search index...");
const testIndex = [
  {
    title: "Welcome to the QiAlly Knowledge Base",
    slug: "welcome",
    summary: "How this KB is organized and how to use it.",
    tags: ["onboarding"],
    updated: "2025-09-15",
    path: "/articles/welcome.md",
    body: "This KB keeps client-facing resources clean and consistent."
  }
];

fs.writeFileSync("public/kb/_meta/search-index.json", JSON.stringify(testIndex, null, 2));
console.log("Test search index created!");
