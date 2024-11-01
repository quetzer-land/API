import AdminController from "#controllers/admin_controller"
import UsersController from "#controllers/users_controller"
import { middleware } from "#start/kernel"
import router from "@adonisjs/core/services/router"

router.group(() => {
    router.get('list', [UsersController, 'list'])
    router.post('update/:id/:permission', [AdminController, 'changePermission'])
    router.get('rss', [AdminController, 'rss'])
}).prefix('admin').use(middleware.auth())