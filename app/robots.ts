import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/admin/',
                '/admin',
                '/signals/',
                '/signals',
                '/history/',
                '/history',
                '/portfolio/',
                '/portfolio',
                '/auth/',
            ],
        },
        sitemap: 'https://tradingchill.com/sitemap.xml',
    }
}
