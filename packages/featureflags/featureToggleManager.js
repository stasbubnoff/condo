const { get } = require('lodash')
const { GrowthBook } = require('@growthbook/growthbook')
const conf = require('@open-condo/config')
const { getRedisClient } = require('@open-condo/keystone/redis')
const { getLogger } = require('@open-condo/keystone/logging')

const logger = getLogger('featureToggleManager')

const FEATURE_TOGGLE_CONFIG = conf['FEATURE_TOGGLE_CONFIG']
let featureToggleApiUrl
let featureToggleApiKey

const REDIS_FEATURES_KEY = 'features'
const FEATURES_EXPIRED_IN_SECONDS = 60

const WRONG_FEATURE_TOGGLE_CONFIG_ERROR = 'Wrong FEATURE_TOGGLE_CONFIG config!'

class FeatureToggleManager {
    constructor () {
        try {
            const config = JSON.parse(FEATURE_TOGGLE_CONFIG)
            featureToggleApiUrl = config.url
            featureToggleApiKey = config.apiKey
        } catch (e) {
            logger.error({ msg: 'parse FEATURE_TOGGLE_CONFIG error', error: e })
        }
    }

    async fetchFeatures () {
        try {
            const redisClient = getRedisClient()
            const cachedFeatureFlags = await redisClient.get(REDIS_FEATURES_KEY)

            if (cachedFeatureFlags) return JSON.parse(cachedFeatureFlags)

            if (featureToggleApiUrl && featureToggleApiKey) {
                const fetchedFeatureFlags = await fetch(`${featureToggleApiUrl}/${featureToggleApiKey}`)
                    .then((res) => res.json())
                    .then((parsed) => {
                        return Promise.resolve(parsed.features)
                    })

                redisClient.set(REDIS_FEATURES_KEY, JSON.stringify(fetchedFeatureFlags), 'EX', FEATURES_EXPIRED_IN_SECONDS)

                return fetchedFeatureFlags
            } else {
                throw new Error(WRONG_FEATURE_TOGGLE_CONFIG_ERROR)
            }
        } catch (e) {
            logger.error({ msg: 'fetchFeatures error', error: e })

            return {}
        }
    }

    async isFeatureEnabled (keystoneContext, featureName, featuresContext) {
        const context = get(keystoneContext, 'req', null)
            ? keystoneContext
            : { req: { features: await this.fetchFeatures() } }

        const request = context.req
        const headersFeatureFlags = get(request, ['headers', 'feature-flags'])

        // Here it will stop under tests
        if (conf.NODE_ENV === 'test') return headersFeatureFlags === 'true'

        const growthbook = new GrowthBook()

        growthbook.setFeatures(request.features)

        if (featuresContext) growthbook.setAttributes(featuresContext)

        return growthbook.isOn(featureName)
    }
}

const featureToggleManager = new FeatureToggleManager()

module.exports = {
    featureToggleManager,
}