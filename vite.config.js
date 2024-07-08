import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/api': {
				target: 'https://baransapp2-f9c9gyebftbseyb7.eastus-01.azurewebsites.net/api/v1',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '')
			}
		}
	},
	build: {
		proxy: {
			'/api': {
				target: 'https://baransapp2-f9c9gyebftbseyb7.eastus-01.azurewebsites.net/api/v1',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '')
			}
		}
	}
});