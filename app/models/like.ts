import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { CherryPick, ModelObject } from '@adonisjs/lucid/types/model'
import Post from './post.js'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Like extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  @belongsTo(() => User, { foreignKey: 'user' })
  declare user: BelongsTo<typeof User>

  @column()
  @belongsTo(() => Post, { foreignKey: 'post' })
  declare post: BelongsTo<typeof Post>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  public serialize(cherryPick?: CherryPick | undefined): ModelObject {
    return {
      ...this.serializeAttributes(cherryPick?.fields, false),
      ...this.serializeComputed(cherryPick?.fields),
      ...this.serializeRelations(
        {
          user: {
            fields: {
              omit: ['email', 'birthdate', 'created_at', 'updated_at'],
            },
          },
        },
        false
      ),
    }
  }
}