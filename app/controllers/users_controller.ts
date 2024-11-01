import type { HttpContext } from '@adonisjs/core/http'
import User from "#models/user"
import Post from '#models/post'
import logger from '@adonisjs/core/services/logger'
import NotFoundException from '#exceptions/not_found_exception'
import APIException from '#exceptions/api_exception'
import Permissions from '#config/Enums/Permission'
import { gradeValidator } from '#validators/grade'
import i18nManager from '@adonisjs/i18n/services/main'
import app from '@adonisjs/core/services/app'
import fs from 'fs/promises'

export default class UsersController {
    public async get({ params, auth }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        logger.info('Fetching user by username %s', params.username)
        const user = await User.findBy('username', params.username)
        if (!user) {
            throw new NotFoundException(language.t('user.userNotFound'))
        }

        return user.serialize({
            fields: {
                omit: ['password', 'email'],
            },
        })
    }

    public async list({ }: HttpContext) {
        logger.info('Fetching all users')
        return (await User.all()).map((user) => {
            return user.serialize({
                fields: {
                    omit: ['email', 'password'],
                },
            })
        })
    }
    public async posts({ params }: HttpContext) {
        logger.info('Fetching user posts by id %s', params.id)
        let posts = Post.query()
            .orderBy('created_at', 'desc')
            .preload('author')
            .select([
                'id',
                'title',
                'slug',
                'created_at',
                'updated_at',
                'image',
                'description',
                'author',
            ])
            .where('author', '=', params.id)

            ; (await posts).map((post) => post.serializeAttributes({ omit: ['comments'] }))
        return await posts
    }

    public async delete({ request, response, auth }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        if (auth.user?.permission !== Permissions.Administrator)
            throw new APIException(language.t('user.adminOnly'))

        const user: any = await User.findBy('username', request.param('username'))
        if (user.permission === Permissions.Administrator) {
            throw new APIException(language.t('user.deleteAdminOrMods'))
        }
        await user.delete()
        return response.noContent()
    }

    public async upgrade({ request, response, auth, params }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        const payload = request.validateUsing(gradeValidator)

        const user = await User.findBy('username', params.username)
        if (!user) throw new APIException(language.t('user.userNotFound'))

        if (auth.user?.permission) {
            if (auth.user?.permission < Permissions.Redactor) {
                throw new APIException(language.t('user.onlyMod'))
            }
            if (
                auth.user?.permission < Permissions.Administrator &&
                request.param('perms') > Permissions.Redactor
            ) {
                throw new APIException(language.t('user.onlyAdmin'))
            }
        }

        user.permission = (await payload).permission

        await user.merge(user).save()

        return response.noContent()
    }

    public async show({ request, response, auth }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        const user = await User.findBy('username', request.param("username"))
        if (!user) {
            throw new NotFoundException(language.t('user.userNotFound'))
        }
        const imageName = request.param('id')

        try {
            const imagePath = app.publicPath(`/users/${imageName}` + '.png')
            await fs.access(imagePath)

            return response.download(imagePath)
        } catch (error) {
            throw new APIException(language.t('post.imageIsNotFound'))
        }
    }

    public async findAdmin({ auth }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        const admin = await User.findByOrFail("permission", 3)

        if (!admin) {
            throw new NotFoundException(language.t('user.userNotFound'))
        }

        return admin.serialize({
            fields: {
                omit: ['password', 'email'],
            },
        })
    }
}