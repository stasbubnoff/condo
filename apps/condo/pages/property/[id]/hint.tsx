/** @jsx jsx */
import { Gutter } from 'antd/es/grid/row'
import { get } from 'lodash'
import React, { useMemo } from 'react'
import { useIntl } from '@core/next/intl'
import { useRouter } from 'next/router'
import { jsx } from '@emotion/core'
import Head from 'next/head'
import xss from 'xss'
import { Col, Row, Typography } from 'antd'

import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import { PageContent, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import LoadingOrErrorPage from '@condo/domains/common/components/containers/LoadingOrErrorPage'
import { useObject } from '@condo/domains/property/utils/clientSchema/Property'
import { TicketHint } from '@condo/domains/ticket/utils/clientSchema'

const GUTTER_0_40: [Gutter, Gutter] = [0, 40]

const PropertyHintPage = () => {
    const intl = useIntl()
    const PageTitleMsg = intl.formatMessage({ id: 'pages.condo.property.id.PageTitle' })
    const ServerErrorMsg = intl.formatMessage({ id: 'ServerError' })
    const PropertyHintMessage = intl.formatMessage({ id: 'pages.condo.settings.hint.propertyHint' })

    const router = useRouter()
    const propertyId = get(router, ['query', 'id'], null)

    const { loading: propertyLoading, obj: property, error } = useObject({ where: { id: propertyId } })
    const { loading: ticketHintLoading, obj: ticketHint } = TicketHint.useObject({
        where: {
            properties_some: { id: propertyId },
        },
    })

    const htmlContent = useMemo(() => ({
        __html: xss(get(ticketHint, 'content')),
    }), [ticketHint])

    if (error || propertyLoading || ticketHintLoading) {
        return <LoadingOrErrorPage title={PageTitleMsg} loading={propertyLoading} error={error ? ServerErrorMsg : null}/>
    }

    return <>
        <Head>
            <title>{PageTitleMsg}</title>
        </Head>
        <PageWrapper>
            <PageContent>
                <Row>
                    <Col span={18}>
                        <Row gutter={GUTTER_0_40}>
                            <Col span={24}>
                                <Typography.Title>
                                    {PropertyHintMessage} {`${property.address}`}
                                </Typography.Title>
                            </Col>
                            <Col span={24}>
                                <div dangerouslySetInnerHTML={htmlContent}/>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </PageContent>
        </PageWrapper>
    </>
}

PropertyHintPage.requiredAccess = OrganizationRequired

export default PropertyHintPage
