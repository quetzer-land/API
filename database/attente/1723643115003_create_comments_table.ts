import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('author')
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE')

      table
        .integer('post')
        .unsigned()
        .references('posts.id')
        .onDelete('CASCADE')
      table.text('content').notNullable()
      table.integer('author_id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}