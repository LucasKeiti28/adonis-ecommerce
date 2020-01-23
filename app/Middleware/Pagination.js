'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Pagination {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle(ctx, next) {
    if (ctx.request.method() === 'GET') {
      const page = parseInt(ctx.request.input('page'))
      const limit = parseInt(ctx.request.input('limit'))

      // Atribui os valores de page e limit (via Get) para a prop pagination.
      ctx.pagination = { limit, page }

      const perpage = parseInt(ctx.request.input('perpage'))

      if (perpage) {
        ctx.pagination.limit = perpage
      }
    }
    await next()
  }
}

// Como e' um middleware global, ele fica disponivel em todas as rotas da API.
module.exports = Pagination
