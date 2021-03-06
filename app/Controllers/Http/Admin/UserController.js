'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const User = use('App/Models/User')
const Transformer = use('App/Transformers/Admin/UserTransformer')

/**
 * Resourceful controller for interacting with users
 */
class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {Object} ctx.pagination
   */
  async index({ request, response, pagination, transform }) {
    const name = request.input('name')
    const surname = request.input('surname')
    const email = request.input('email')

    const query = User.query()

    if (name) {
      query.where('name', 'ILIKE', `%${name}%`)
      query.orWhere('surname', 'ILIKE', `%${surname}%`)
      query.orWhere('email', 'ILIKE', `%${email}%`)
    }

    var users = await query.paginate(pagination.page, pagination.limit)
    users = await transform.paginate(users, Transformer)

    return response.send(users)
  }

  /**
   * Render a form to be used for creating a new user.
   * GET users/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create({ request, response, view }) {}

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    try {
      const userData = request.only([
        'name',
        'surname',
        'email',
        'password',
        'image_id'
      ])

      var user = await User.create(userData)
      users = await transform.item(users, Transformer)

      return response.status(201).send(user)
    } catch (error) {
      return response
        .status(401)
        .send({ message: 'Nao foi possivel criar o usuario nesse momento' })
    }
  }

  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, request, response, transform }) {
    var user = await User.findOrFail(id)
    users = await transform.item(users, Transformer)
    return response.send(user)
  }

  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response, transform }) {
    var user = await User.findOrFail(params.id)
    try {
      const userData = request.only(['name', 'surname', 'email', 'password'])
      user.merge(userData)
      user.save()
      users = await transform.item(users, Transformer)
      return response.status(201).send(user)
    } catch (error) {
      return response.status(401).send({ message: 'Usuario nao atualizado.' })
    }
  }

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const user = await User.findOrFail(id)
    try {
      await user.delete()
      return response
        .status(200)
        .send({ message: 'Usuario deletado com sucesso.' })
    } catch (error) {
      return response.send({
        message: 'Usuario nao foi deletado, tente novamente.'
      })
    }
  }
}

module.exports = UserController
