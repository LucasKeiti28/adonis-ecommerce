'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Order extends Model {
  static boot() {
    super.boot()

    this.addHook('afterFind', 'OrderHook.updatedValues')
    this.addHook('afterPaginate', 'OderHook.updateCollectionValues')
  }

  items() {
    return this.hasMany('App/Models/OrderItem')
  }

  coupons() {
    return this.belongsToMany('App/Models/Coupon')
  }

  discount() {
    return this.hasMany('App/Models/Discount')
  }

  user() {
    return this.belongsTo('App/Models/User', 'user_id', 'id')
  }
}

module.exports = Order
