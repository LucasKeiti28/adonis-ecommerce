'use strict'

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
}

module.exports = OrderService
