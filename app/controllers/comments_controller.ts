import Permissions from '#config/Enums/Permission'
import APIException from '#exceptions/api_exception'
import Comment from '#models/comment'
import Post from '#models/post'
import { commentsCreateValidator } from '#validators/comment'
import type { HttpContext } from '@adonisjs/core/http'
import i18nManager from '@adonisjs/i18n/services/main'

export default class CommentsController {
    public async list({ request, auth }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        const postId = request.param('id')
        const page = request.input('page', 0)
        const perPage = 20

        const post = await Post.find(postId)
        if (!post) {
            throw new APIException(language.t('post.postNotFind'))
        }

        const comments = await Comment.query()
            .preload('author')
            .orderBy('created_at', 'desc')
            .where('post', '=', postId)
            .paginate(page, perPage)

        return comments
    }

    public async new({ request, response, auth }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        if (auth.user?.permission === Permissions.SuspendedAccount) {
            throw new APIException(language.t('message.suspended_account'))
        }
        const post = await Post.findBy('slug', request.param('slug'))
        if (!post) throw new APIException(language.t('post.postNotFind'))

        const data = request.validateUsing(commentsCreateValidator)

        const comment = new Comment()
        comment.content = (await data).content
        comment.authorId = auth.user!.id
        await comment.related('author').associate(auth.user!)
        await comment.related('post').associate(post)
        await comment.save()

        return response.noContent()
    }

    public async update({ request, response, auth }: HttpContext) {
        // Big issu here, the first comment of the post is taking to be modified
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        const commentId = request.param('id')

        const comment = await Comment.findBy("authorId", commentId)
        console.log(comment)
        if (!comment) throw new APIException(language.t('comment.commentNotFound'))
        if (!auth.user) throw new APIException("Vous n'êtes pas connectés !")

        if (auth.user && auth.user.id !== comment.authorId) {
            console.log(`Current User ID: ${auth.user.id}, Comment Author ID: ${comment.authorId}`)
            throw new APIException(language.t('comment.notAuthor'))
        }

        const { content } = request.only(['content'])
        await comment.merge({ content }).save()

        return response.noContent()
    }

    public async delete({ request, response, auth }: HttpContext) {
        const language = i18nManager.locale(auth.user?.userLanguage || 'en')
        const comment = await Comment.findByOrFail('id', request.param('id'))
        if (!comment) throw new APIException(language.t('comment.commentNotFound'))
        if (!auth.user) throw new APIException("Vous n'êtes pas connectés !")

        if (auth.user.id !== comment.authorId)
            throw new APIException(language.t('comment.notAuthor'))

        await comment.delete()
        return response.noContent()
    }
}