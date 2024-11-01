import CommentsController from "#controllers/comments_controller";
import PostsController from "#controllers/posts_controller";
import { middleware } from "#start/kernel";
import router from "@adonisjs/core/services/router";

router.group(() => {
    router.get('/', [PostsController, 'list'])
    router.get('author/:userId', [PostsController, 'listPostsByAuthor'])
    router.get('/:slug', [PostsController, 'get'])
    router.get('/image/:imageName', [PostsController, 'show'])
    router.group(() => {
        router.post('/', [PostsController, 'new'])
        router.put('/:slug', [PostsController, 'update'])
        router.delete('/:slug', [PostsController, 'delete'])
        router.post('/upload', [PostsController, 'upload'])

        router.post(':slug/comment', [CommentsController, 'new'])
    }).use(middleware.auth())

}).prefix('posts')