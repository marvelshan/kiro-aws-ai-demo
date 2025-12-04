/**
 * Simple hash-based router for the blog application
 * Handles routes: / (list) and /article/:id (detail)
 * Requirements: 2.1, 6.1, 6.2
 */

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.notFoundHandler = null;
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRouteChange());
        
        // Handle initial load
        window.addEventListener('load', () => this.handleRouteChange());
    }

    /**
     * Register a route with a handler function
     * @param {string} path - Route path (e.g., '/', '/article/:id')
     * @param {Function} handler - Function to call when route matches
     */
    addRoute(path, handler) {
        this.routes.set(path, {
            pattern: this.pathToRegex(path),
            handler: handler,
            path: path
        });
    }

    /**
     * Set handler for 404 not found
     * @param {Function} handler - Function to call when no route matches
     */
    setNotFoundHandler(handler) {
        this.notFoundHandler = handler;
    }

    /**
     * Convert path pattern to regex for matching
     * @param {string} path - Path pattern with optional :param syntax
     * @returns {RegExp} Regular expression for matching
     */
    pathToRegex(path) {
        // Escape special regex characters except :
        const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Replace :param with named capture group
        const pattern = escaped.replace(/:(\w+)/g, '(?<$1>[^/]+)');
        
        // Match exact path
        return new RegExp(`^${pattern}$`);
    }

    /**
     * Get current hash path (without #)
     * @returns {string} Current path
     */
    getCurrentPath() {
        const hash = window.location.hash;
        // Remove # prefix
        let path = hash.replace(/^#/, '');
        
        // Default to / for home if empty
        return path || '/';
    }

    /**
     * Match current path against registered routes
     * @returns {Object|null} Match object with handler and params, or null
     */
    matchRoute() {
        const currentPath = this.getCurrentPath();
        
        // Try to match against each registered route
        for (const [routePath, route] of this.routes) {
            const match = currentPath.match(route.pattern);
            
            if (match) {
                return {
                    handler: route.handler,
                    params: match.groups || {},
                    path: routePath
                };
            }
        }
        
        return null;
    }

    /**
     * Handle route change event
     */
    async handleRouteChange() {
        const match = this.matchRoute();
        
        if (match) {
            this.currentRoute = match.path;
            try {
                await match.handler(match.params);
            } catch (error) {
                const timestamp = new Date().toISOString();
                console.error(`[${timestamp}] Route handler error:`, {
                    timestamp,
                    route: match.path,
                    params: match.params,
                    error: error.message,
                    stack: error.stack
                });
                this.handleError(error);
            }
        } else {
            // No route matched - 404
            if (this.notFoundHandler) {
                this.notFoundHandler();
            } else {
                const timestamp = new Date().toISOString();
                console.warn(`[${timestamp}] No route matched and no 404 handler set`, {
                    path: this.getCurrentPath()
                });
            }
        }
    }

    /**
     * Navigate to a specific path
     * @param {string} path - Path to navigate to (without #)
     */
    navigate(path) {
        // Ensure path starts with /
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        window.location.hash = normalizedPath;
    }

    /**
     * Navigate to home page
     */
    navigateHome() {
        window.location.hash = '#/';
    }

    /**
     * Navigate to article detail page
     * @param {string} articleId - Article ID
     */
    navigateToArticle(articleId) {
        window.location.hash = `#/article/${articleId}`;
    }

    /**
     * Go back in history
     */
    goBack() {
        window.history.back();
    }

    /**
     * Handle routing errors
     * Requirements: 7.5
     * @param {Error} error - Error object
     */
    handleError(error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] Router error:`, {
            timestamp,
            currentRoute: this.currentRoute,
            currentPath: this.getCurrentPath(),
            error: error.message,
            stack: error.stack
        });
        
        // Show generic error page
        const content = document.getElementById('content');
        if (content) {
            content.innerHTML = `
                <div class="error-message">
                    <h2 class="error-title">發生錯誤</h2>
                    <p class="error-text">抱歉，處理您的請求時發生錯誤</p>
                    <a href="#/" class="back-link">返回首頁</a>
                </div>
            `;
        }
    }

    /**
     * Get current route path
     * @returns {string|null} Current route path
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Check if currently on a specific route
     * @param {string} path - Route path to check
     * @returns {boolean} True if on specified route
     */
    isCurrentRoute(path) {
        return this.currentRoute === path;
    }
}

// Export router instance
export default Router;
