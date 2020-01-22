'use strict'

class AuthController {
  async register({ request, response }) {}

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
