'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Coupon extends Model {
  // Formata os valores para o padrao do pg.
  static get dates() {
    return ['created_at', 'update_ad', 'valid_from', 'valid_until']
  }

  users() {
    return this.belongsToMany('App/Models/User')
  }

  products() {
    return this.belongsToMany('App/Models/Product')
  }

  orders() {
    return this.belongsToMany('App/Models/Order')
  }
}

module.exports = Coupon
