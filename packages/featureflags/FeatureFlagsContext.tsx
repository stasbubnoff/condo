import { GrowthBook, GrowthBookProvider, useGrowthBook } from '@growthbook/growthbook-react'
import getConfig from 'next/config'
import { createContext, useCallback, useContext, useEffect } from 'react'
import isEqual from 'lodash/isEqual'
import get from 'lodash/get'
import { useAuth } from '@open-condo/next/auth'

const growthbook = new GrowthBook()
const FEATURES_RE_FETCH_INTERVAL = 10 * 1000

interface IFeatureFlagsContext {
    useFlag: (name: string) => boolean,
    updateContext: (context) => void
}

const FeatureFlagsContext = createContext<IFeatureFlagsContext>(null)

const useFeatureFlags = (): IFeatureFlagsContext => useContext(FeatureFlagsContext)

const FeatureFlagsProviderWrapper = ({ children }) => {
    const growthbook = useGrowthBook()
    const { user } = useAuth()

    const isSupport = get(user, 'isSupport', false)
    const isAdmin = get(user, 'isAdmin', false)

    const {
        publicRuntimeConfig: {
            serverUrl,
        },
    } = getConfig()

    const updateContext = useCallback((context) => {
        const previousContext = growthbook.getAttributes()

        growthbook.setAttributes({ ...previousContext, ...context })
    }, [growthbook])
    const useFlag = useCallback((id) => growthbook.feature(id).on, [growthbook])

    useEffect(() => {
        const fetchFeatures = () => {
            if (serverUrl) {
                fetch(`${serverUrl}/api/features`)
                    .then((res) => res.json())
                    .then((features) => {
                        const prev = growthbook.getFeatures()
                        if (!isEqual(prev, features)) {
                            growthbook.setFeatures(features)
                        }
                    })
                    .catch(e => console.error(e))
            }
        }

        fetchFeatures()
        const handler = setInterval(() => fetchFeatures(), FEATURES_RE_FETCH_INTERVAL)

        return () => {
            clearInterval(handler)
        }
    }, [growthbook, serverUrl])

    useEffect(() => {
        updateContext({ isSupport: isSupport || isAdmin })
    }, [updateContext, isAdmin, isSupport])

    return (
        <FeatureFlagsContext.Provider value={{
            useFlag,
            updateContext,
        }}>
            {children}
        </FeatureFlagsContext.Provider>
    )
}

const FeatureFlagsProvider: React.FC = ({ children }) => {
    return (
        <GrowthBookProvider growthbook={growthbook}>
            <FeatureFlagsProviderWrapper>
                {children}
            </FeatureFlagsProviderWrapper>
        </GrowthBookProvider>
    )
}

export { useFeatureFlags, FeatureFlagsProvider }