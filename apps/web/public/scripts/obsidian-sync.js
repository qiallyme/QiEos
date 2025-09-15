// Obsidian Sync Helper for QiAlly Knowledge Base
// This script helps manage the integration between Obsidian vault and the website

class ObsidianSync {
  constructor() {
    this.vaultPath = '';
    this.websitePath = '';
    this.articles = [];
  }

  // Initialize the sync system
  init(vaultPath, websitePath) {
    this.vaultPath = vaultPath;
    this.websitePath = websitePath;
    console.log('Obsidian Sync initialized');
  }

  // Convert Obsidian markdown to HTML
  convertMarkdownToHTML(markdown) {
    // Basic markdown to HTML conversion
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>');

    return `<p>${html}</p>`;
  }

  // Generate article HTML with QiAlly styling
  generateArticleHTML(title, content, category, tags = []) {
    const htmlContent = this.convertMarkdownToHTML(content);
    const tagsHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    return `
      <article class="kb-article">
        <header class="article-header">
          <h1>${title}</h1>
          <div class="article-meta">
            <span class="category">${category}</span>
            <div class="tags">${tagsHTML}</div>
          </div>
        </header>
        <div class="article-content">
          ${htmlContent}
        </div>
        <footer class="article-footer">
          <p class="last-updated">Last updated: ${new Date().toLocaleDateString()}</p>
        </footer>
      </article>
    `;
  }

  // Create a new article
  createArticle(title, content, category, tags = []) {
    const article = {
      id: this.generateId(),
      title,
      content,
      category,
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.articles.push(article);
    return article;
  }

  // Generate unique ID
  generateId() {
    return 'article_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Search articles
  searchArticles(query) {
    const searchTerm = query.toLowerCase();
    return this.articles.filter(article => 
      article.title.toLowerCase().includes(searchTerm) ||
      article.content.toLowerCase().includes(searchTerm) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Get articles by category
  getArticlesByCategory(category) {
    return this.articles.filter(article => article.category === category);
  }

  // Export articles to JSON
  exportArticles() {
    return JSON.stringify(this.articles, null, 2);
  }

  // Import articles from JSON
  importArticles(jsonData) {
    try {
      this.articles = JSON.parse(jsonData);
      console.log(`Imported ${this.articles.length} articles`);
    } catch (error) {
      console.error('Error importing articles:', error);
    }
  }
}

// Initialize the sync system
const obsidianSync = new ObsidianSync();

// Example usage:
// obsidianSync.init('/path/to/obsidian/vault', '/path/to/website');
// const article = obsidianSync.createArticle(
//   'Process Improvement Guide',
//   '# Process Improvement\n\nThis guide covers...',
//   'Process Improvement',
//   ['guide', 'process', 'improvement']
// );

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ObsidianSync;
} else {
  window.ObsidianSync = ObsidianSync;
  window.obsidianSync = obsidianSync;
}
