import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('author')
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE')

      table.string('title').notNullable().unique()
      table.string('slug').notNullable().unique()
      table.text('content').notNullable()
      table.string('description').notNullable()
      table.string('tag')
      table.string('image')
      table.integer('like')
      table.integer('author_id')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}