import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Permissions from '#config/Enums/Permission'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column()
  declare pp: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare biography: string | null

  @column()
  declare permission: Permissions

  @column()
  declare userLanguage: string

  @column({ serializeAs: null })
  declare rememberMeToken: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // @column()
  // @hasMany(() => Follow, {
  //   foreignKey: 'followerId',
  // })
  // declare following: HasMany<typeof Follow>

  // @column()
  // @hasMany(() => Follow, {
  //   foreignKey: 'followingId',
  // })
  // declare followersCount: HasMany<typeof Follow>

  // @column()
  // declare followers: number

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
