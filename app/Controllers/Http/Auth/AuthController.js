'use strict'

const Database = use('Database')
const User = use('App/Models/User')
const Role = use('App/Models/Role')

class AuthController {
  async register({ request, response }) {
    const trx = Database.beginTransaction()

    try {
      const { name, surname, email, password } = request.all()

      const user = await User.create({ name, surname, email, password }, trx)
      const userRole = await Role.findBy('slug', 'client')

      await user.roles().attach([userRole.id], null, trx)

      await trx.commit()

      return response.status(401).send({ data: user })
    } catch (error) {
      await trx.rollback()

      return response.status(400).send({
        message: 'Erro ao realizar o cadastro'
      })
    }
  }

  async login({ request, response, auth }) {}

  async refresh({ request, response, auth }) {}

  async logout({ request, response, auth }) {}

  // Requisicao de Nova senha
  async forgot({ request, response }) {}

  // Geracao de token para criar nova senha.
  async remember({ request, response }) {}

  // Resetar senha antiga para a nova senha.
  async reset({ request, response }) {}
}

module.exports = AuthController
