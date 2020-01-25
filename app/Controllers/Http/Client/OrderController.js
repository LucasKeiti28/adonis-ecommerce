'use strict'

const Order = use('App/Models/Order')
const Coupon = use('App/Models/Coupon')
const Discount = use('App/Models/Discount')
const Transformer = use('App/Transformer/Admin/OrderTransformer')
const Database = use('Database')
const Service = use('App/Services/Order/OrderService')
const Ws = use('Ws')

class OrderController {
  async index({ request, response, pagination, transform, auth }) {
    // order number
    const client = await auth.getUser()
    const number = request.input('number')
    const query = Order.query()
    if (number) {
      query.where('id', 'ILIKE', `${number}`)
    }

    query.where('user_id', client.id)

    const results = await query
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.limit)

    const orders = await transform.paginate(results, Transformer)

    return response.status(201).send(orders)
  }

  async show({ params: { id }, response, transform, auth }) {
    const client = await auth.getUser()
    const result = await Order.query()
      .where('user_id', client.id)
      .where('id', id)
      .firstOrFail()

    const order = await transform.item(result, Transformer)

    return response.send(order)
  }

  async store({ request, response, auth, transform }) {
    const trx = await Database.beginTransaction()

    try {
      const client = await auth.getUser()
      const items = request.input('items') //retorna um array

      var order = await Order.create({ user_id: client.id }, trx)
      const service = new Service(order, trx)
      if (items.length > 0) {
        await service.syncItems(items)
      }

      await trx.commit()

      // Instancia os hooks de calculos de subtotais
      order = await Order.find(order.id)
      order = await transform.include('items').item(order, Transformer)

      // Emite um broadcast no WS
      const topic = Ws.getChannel('notifications').topic('notifications')
      if (topic) {
        topic.broadcast('new:order', order)
      }

      return response.status(201).send(order)
    } catch (error) {
      trx.rollback()
      return response
        .status(400)
        .send({ message: 'Nao foi possivel criar o pedido.' })
    }
  }

  async update({ params: { id }, request, response, auth, transform }) {
    const client = await auth.getUser()
    var order = await Order.query()
      .where('user_id', client.id)
      .where('id', id)
      .firstOrFail()

    const trx = await Database.beginTransaction()

    try {
      const { items, status } = request.all()
      order.merge({ user_id: client.id, status })

      const service = new Service(order, trx)
      await service.updateItems(items)

      await order.save(trx)
      await trx.commit()

      order = await tranform
        .include('items,coupons,discounts')
        .item(order, Transformer)

      return response.status(200).send(order)
    } catch (error) {
      trx.rollback()

      return response
        .status(400)
        .send({ message: 'Nao foi possivel atualizar o pedido.' })
    }
  }

  async applyDiscount({ params: { id }, request, response, transform, auth }) {
    const { code } = request.all()
    const coupon = await Coupon.findByOrFail('code', code.toUpperCase())
    const client = await auth.getUser()
    const order = await Order.query()
      .where('user_id', client.id)
      .where('id', id)
      .firstOrFail()

    var discount,
      info = {}

    try {
      const service = new Service(order)
      const canAddDiscount = await service.canApplyDiscount(coupon)
      const orderDiscounts = await Order.coupons().getCount()

      const canApplyToOrder =
        orderDiscounts < 1 || (orderDiscounts >= 1 && coupon.recusrive)

      if (canAddDiscount && canApplyToOrder) {
        discount = await Discount.findOrCreate({
          order_id: order.id,
          coupon_id: coupon.id
        })

        info.message = 'Cupom aplicado com sucesso'
        info.success = true
      } else {
        info.message = 'Nao foi possivel aplicar o cupom'
        info.success = false
      }

      order = await transform
        .include('coupons, items, discounts')
        .item(order, Transformer)

      return response.status(200).send({ order, info })
    } catch (error) {
      return response.status(400).send({ message: 'Erro desconhecido.' })
    }
  }

  async removeDiscount({ params: { id }, request, response }) {
    const { discount_id } = request.all()
    const discount = await Discount.findOrFail(discount_id)
    await discount.delete()

    return response.status(204).send()
  }
}

module.exports = OrderController
