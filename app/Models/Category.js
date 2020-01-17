'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Category extends Model {
  // Relation between category and image.
  image() {
    return this.belongsTo('App/Models/Image')
  }

  // Relation between category and product.
  product() {
    return this.belongsToMany('App/Models/Product')
  }
}

module.exports = Category
