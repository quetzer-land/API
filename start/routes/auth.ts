import AuthController from "#controllers/auth_controller"
import { middleware } from "#start/kernel"
import router from "@adonisjs/core/services/router"

router.group(() => {
    router.post('register', [AuthController, 'register'])
    router.post('login', [AuthController, 'login'])
    router.delete('logout', [AuthController, 'logout']).use(middleware.auth())
}).prefix('auth')