import Head from 'next/head'
import React from 'react'
import { useIntl } from '@core/next/intl'
import { PageContent, PageHeader, PageWrapper } from '../../containers/BaseLayout'
import { OrganizationRequired } from '../../containers/OrganizationRequired'
import { TicketForm } from '../../containers/TicketForm'

const CreateTicketPage = () => {
    const intl = useIntl()
    const PageTitleMsg = intl.formatMessage({ id:'pages.condo.ticket.index.CreateTicketModalTitle' })

    return (
        <>
            <Head>
                <title>{PageTitleMsg}</title>
            </Head>
            <PageWrapper>
                <PageHeader title={PageTitleMsg}/>
                <PageContent>
                    <OrganizationRequired>
                        <TicketForm/>
                    </OrganizationRequired>
                </PageContent>
            </PageWrapper>
        </>
    )
}

export default CreateTicketPage
