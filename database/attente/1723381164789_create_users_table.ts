import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'users'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').primary()
            table.string('username').notNullable().unique()
            table.string('email', 255).notNullable().unique()
            table.integer('permission').defaultTo(0).notNullable()
            table.string('password', 180).notNullable()
            table.string('pp').nullable()
            table.string('biography').nullable()
            table.string('rememberMeToken').nullable()
            table.string('user_language')

            table.timestamp('created_at')
            table.timestamp('updated_at')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}