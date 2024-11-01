import APIException from '#exceptions/api_exception'
import Post from '#models/post'
import User from '#models/user'
import { adminRegisterValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import RSS from "rss"

export default class AdminController {
    public async createAdmin({ request, response }: HttpContext) {
        const payload = await request.validateUsing(adminRegisterValidator)
        const verifUser = await User.findByOrFail("permission", 3)
        if (verifUser) {
            throw new APIException("There are already an administrator !")
        }

        const user = await User.create(payload)

        return response.created(user)
    }

    public async userList({ auth }: HttpContext) {
        const adminuser = auth.user
        if (!adminuser) {
            throw new APIException("Vous n'êtes pas connectés !")
        }
        if (adminuser.permission !== 3) {
            throw new APIException("Seul un admin peut faire ceci !")
        }

        return (await User.all()).map((user) => {
            return user.serialize({
                fields: {
                    omit: ['email', 'password', 'updated_at'],
                },
            })
        })
    }

    public async changePermission({ auth, request, response }: HttpContext) {
        const adminuser = auth.user
        if (!adminuser) {
            throw new APIException("Vous n'êtes pas connectés !")
        }
        if (adminuser.permission !== 3) {
            throw new APIException("Seul un admin peut faire ceci !")
        }

        const target = await User.findBy("id", request.param('id'))
        const permisison = request.param("permission")

        if (!target) {
            throw new APIException("Il n'y a pas d'utilisateur ciblé")
        }
        if (!permisison) {
            throw new APIException("Il n'y a pas de permission")
        }

        target.permission = permisison
        target.merge(target).save()

        return response.noContent()
    }

    public async rss({ response }: HttpContext) {
        const feed = new RSS({
            title: 'Mon Blog RSS Feed',
            description: 'Le flux RSS de tous les articles',
            feed_url: 'https://votresite.com/rss',
            site_url: 'https://votresite.com',
            language: 'fr',
            pubDate: new Date(),
        })

        const posts = await Post.query().orderBy('created_at', 'desc')

        posts.forEach((post) => {
            feed.item({
                title: post.title,
                description: post.content,
                url: `https://votresite.com/post/${post.slug}`,
                guid: post.id.toString(),
                date: `${post.createdAt}`,
                author: post.author.username,
            })
        })

        response.header('Content-Type', 'application/rss+xml')
        response.header('Content-Disposition', 'attachment; filename="flux-rss.xml"')
        response.send(feed.xml({ indent: true }))
    }
}