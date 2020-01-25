'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * CategoryTransformer class
 *
 * @class CategoryTransformer
 * @constructor
 */
class CategoryTransformer extends BumblebeeTransformer {
  /**
   * This method is used to transform the data.
   */
  transform (model) {
    return {
     // add your transformation object here
    }
  }
}

module.exports = CategoryTransformer
