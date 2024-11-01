import UsersController from '#controllers/users_controller'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router.group(() => {
    router.get('/', [UsersController, 'list'])
    router.get('/:username', [UsersController, 'get'])
    router.get('/:username/posts', [UsersController, 'posts'])
    router.get('/:username/image/:id', [UsersController, 'show'])
    router.group(() => {
        router.delete(':username', [UsersController, 'delete'])
        router.put('/upgrade/:username', [UsersController, 'upgrade'])
    }).use(middleware.auth())
}).prefix('/users')