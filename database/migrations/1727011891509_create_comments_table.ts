import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('author_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}