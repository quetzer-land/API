import vine from '@vinejs/vine'

export const postsGetValidator = vine.compile(
    vine.object({
        limit: vine.number(),
        page: vine.number().optional(),
        q: vine.string().optional(),
        tag: vine.string().optional(),
        users: vine.string().optional()
    })
)

export const postsNewValidator = vine.compile(
    vine.object({
        title: vine.string().trim().minLength(3).maxLength(30),
        description: vine.string().trim().minLength(10).maxLength(100),
        content: vine.string().trim().minLength(100).maxLength(10000),
        // slug: vine.string().trim().minLength(3).maxLength(30),
        tag: vine.string().trim().optional(),
        image: vine.string().trim().minLength(3).maxLength(100)
    })
)

export const getPostsByAuthorValidator = vine.compile(
    vine.object({
        limit: vine.number(),
        page: vine.number().optional(),
        // users: vine.string()
    })
)