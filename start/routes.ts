import router from '@adonisjs/core/services/router'
import AdminController from '#controllers/admin_controller'
import mail from '@adonisjs/mail/services/main'

import './routes/user.js'
import './routes/auth.js'
import './routes/me.js'
import './routes/posts.js'
import './routes/comments.js'
import './routes/admin.js'
import i18nManager from '@adonisjs/i18n/services/main'
import RssesController from '#controllers/rsses_controller'
import UsersController from '#controllers/users_controller'
import APIException from '#exceptions/api_exception'

router.get('/rss', [RssesController, 'index'])
router.get('/find-admin', [UsersController, 'findAdmin'])
router.get('/', async () => {
  const en = i18nManager.locale('fr')

  try {
    await mail.send((message) => {
      message
        .to("eragon941@outlook.fr")
        .from("")
        .subject('Verify your email address')
      // .htmlView('emails/hello')
    })
  } catch {
    new APIException("Erreur !")
  }




  return {
    hello: en.t('message.greeting'),
  }
})

router.post('/create-admin', [AdminController, 'createAdmin'])

