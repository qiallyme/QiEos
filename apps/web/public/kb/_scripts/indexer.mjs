import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { glob } from 'glob';

async function indexKB() {
  console.log(' Building search index...');
  
  const searchIndex = [];
  const contentDirs = [
    'public/kb/articles',
    'public/kb/policies', 
    'public/kb/templates',
    'public/kb/playbooks'
  ];
  
  // Process each content directory
  for (const dir of contentDirs) {
    if (!fs.existsSync(dir)) {
      console.log(`  Directory ${dir} not found, skipping...`);
      continue;
    }
    
    const files = await glob(`${dir}/**/*.{md,mdx}`);
    console.log(` Processing ${files.length} files in ${dir}`);
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const { data: frontmatter, content: body } = matter(content);
        
        // Strip markdown to plain text
        const processor = remark()
          .use(remarkParse)
          .use(remarkStringify, { commonmark: true });
        
        const textBody = processor.processSync(body).toString();
        
        // Truncate body to first 2000 characters
        const truncatedBody = textBody.substring(0, 2000);
        
        // Determine path relative to kb root
        const relativePath = path.relative('public/kb', file);
        
        const indexEntry = {
          title: frontmatter.title || path.basename(file, path.extname(file)),
          slug: frontmatter.slug || path.basename(file, path.extname(file)),
          summary: frontmatter.summary || '',
          tags: frontmatter.tags || [],
          updated: frontmatter.updated || new Date().toISOString().split('T')[0],
          path: `/${relativePath}`,
          body: truncatedBody
        };
        
        searchIndex.push(indexEntry);
        console.log(` Indexed: ${indexEntry.title}`);
        
      } catch (error) {
        console.error(` Error processing ${file}:`, error.message);
      }
    }
  }
  
  // Write search index
  const indexPath = 'public/kb/_meta/search-index.json';
  fs.writeFileSync(indexPath, JSON.stringify(searchIndex, null, 2));
  
  console.log(` Search index created with ${searchIndex.length} entries`);
  console.log(` Written to: ${indexPath}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  indexKB().catch(console.error);
}

export { indexKB };
