import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import { CherryPick, ModelObject } from '@adonisjs/lucid/types/model'
import Permissions from '#config/Enums/Permission'
import Post from './post.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import { HttpContext } from '@adonisjs/core/http'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare authorId: number

  @column()
  @belongsTo(() => User, { foreignKey: 'author' })
  declare author: BelongsTo<typeof User>

  @column()
  @belongsTo(() => Post, { foreignKey: 'post' })
  declare post: BelongsTo<typeof Post>

  @column()
  declare content: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed({ serializeAs: 'has_permission' })
  public get hasPermission() {
    const user = HttpContext.get()!.auth.user || {
      id: 0,
      permission: Permissions.User,
    }

    return Number(this.author) === user.id || user.permission >= Permissions.Moderator
  }

  public serialize(cherryPick?: CherryPick | undefined): ModelObject {
    return {
      ...this.serializeAttributes(cherryPick?.fields, false),
      ...this.serializeComputed(cherryPick?.fields),
      ...this.serializeRelations(
        {
          author: {
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