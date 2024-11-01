import vine from '@vinejs/vine'

export const gradeValidator = vine.compile(
    vine.object({
        permission: vine.number()
    })
)