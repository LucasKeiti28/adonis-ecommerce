'use strict'

const Product = use('App/Models/Product')
const Transformer = use('App/Transformers/Admin/ProductTransformer')

class ProductController {
  async index({ request, response, pagination, transform }) {
    const title = request.input('title')

    const query = Product.query()

    if (title) {
      query.where('name', 'ILIKE', `%${title}%`)
    }

    const results = await query.paginate(pagination.page, pagination.limit)
    const products = await transform.paginate(results, Transformer)

    return response.status(201).send(products)
  }

  async show({ params: { id }, request, response, pagination, transform }) {
    const result = await Product.findOrFail(id)

    const product = await transform.item(result, Transformer)

    return response.status(201).send(product)
  }
}

module.exports = ProductController
