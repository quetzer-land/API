import UsController from '#controllers/us_controller'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.get('/image/:imageName', [UsController, 'show'])
    router
      .group(() => {
        router.get('/', [UsController, 'me'])
        router.delete('/', [UsController, 'delete'])
        router.put('/', [UsController, 'update'])
        router.put('/password', [UsController, 'changePassword'])
        router.post('/upload', [UsController, 'upload'])
        router.delete('/delete', [UsController, 'deleteImage'])
      })
      .use(middleware.auth())
  })
  .prefix('@me')
