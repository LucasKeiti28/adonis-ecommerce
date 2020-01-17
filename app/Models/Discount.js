'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Discount extends Model {
  // How we dont have a Discount table, we need associate with another table.
  static get table() {
    return 'coupon_order'
  }

  // sintaxe: o valor de order_id bate com o valor do id na tabela Order.
  order() {
    return this.belongsTo('App/Models/Order', 'order_id', 'id')
  }

  coupon() {
    return this.belongsTo('App/Models/Coupon', 'coupon_id', 'id')
  }
}

module.exports = Discount
