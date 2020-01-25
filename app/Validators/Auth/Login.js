'use strict'

class Login {
  get rules() {
    return {
      email: 'required|email',
      password: 'required'
    }
  }

  // get messages(){
  //   return{
  //     'email.required': 'O email ja existe'
  //   }
  // }
}

module.exports = Login
