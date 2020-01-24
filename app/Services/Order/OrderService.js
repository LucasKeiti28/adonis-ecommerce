'use strict'

const Database = use('Database')

class OrderService {
  constructor(model, trx = null) {
    this.model = model
    this.trx = trx
  }

  // Inclui os items no pedido
  async syncItems(items) {
    if (!Array.isArray(items)) {
      return false
    }
    await this.model.items().delete(this.trx)
    await this.model(items).createMany(items, this.trx)
  }

  // Atualiza as quantidades de items no pedido
  async updateItems(items) {
    let currentItems = await this.model
      .items()
      .whereIn(
        'id',
        items.map(item => item.id)
      )
      .fetch()
    // Deleta os itens que o usuario nao quer mais
    await this.model
      .items()
      .whereNotIn(
        'id',
        items.map(item => item.id)
      )
      .delete(this.trx)

    // Atualizando os valores e quantidades dos items.
    // item e' um dos produtos que recebemos do banco de dados, esta dentro de currentItems.
    await Promise.all(
      currentItems.rows.map(async item => {
        item.fill(items.find(n => n.id === item.id))
        await item.save(this.trx)
      })
    )
  }

  // Verifica se o usuario pode aplicar o desconto em um determinado pedido
  async canApplyDiscount(coupon) {
    // verifica a validade por data.
    const now = new Date().getTime()
    if (
      now > coupon.valid_from.getTime() ||
      (typeof coupon.valid_until == 'object' &&
        coupon.valid_until.getTime() < now)
    ) {
      // verifica se o cupom ja entrou no periodo valido
      // verifica se ha uma data de expiracao
      // se houver a data de expiracao, ele ira verificar se a data de expiracao e' menor do que hoje.

      return false
    }
    const couponProducts = await Database.from('coupon_products')
      .where('coupon_id', coupon.id)
      .pluck('product_id')

    const couponClients = await Database.from('coupon_users')
      .where('coupon_id', coupon.id)
      .pluck('user_id')

    // verificar se o cupom nao esta associado a produtos ou clientes especificos.
    if (
      Array.isArray(couponProducts) &&
      couponProducts.length < 1 &&
      Array.isArray(couponClients) &&
      couponClients.length < 1
    ) {
      /**
       * Caso nao esteja associado a um cliente ou produco especifico, o uso eh livre.
       */
      return true
    }

    // verificar se o cupom esta associado a pelo menos um (produto ou cliente), ou even both.
    let isAssociateToProduct,
      isAssociateToClient = false

    if (Array.isArray(couponProducts) && couponProducts.length > 0) {
      isAssociateToProduct = true
    }

    if (Array.isArray(couponClients) && couponClients.length > 0) {
      isAssociateToClient = true
    }

    const productsMatch = await Database.from('order_items')
      .where('order_id', this.model.id)
      .whereIn('product_id', couponProducts)
      .pluck('product_id')

    /**
     * Caso de uso 1: o cupom esta associado a cliente e produtos especificos
     */
    if (isAssociateToClient && isAssociateToProduct) {
      const clientsMatch = couponClients.find(
        client => client === this.model.user_id
      )

      if (
        clientsMatch &&
        Array.isArray(productsMatch) &&
        productsMatch.length > 0
      ) {
        return true
      }
    }

    /**
     * Caso de uso 2: o cupom esta associado apenas a produtos.
     */
    if (
      isAssociateToProduct &&
      Array.isArray(productsMatch) &&
      productsMatch.length > 0
    ) {
      return true
    }

    /**
     * Caso de uso 3: o cupom esta associado apenas a clientes
     */
    if (
      isAssociateToClient &&
      Array.isArray(couponClients) &&
      couponClients.length > 0
    ) {
      const match = couponClients.find(client => client === this.model.user_id)
      if (match) {
        return true
      }
    }

    /**
     * Caso de uso 4: caso nenhuma das verificacoes acimas for positivas
     * entao o cupom esta associado a clientes e/ou produtos,
     * porem nenhum dos produtos deste pedido esta elegivel ao desconto,
     * e o cliente que fez a compra tbm nao esta elegivel.
     */

    return false
  }
}

module.exports = OrderService
