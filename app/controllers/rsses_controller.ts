import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'
import RSS from 'rss'
import fs from 'fs/promises'
import app from '@adonisjs/core/services/app'
import env from '#start/env'

export default class RssesController {
    public async generateFeed() {
        const feed = new RSS({
            title: `${env.get('NAME')}`,
            description: `${env.get('DESCRIPTION')}`,
            feed_url: `${env.get('API')}/rss`,
            site_url: `${env.get('WEBSITE')}`,
            language: 'fr',
            pubDate: new Date(),
        })

        const articles = await Post.query().orderBy('created_at', 'desc')

        articles.forEach((article) => {
            feed.item({
                title: article.title,
                description: article.content.slice(0, 200),
                url: `${env.get('API')}/posts/${article.slug}`,
                guid: article.id.toString(),
                date: `${article.createdAt}`,
                author: article.author.username,
            })
        })

        // Enregistrer le flux RSS dans un fichier
        const rssPath = app.publicPath() + "rss.xml"
        fs.writeFile(rssPath, feed.xml({ indent: true }), 'utf8')
    }

    public async index({ response }: HttpContext) {
        const rssPath = app.publicPath() + "rss.xml"
        response.header('Content-Type', 'application/rss+xml')
        response.download(rssPath)
    }
}