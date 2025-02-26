import React, { useCallback, useEffect } from 'react'
import { AcquiringIntegration, AcquiringIntegrationContext } from '@condo/domains/acquiring/utils/clientSchema'
import get from 'lodash/get'
import { useOrganization } from '@open-condo/next/organization'
import { AppDescriptionPageContent } from './AppDescriptionPageContent'
import LoadingOrErrorPage from '@condo/domains/common/components/containers/LoadingOrErrorPage'
import { useIntl } from '@open-condo/next/intl'
import Error from 'next/error'
import Head from 'next/head'
import { PageContent, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { ACQUIRING_APP_TYPE } from '@condo/domains/miniapp/constants'
import { useRouter } from 'next/router'

interface AboutAcquiringAppPageProps {
    id: string,
}

export const AboutAcquiringAppPage: React.FC<AboutAcquiringAppPageProps> = ({ id }) => {
    const intl = useIntl()
    const LoadingMessage = intl.formatMessage({ id: 'Loading' })
    const AcquiringMessage = intl.formatMessage({ id: `miniapps.category.${ACQUIRING_APP_TYPE}` })

    const userOrganization = useOrganization()
    const organizationId = get(userOrganization, ['organization', 'id'], null)

    const router = useRouter()

    const { obj: integration, loading: integrationLoading, error: integrationError } = AcquiringIntegration.useObject({
        where: { id },
    })

    const { obj: context, loading: contextLoading, error: contextError } = AcquiringIntegrationContext.useObject({
        where: {
            organization: { id: organizationId },
            integration: { id },
        },
    })

    const redirectUrl = `/miniapps/${id}?type=${ACQUIRING_APP_TYPE}`

    const initialAction = AcquiringIntegrationContext.useCreate({
        settings: { dv: 1 },
        state: { dv: 1 },
    }, () => {
        router.push(redirectUrl)
    })

    const createContextAction = useCallback(() => {
        initialAction({ organization: { connect: { id: organizationId } }, integration: { connect: { id } } } )
    }, [initialAction, id, organizationId])

    // NOTE: Page visiting is valid if:
    // Acquiring context not exist
    // If context exist -> redirect to app index page
    useEffect(() => {
        if (integration && !contextLoading && !contextError && context) {
            router.push(redirectUrl)
        }
    }, [router, integration, contextLoading, contextError, context, id, redirectUrl])

    if (integrationLoading || integrationError) {
        return (
            <LoadingOrErrorPage
                title={LoadingMessage}
                error={integrationError}
                loading={integrationLoading}
            />
        )
    }

    if (!integration) {
        return <Error statusCode={404}/>
    }

    const PageTitle = get(integration, 'name', AcquiringMessage)

    const aboutSections = get(integration, ['about', '0', 'props', 'sections'], [])

    return (
        <>
            <Head>
                <title>{PageTitle}</title>
            </Head>
            <PageWrapper>
                <PageContent>
                    <AppDescriptionPageContent
                        title={integration.name}
                        description={integration.shortDescription}
                        published={integration.createdAt}
                        logoSrc={get(integration, ['logo', 'publicUrl'])}
                        tag={AcquiringMessage}
                        developer={integration.developer}
                        partnerUrl={get(integration, 'partnerUrl')}
                        aboutSections={aboutSections}
                        instruction={integration.instruction}
                        appUrl={integration.appUrl}
                        connectAction={createContextAction}
                    />
                </PageContent>
            </PageWrapper>
        </>
    )
}