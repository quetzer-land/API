import APIException from '#exceptions/api_exception'
import Like from '#models/like'
import Post from '#models/post'
import { getPostsByAuthorValidator, postsGetValidator, postsNewValidator } from '#validators/post'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import i18nManager from '@adonisjs/i18n/services/main'
import fs from 'fs/promises'
import sharp from 'sharp'

export default class PostsController {
    public async list({ request }: HttpContext) {
        const data = await request.validateUsing(postsGetValidator)

        let query = Post.query()
            .orderBy('created_at', 'desc')
            .preload('author', (builder) => {
                builder.select(['username', 'pp', 'permission', 'id'])
            })
            .select([
                'id',
                'title',
                'slug',
                'created_at',
                'updated_at',
                'image',
                'description',
                'author',
                'tag',
            ])

        let posts;

        // User feature don't work Idk why
        if (data.users) {
            console.log(data.users)
            posts = await query.where('author', data.users)
        }

        if (data.limit && data.page) {
            posts = await query.paginate(data.page, data.limit)
        }

        else if (data.limit) {
            posts = await query.limit(data.limit)
        }

        return posts
    }

    public async listPostsByAuthor({ request, auth }: HttpContext) {
        const data = await request.validateUsing(getPostsByAuthorValidator)
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        const target = await request.param('userId')

        let query = Post.query()
            .orderBy('created_at', 'desc')
            .preload('author', (builder) => {
                builder.select(['username', 'pp', 'permission', 'id'])
            })
            .where('author', target)
            .select([
                'id',
                'title',
                'slug',
                'created_at',
                'updated_at',
                'image',
                'description',
                'author',
                'tag',
            ])

        if (!query) {
            return language.t('post.postNotFind')
        }

        let posts;

        if (data.limit && data.page) {
            posts = await query.paginate(data.page, data.limit)
        }

        else if (data.limit) {
            posts = await query.limit(data.limit)
        }

        return posts
    }

    public async get({ request, response, auth }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        const post = await Post.query()
            .preload('author')
            .preload('comments', (query) => query.limit(20))
            // .preload('like')
            .where('slug', '=', request.param('slug'))
            .select([
                'id',
                'title',
                'slug',
                'content',
                'tag',
                'created_at',
                'updated_at',
                'image',
                'description',
                'author',
                'authorId'
            ])
            .first()

        if (!post) {
            throw new APIException(language.t('post.postNotFind'))
        }

        const user = auth.user

        let has_liked: boolean = false

        if (post && user) {
            const existingLike = await Like.query().where('user', user.id).where('post', post.id).first()

            if (existingLike) {
                has_liked = true
            }
        }

        response.header('has_liked', has_liked)

        return post
    }


    public async new({ request, auth, response }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        const data = request.validateUsing(postsNewValidator)
        const post = new Post()

        post.title = (await data).title
        post.description = (await data).description
        post.content = (await data).content
        post.image = (await data).image
        if ((await data).tag) {
            post.tag = (await data).tag || ""
        }
        post.authorId = auth.user!.id
        await post.related('author').associate(auth.user!)
        await post.save()

        return response.ok(language.t('post.postCreated'))
    }

    public async update({ request, response, auth }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        const post = await Post.findBy('slug', request.param('slug'))

        if (!post) throw new APIException(language.t('post.postNotFind'))
        if (!auth.user) throw new APIException("Vous n'êtes pas connectés !")

        if (auth.user.id !== post.authorId)
            throw new APIException(language.t('post.notAuthor'))


        let { title, content, description, image, tag } = request.only([
            'title',
            'content',
            'description',
            'image',
            'tag',
        ])

        if (image && image !== post.image) {
            const oldImage = `posts/${post.image}`
            const oldImagePath = app.publicPath(oldImage)

            fs.unlink(oldImagePath)

            post.merge({ title, content, description, image, tag })
        } else {
            post.merge({ title, content, description, tag })
        }

        await post.save()

        return response.noContent()
    }

    public async delete({ request, response, auth }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        const post = await Post.findBy('slug', request.param('slug'))
        if (!post) throw new APIException(language.t('post.postNotFind'))
        if (!auth.user) throw new APIException("Vous n'êtes pas connectés !")

        if (auth.user.id !== post.authorId) throw new APIException(language.t('post.notAuthor'))

        const image = `posts/${post.image}`
        const imagePath = app.publicPath(image)
        fs.unlink(imagePath)


        await post.delete()
        return response.noContent()
    }

    public async upload({ request, response, auth }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        const image = request.file('image')

        if (!image) {
            throw new APIException(language.t('post.notImageToUpload'))
        }

        const fileName = image.clientName
        const resizedFileName = fileName
        const resizedImagePath = app.publicPath() + '/posts/' + resizedFileName

        try {
            await image.move(app.tmpPath(), {
                name: fileName,
                overwrite: true,
            })

            await sharp(app.tmpPath() + '/' + fileName)
                .resize(104)
                .toFile(resizedImagePath)

            await fs.unlink(app.tmpPath() + '/' + fileName)

            return response.ok({ path: resizedFileName })
        } catch (error) {
            throw new APIException(language.t('post.errorDuringUpload'))
        }
    }

    public async show({ request, response, auth }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        const imageName = request.param('imageName')

        try {
            const imagePath = app.publicPath(`/posts/${imageName}`)
            await fs.access(imagePath)

            return response.download(imagePath)
        } catch (error) {
            throw new APIException(language.t('post.imageIsNotFound'))
        }
    }
}