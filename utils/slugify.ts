import db from '@adonisjs/lucid/services/db'
import slugify from 'slugify'

export const slugifyAdapter = async (
    data: string,
    options: {
        tableName: string
        fieldName: string
    }
) => {
    const separator = '-'
    let slug = slugify.default(data, {
        replacement: separator,
        lower: true,
        strict: true,
        trim: true,
    })
    const checkSlugOnDatabase = await db
        .from(options.tableName)
        .select({ slugDb: options.fieldName })
        .where(options.fieldName, 'like', `${slug}%`)
    if (!checkSlugOnDatabase.length) {
        return slug
    }
    let maximumSlugNumber = 0
    for (const { slugDb } of checkSlugOnDatabase) {
        const slugParts = slugDb.split(separator)
        const lastPart = slugParts[slugParts.length - 1]
        if (Number.isNaN(lastPart)) {
            continue
        }
        if (Number(lastPart) > maximumSlugNumber) {
            maximumSlugNumber = Number(lastPart)
        }
    }
    return `${slug}${separator}${maximumSlugNumber + 1}`
}