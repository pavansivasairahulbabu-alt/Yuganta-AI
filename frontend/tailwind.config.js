/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				'bg-primary': 'var(--bg-primary)',
				'bg-secondary': 'var(--bg-secondary)',
				'bg-card': 'var(--bg-card)',
				'accent-primary': 'var(--accent-primary)',
				'accent-primary-light': 'var(--accent-primary-light)',
				'accent-secondary': 'var(--accent-secondary)',
				'accent-secondary-dark': 'var(--accent-secondary-dark)',
				'text-primary': 'var(--text-primary)',
				'text-secondary': 'var(--text-secondary)',
				'text-muted': 'var(--text-muted)',
				'icon-color': 'var(--icon-color)',
				'nav-bg': 'var(--nav-bg)',
				'dropdown-bg': 'var(--dropdown-bg)',
				'dropdown-text': 'var(--dropdown-text)',
			},
			animation: {
				float: 'float 6s ease-in-out infinite',
				pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				fadeIn: 'fadeIn 0.5s ease-out forwards',
				blob: 'blob 7s infinite',
			},
			keyframes: {
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' },
				},
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				blob: {
					'0%': { transform: 'translate(0px, 0px) scale(1)' },
					'33%': { transform: 'translate(30px, -50px) scale(1.1)' },
					'66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
					'100%': { transform: 'translate(0px, 0px) scale(1)' },
				},
			},
		},
	},
	plugins: [],
};
