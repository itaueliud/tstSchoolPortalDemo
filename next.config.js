/** @type {import('next').NextConfig} */
const backendOrigin = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tstschoolportaldemo.onrender.com'

const nextConfig = {
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: `${backendOrigin.replace(/\/$/, '')}/api/:path*`,
			},
		]
	},
}

module.exports = nextConfig
