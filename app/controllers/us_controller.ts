import Permissions from '#config/Enums/Permission'
import APIException from '#exceptions/api_exception'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import sharp from 'sharp'
import fs from 'fs/promises'
import app from '@adonisjs/core/services/app'
import env from '#start/env'
import i18nManager from '@adonisjs/i18n/services/main'

export default class UsController {
  public async me({ auth, response }: HttpContext) {
    const language = i18nManager.locale(auth.user?.userLanguage || 'en')
    try {
      const user = auth.getUserOrFail()
      return response.ok(user)
    } catch (error) {
      return response.unauthorized({ error: language.t('user.userNotFound') })
    }
  }

  public async delete({ response, auth }: HttpContext) {
    const language = i18nManager.locale(auth.user?.userLanguage || 'en')
    if (!auth.user) {
      throw new APIException(language.t('message.notConnected'))
    }
    if (auth.user?.permission === Permissions.Administrator) {
      throw new APIException(
        language.t('user.adminError')
      )
    }
    const token = auth.user?.currentAccessToken.identifier
    if (!token) {
      return response.badRequest({ message: language.t('auth.tokenNotFound') })
    }

    try {
      const imagePath = `users/${auth.user.id}.png`
      await fs.unlink(app.publicPath(imagePath))

    } catch (error) {
      throw new APIException(language.t('user.errorInServer'))
    }

    await auth.user!.delete()
    await User.accessTokens.delete(auth.user, token)
    return response.noContent()
  }

  public async update({ request, response, auth }: HttpContext) {
    const language = i18nManager.locale(auth.user?.userLanguage || 'en')
    const { email, username, userLanguage, biography } = request.only([
      'email',
      'username',
      'userLanguage',
      'biography',
    ])

    const user = auth.user!

    if (user.permission === -1) {
      throw new APIException(language.t('message.suspended_account'))
    }

    if (
      email &&
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?)*$/.test(
        email
      )
    ) {
      user.email = email
    } else if (email) {
      throw new APIException(language.t('message.invalid_mail_adress'))
    }

    if (
      username &&
      /^[a-zA-Z][\w]{2,}$/.test(username) &&
      username.length > 4 &&
      username.length < 12
    ) {
      user.username = username
    } else if (username && username.length <= 3) {
      throw new APIException(language.t('message.username_modify_too_short'))
    } else if (username && username.length > 12) {
      throw new APIException(language.t('message.username_modify_too_long'))
    }

    if (userLanguage) {
      user.userLanguage = userLanguage
    } else if (userLanguage && userLanguage.length <= 2) {
      throw new APIException(language.t('message.lang_modify'))
    }

    if (biography && biography.length <= 200) {
      user.biography = biography
    } else if (biography.length > 200) {
      throw new APIException(language.t('message.biography_too_long'))
    }

    await auth.user!.merge(user).save()

    return response.noContent()
  }

  public async upload({ request, response, auth }: HttpContext) {
    const language = i18nManager.locale(auth.user?.userLanguage || 'en')
    const image = request.file('image')

    if (!image) {
      throw new APIException(language.t('post.notImageToUpload'))
    }

    const user = await User.find(auth.user?.id)

    if (!user) {
      throw new APIException("Vous n'êtes pas identifiés !")
    }

    if (user.permission === -1) {
      throw new APIException(language.t('message.suspended_account'))
    }

    const fileName = `${auth.user!.id}.png`
    const resizedImagePath = app.publicPath() + '/users/' + fileName

    try {
      await image.move(app.tmpPath(), {
        name: fileName,
        overwrite: true,
      })

      await sharp(app.tmpPath() + '/' + fileName)
        .resize(500, 500)
        .toFile(resizedImagePath)

      await fs.unlink(app.tmpPath() + '/' + fileName)

      user.pp = `${env.get('API')}/public/users/${fileName}`
      await user.save()

      return response.ok({ resizedImagePath })
    } catch (error) {
      throw new APIException(language.t('post.errorDuringUpload'))
    }
  }

  public async show({ request, response, auth }: HttpContext) {
    const language = i18nManager.locale(auth.user?.userLanguage || 'en')
    const imageName = request.param('imageName')

    try {
      const imagePath = app.publicPath(`/users/${imageName}` + '.png')
      await fs.access(imagePath)

      return response.download(imagePath)
    } catch (error) {
      // throw new APIException(language.t('post.imageIsNotFound'))
      return language.t('post.imageIsNotFound')
    }
  }

  public async deleteImage({ response, auth }: HttpContext) {
    const language = i18nManager.locale(auth.user?.userLanguage || 'en')
    const user = auth.user

    if (!user) {
      throw new APIException("Vous n'êtes pas identifiés !")
    }

    if (user.permission === -1) {
      throw new APIException(language.t('message.suspended_account'))
    }

    try {
      const imagePath = `users/${user.id}.png`
      await fs.unlink(app.publicPath(imagePath))

      user.pp = null
      await user.save()

      return response.ok(language.t('user.imageDeleted'))
    } catch (error) {
      throw new APIException(language.t('user.errorInServer'))
    }
  }

  public async changePassword({ request, auth, response }: HttpContext) {
    const language = i18nManager.locale(auth.user?.userLanguage || 'en')
    const { password } = request.only([
      'password',
    ])

    const user = auth.user!

    if (user.permission === -1) {
      throw new APIException(language.t('message.suspended_account'))
    }

    if (password && password.length > 5) {
      user.password = password
    } else if (password && password.length <= 5) {
      throw new APIException(language.t('message.password_too_short'))
    }

    await auth.user!.merge(user).save()

    return response.noContent()
  }
}
