import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import Error from 'next/error'
import { BILLING_APP_TYPE, APP_TYPES } from '@condo/domains/miniapp/constants'
import get from 'lodash/get'
import LoadingOrErrorPage from '@condo/domains/common/components/containers/LoadingOrErrorPage'
import { useOrganization } from '@core/next/organization'
import { useIntl } from '@core/next/intl'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import { ReturnBackHeaderAction } from '@condo/domains/common/components/HeaderActions'
import { AboutBillingServicePage, AboutAcquiringServicePage } from '@condo/domains/miniapp/components/AppDescription'
import { ServicePageWrapper } from '@condo/domains/miniapp/components/ServicePageWrapper'

const AboutServicePage = () => {
    const intl = useIntl()
    const PageTitle = intl.formatMessage({ id: 'menu.Services' })
    const NoPermissionsMessage = intl.formatMessage({ id: 'NoPermissionToPage' })

    const { query: { type, id } } = useRouter()

    const userOrganization = useOrganization()
    const canManageIntegrations = get(userOrganization, ['link', 'role', 'canManageIntegrations'], false)

    const pageContent = useMemo(() => {
        if (Array.isArray(id) || Array.isArray(type) || !APP_TYPES.includes(type)) return <Error statusCode={404}/>
        if (type === BILLING_APP_TYPE) return <AboutBillingServicePage id={id}/>
        return <AboutAcquiringServicePage id={id}/>
    }, [id, type])

    if (!canManageIntegrations) {
        return <LoadingOrErrorPage title={PageTitle} error={NoPermissionsMessage}/>
    }

    return (
        <ServicePageWrapper>
            {pageContent}
        </ServicePageWrapper>
    )
}

AboutServicePage.requiredAccess = OrganizationRequired
AboutServicePage.headerAction  = <ReturnBackHeaderAction
    descriptor={{ id: 'menu.Services' }}
    path={'/services'}/>

export default AboutServicePage