import CommentsController from "#controllers/comments_controller"
import { middleware } from "#start/kernel"
import router from "@adonisjs/core/services/router"

router.group(() => {
    router.get(':id', [CommentsController, 'list'])
    router.group(() => {
        router.put(':id', [CommentsController, 'update'])
        router.delete(':id', [CommentsController, 'delete'])
    }).use(middleware.auth())
}).prefix('comments')