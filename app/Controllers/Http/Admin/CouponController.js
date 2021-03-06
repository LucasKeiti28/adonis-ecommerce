'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Coupon = use('App/Models/Coupon')
const Database = use('Database')
const Service = use('App/Services/Coupon/CouponService')
const Transformer = use('App/Transformers/Admin/CouponTransformer')

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
  async index({ request, response, pagination, transform }) {
    const code = request.input(['code'])
    const query = Coupon.query()

    if (code) {
      query.where('code', 'ILIKE', `${code}`)
    }

    var coupons = await query.paginate(pagination.page, pagination.limit)
    coupons = await transform.paginate(coupons, Transformer)

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
  async store({ request, response, transform }) {
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

      var coupon = await Coupon.create(couponData, trx)

      // Iniciando service layer
      const service = new Service(coupon, trx)

      // Inserindo os relacionamentos no Banco de Dados.
      if (users && users.length > 0) {
        await service.syncUsers(users)
        can_use_for.client = true
      }

      if (products && products.length > 0) {
        await service.syncProducts(products)
        can_use_for.product = true
      }

      if (can_use_for.client && can_use_for.product) {
        coupon.can_use_for = 'product_client'
      } else if (!can_use_for.client && can_use_for.product) {
        coupon.can_use_for = 'product'
      } else if (can_use_for.client && !can_use_for.product) {
        coupon.can_use_for = 'client'
      } else {
        coupon.can_use_for = 'all'
      }

      await coupon.save(trx)
      await trx.commit()

      coupon = await transform
        .includes('users, products')
        .item(coupon, Transformer)

      return response.status(201).send(coupon)
    } catch (error) {
      await trx.rollback()
      return response
        .status(401)
        .send({ message: 'Cupom nao cadastrado, tente novamente.' })
    }
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
  async show({ params: { id }, request, response, transform }) {
    var coupon = await Coupon.findOrFail(id)
    coupon = await transform
      .includes('products,users,orders')
      .item(coupon, Transformer)

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
  async update({ params: { id }, request, response, transform }) {
    const trx = await Database.beginTransaction()
    var coupon = await Coupon.findOrFail(id)

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

      coupon.merge(couponData)

      const { users, products } = request.only(['users', 'products'])

      const service = new Service(coupon, trx)

      if (users && users.length > 0) {
        await service.syncUsers(users)
        can_use_for.client = true
      }

      if (products && products.length > 0) {
        await service.syncProducts(products)
        can_use_for.product = true
      }

      if (can_use_for.client && can_use_for.product) {
        coupon.can_use_for = 'product_client'
      } else if (!can_use_for.client && can_use_for.product) {
        coupon.can_use_for = 'product'
      } else if (can_use_for.client && !can_use_for.product) {
        coupon.can_use_for = 'client'
      } else {
        coupon.can_use_for = 'all'
      }

      await coupon.save(trx)
      await trx.commit()

      coupon = await transform.item(coupon, Transformer)

      return response.status(200).send(coupon)
    } catch (error) {
      await trx.rollback()
      return response
        .status(401)
        .send({ message: 'Cupom nao cadastrado, tente novamente.' })
    }
  }

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
