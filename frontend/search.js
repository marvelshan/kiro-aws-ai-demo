/**
 * Search functionality for articles
 * Provides client-side search across article titles, content, and tags
 */

class ArticleSearch {
    constructor() {
        this.articles = [];
        this.searchIndex = null;
    }

    /**
     * Initialize search with articles data
     * @param {Array} articles - Array of article objects
     */
    initialize(articles) {
        this.articles = articles;
        this.buildSearchIndex();
    }

    /**
     * Build search index for faster searching
     */
    buildSearchIndex() {
        this.searchIndex = this.articles.map(article => ({
            id: article.id,
            title: article.title.toLowerCase(),
            description: (article.description || '').toLowerCase(),
            tags: (article.tags || []).map(tag => tag.toLowerCase()),
            content: (article.content || '').toLowerCase(),
            date: article.date,
            original: article
        }));
    }

    /**
     * Search articles by query
     * @param {string} query - Search query
     * @returns {Array} Matching articles sorted by relevance
     */
    search(query) {
        if (!query || query.trim() === '') {
            return this.articles;
        }

        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        const results = [];

        for (const indexed of this.searchIndex) {
            let score = 0;

            for (const term of searchTerms) {
                // Title match (highest weight)
                if (indexed.title.includes(term)) {
                    score += 10;
                }

                // Tag match (high weight)
                for (const tag of indexed.tags) {
                    if (tag.includes(term)) {
                        score += 5;
                    }
                }

                // Description match (medium weight)
                if (indexed.description.includes(term)) {
                    score += 3;
                }

                // Content match (lower weight)
                if (indexed.content.includes(term)) {
                    score += 1;
                }
            }

            if (score > 0) {
                results.push({
                    article: indexed.original,
                    score: score
                });
            }
        }

        // Sort by score (descending) and then by date (newest first)
        results.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return new Date(b.article.date) - new Date(a.article.date);
        });

        return results.map(r => r.article);
    }

    /**
     * Filter articles by tag
     * @param {string} tag - Tag to filter by
     * @returns {Array} Articles with the specified tag
     */
    filterByTag(tag) {
        const lowerTag = tag.toLowerCase();
        return this.articles.filter(article => 
            (article.tags || []).some(t => t.toLowerCase() === lowerTag)
        );
    }

    /**
     * Get all unique tags from articles
     * @returns {Array} Array of unique tags
     */
    getAllTags() {
        const tagSet = new Set();
        
        for (const article of this.articles) {
            if (article.tags) {
                article.tags.forEach(tag => tagSet.add(tag));
            }
        }

        return Array.from(tagSet).sort();
    }

    /**
     * Filter articles by date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Array} Articles within date range
     */
    filterByDateRange(startDate, endDate) {
        return this.articles.filter(article => {
            const articleDate = new Date(article.date);
            return articleDate >= startDate && articleDate <= endDate;
        });
    }
}

export default ArticleSearch;
