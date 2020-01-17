'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Product extends Model {
  categories() {
    return this.belongsToMany('App/Models/Category')
  }

  image() {
    return this.belongsTo('App/Models/Image')
  }

  // Relationship between product and gallery of images
  images() {
    return this.belongsToMany('App/Models/Image')
  }

  // Relationship between product and coupons
  coupons() {
    return this.belongsToMany('App/Models/Coupon')
  }
}

module.exports = Product
