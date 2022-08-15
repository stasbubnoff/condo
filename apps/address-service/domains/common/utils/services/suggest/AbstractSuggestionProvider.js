/**
 * @typedef {Object} NormalizedSuggestion
 * @property {string} country "Russia"
 * @property {?string} region "Sverdlovsk region"
 * @property {string} city "Yekaterinburg"
 * @property {?string} street "Lenina"
 * @property {string} building "66", "66a"
 * @property {?string} unitType "room", "flat", "box"
 * @property {?string} unitName "428", "42/8"
 */

/**
 * @abstract
 */
class AbstractSuggestionProvider {
    /**
     * Calls to particular external service using particular client
     * @param {string} query
     * @param {boolean} isServerSide sometimes we need different query params for queries from front-end and backend (for dadata)
     * @param {number} count
     * @returns {Promise<*>}
     * @abstract
     * @private
     */
    async call ({ query, isServerSide = false, count = 20 }) {
        throw new Error('Method still not implemented.')
    }

    /**
     * Sends search string to external suggestions service
     * @param {string} query
     * @param {boolean} isServerSide {@see call}
     * @param {number} count
     * @returns {Promise<Array>}
     * @public
     */
    async get ({ query, isServerSide = false, count = 20 }) {
        return await this.call({ query, isServerSide, count })
    }

    /**
     * Normalizes data got from external service
     * @param {Array} data
     * @returns {NormalizedSuggestion[]}
     * @abstract
     * @public
     */
    normalize (data) {
        throw new Error('Method still not implemented.')
    }

    /**
     * Denormalizes data to external service's format
     * @param {NormalizedSuggestion[]} data
     * @returns {Array}
     * @abstract
     * @public
     */
    denormalize (data) {
        throw new Error('Method still not implemented.')
    }

    /**
     * @param {string} s
     * @returns {Array}
     * @public
     */
    getInjections (s) {
        return []
    }
}

module.exports = { AbstractSuggestionProvider }
