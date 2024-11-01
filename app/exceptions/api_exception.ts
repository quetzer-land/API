import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

export default class APIException extends Exception {
  public async handle(error: this, { response }: HttpContext) {
    return response.status(error.status).json({
      errors: [
        {
          message: error.message,
        },
      ],
    })
  }
}