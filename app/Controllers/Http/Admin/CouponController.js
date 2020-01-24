'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Coupon = use('App/Models/Coupon')
const Database = use('Database')

/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.pagination
   */
  async index({ request, response, pagination }) {
    const code = request.input(['code'])
    const query = Coupon.query()

    if (code) {
      query.where('code', 'ILIKE', `${code}`)
    }

    const coupons = await query.paginate(pagination.page, pagination.limit)

    return response.send(coupons)
  }

  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    /**
     * Produto: cupom pode ser aplicado em um produto especifico.
     * Cliente: cupom pode ser aplicado em um cliente especifico.
     * Produto e Cliente: cupom pode ser aplicado em um produto e cliente especifico.
     * pode ser utilizado por qualquer cliente e produto.
     */

    const trx = await Database.beginTransaction()

    var can_use_for = {
      product: false,
      client: false
    }

    try {
      const couponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'quantity',
        'type',
        'recursive'
      ])

      const { users, products } = request.only(['users', 'products'])

      const coupon = await Coupon.create(couponData, trx)

      // Iniciando service layer
    } catch (error) {}
  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, request, response, view }) {
    const coupon = await Coupon.findOrFail(id)

    return response.send(coupon)
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const coupon = await Coupon.findOrFail(id)
    const trx = await Database.beginTransaction()

    try {
      await coupon.users().detach([], trx)
      await coupon.products().detach([], trx)
      await coupon.orders().detach([], trx)
      await coupon.delete()
      await trx.commit()
      return response.status(204).send()
    } catch (error) {
      await trx.rollback()
      return response
        .status(400)
        .send({ message: 'Nao foi possivel deletar o cupom.' })
    }
  }
}

module.exports = CouponController
