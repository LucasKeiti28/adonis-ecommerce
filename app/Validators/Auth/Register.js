'use strict'

class AuthRegister {
  get rules() {
    return {
      name: 'required',
      surname: 'required',
      email: 'required|email|unique:users,email',
      password: 'required/confirmed'
    }
  }

  get messages() {
    return {
      'name.required': 'O nome é obrigatorio',
      'surname.required': 'O sobrenome e obrigatorio',
      'email.required': 'O email eh obrigatorio',
      'email.email': 'O email eh invalido',
      'email.unique': 'Este email ja existe',
      'password.required': 'A senha eh obrigatoria',
      'password.confirmed': 'As senhas nao sao iguais'
    }
  }
}

module.exports = AuthRegister
