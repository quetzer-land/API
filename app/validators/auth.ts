import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
    vine.object({
        email: vine.string().email().normalizeEmail(),
        password: vine.string().minLength(8).maxLength(512),
    })
)

export const registerValidator = vine.compile(
    vine.object({
        username: vine.string().minLength(3).maxLength(64),
        email: vine
            .string()
            .email()
            .unique(async (query, field) => {
                const user = await query.from('users').where('email', field).first()
                return !user
            }),
        password: vine.string().minLength(8).maxLength(512),
    })
)

export const adminRegisterValidator = vine.compile(
    vine.object({
        username: vine.string().minLength(3).maxLength(64),
        email: vine
            .string()
            .email()
            .unique(async (query, field) => {
                const user = await query.from('users').where('email', field).first()
                return !user
            }),
        password: vine.string().minLength(8).maxLength(512),
        permission: vine.number()
    })
)
