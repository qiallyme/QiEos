#!/usr/bin/env node
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

async function main() {
	const repoRoot = process.cwd();
	const kbDir = path.resolve(repoRoot, 'docs', 'kb');
	const outDir = path.resolve(repoRoot, 'docs', 'devops');
	const outFile = path.resolve(outDir, 'QiEOS_BIBLE.md');

	await fsp.mkdir(outDir, { recursive: true });

	const exists = fs.existsSync(kbDir);
	if (!exists) {
		console.error(`[merge-kb] KB directory not found: ${kbDir}`);
		process.exit(1);
	}

	const entries = await fsp.readdir(kbDir, { withFileTypes: true });
	let files = entries
		.filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
		.map((e) => path.join(kbDir, e.name));

	if (files.length === 0) {
		console.warn('[merge-kb] No markdown files found under docs/kb');
		await fsp.writeFile(outFile, `# QiEOS Bible\n\n_No KB files found to merge on ${new Date().toISOString()}._\n`);
		console.log(`[merge-kb] Wrote: ${outFile}`);
		return;
	}

	// Preferred ordering by filename substrings (case-insensitive)
	const orderHints = [
		'official development specification (god doc)',
		'amendment',
		'session',
		'qsuite_dev_bible',
		'setup',
	];

	files.sort((a, b) => {
		const an = path.basename(a).toLowerCase();
		const bn = path.basename(b).toLowerCase();
		const ai = orderHints.findIndex((h) => an.includes(h));
		const bi = orderHints.findIndex((h) => bn.includes(h));
		if (ai === -1 && bi === -1) return an.localeCompare(bn);
		if (ai === -1) return 1;
		if (bi === -1) return -1;
		return ai - bi;
	});

	let out = '';
	out += `# QiEOS Bible\n\n`;
	out += `Generated: ${new Date().toISOString()}\n\n`;
	out += `This document merges all markdown files under \`docs/kb\` into one reference.\n\n`;
	out += `## Included Files (order)\n`;
	files.forEach((f, i) => {
		out += `${i + 1}. ${path.basename(f)}\n`;
	});
	out += `\n---\n`;

	for (const file of files) {
		const name = path.basename(file);
		const content = await fsp.readFile(file, 'utf8');
		out += `\n\n---\n\n# Source: ${name}\n\n`;
		out += content.trim();
		out += `\n`;
	}

	await fsp.writeFile(outFile, out, 'utf8');
	console.log(`[merge-kb] Wrote ${outFile}`);
}

main().catch((err) => {
	console.error('[merge-kb] Failed:', err);
	process.exit(1);
});


