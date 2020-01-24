'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order')
const Database = use('Database')

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.pagination
   */
  async index({ request, response, pagination }) {
    const { status, id } = request.only(['status', 'id'])
    const query = Order.query()

    if (status && id) {
      query.where('status', status)
      query.orWhere('id', 'ILIKE', `%${id}%`)
    } else if (status) {
      query.where('status', status)
    } else if (id) {
      query.orWhere('id', 'ILIKE', `%${id}%`)
    }

    const orders = await query.paginate(pagination.page, pagination.limit)

    return response.status(200).send(orders)
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {}

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, response }) {
    const order = await Order.findOrFail(params.id)
    return response.send(order)
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const order = await Order.findOrFail(id)
    const trx = Database.beginTransaction()

    try {
      await order.items().delete(trx)
      await order.coupons().delete(trx)
      await order.delete(trx)
      await trx.commit()

      return response.status(204).send()
    } catch (error) {
      await trx.rollback()
      return response
        .status(400)
        .send({ message: 'Nao foi possivel deletar o pedido' })
    }
  }
}

module.exports = OrderController
