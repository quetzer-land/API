import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import i18nManager from '@adonisjs/i18n/services/main'

export default class AuthController {
    async register({ request, response }: HttpContext) {
        const payload = await request.validateUsing(registerValidator)

        const user = await User.create(payload)

        logger.info('A user has been created with the username : %s', payload.username)
        return response.created(user)
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
}