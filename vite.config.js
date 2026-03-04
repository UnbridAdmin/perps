import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        allowedHosts: [
            'developer.unbrid.com',
            'development.unbrid.com',
            '.unbrid.com'
        ]
    }
});