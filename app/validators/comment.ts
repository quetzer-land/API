import vine from '@vinejs/vine'

export const commentsCreateValidator = vine.compile(
    vine.object({
        content: vine.string().trim().minLength(5).maxLength(200)
    })
)