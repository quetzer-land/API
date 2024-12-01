import APIException from '#exceptions/api_exception'
import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import i18nManager from '@adonisjs/i18n/services/main'
import env from '#start/env'
import mail from '@adonisjs/mail/services/main'

export default class AuthController {
    async register({ request }: HttpContext) {
        const payload = await request.validateUsing(registerValidator)

        const user = await User.create(payload)

        logger.info('A user has been created with the username : %s', payload.username)
        const token = await User.accessTokens.create(user)
        return token
    }

    async login({ request }: HttpContext) {
        logger.info('Someone want to login')
        const payload = request.validateUsing(loginValidator)

        const user = await User.verifyCredentials((await payload).email, (await payload).password)
        const token = await User.accessTokens.create(user)

        logger.info('The user %s log in', user.username)
        return token
    }

    async logout({ auth, response }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        const user = auth.getUserOrFail()
        const token = auth.user?.currentAccessToken.identifier

        if (!token) {
            return response.badRequest({ message: language.t('auth.tokenNotFound') })
        }

        await User.accessTokens.delete(user, token)
        logger.info("The user %s log out", user.username)
        return response.ok({ message: language.t('auth.loggedOut') })
    }

    async forgotPassword({ params }: HttpContext) {
        const user = await User.findBy('email', params.email)
        if (!user) {
            throw new APIException("Il n'y a pas d'utilisateur avec cette email !")
        }
        const newPassword = Math.floor(Math.random() * Math.pow(10, 8))
        user.password = `${newPassword}`
        user.merge(user).save()

        await mail.send((message) => {
            message
                .to(user.email)
                .from(env.get('SMTP_USERNAME'))
                .subject(`Your new password is : ${newPassword}`)
                .htmlView('emails/hello', { newPassword })
        })
    }
}