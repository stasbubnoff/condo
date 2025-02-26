import { BillingReceipt } from '@app/condo/domains/billing/utils/clientSchema'
import { BankCardIcon } from '@app/condo/domains/common/components/icons/BankCardIcon'
import { Ticket } from '@app/condo/schema'
import { MobileIcon } from '@condo/domains/common/components/icons/MobileIcon'
import { Loader } from '@condo/domains/common/components/Loader'

import { Tooltip } from '@condo/domains/common/components/Tooltip'
import { useIntl } from '@open-condo/next/intl'
import { Col, Row } from 'antd'
import { Gutter } from 'antd/es/grid/row'
import dayjs from 'dayjs'
import get from 'lodash/get'
import React from 'react'

interface MobileAppInstalledIndicatorProps {
    isContactHasMobileApp: boolean
}

const MobileAppInstalledIndicator: React.FC<MobileAppInstalledIndicatorProps> = ({ isContactHasMobileApp }) => {
    const intl = useIntl()
    const MobileAppInstalledMessage = intl.formatMessage({ id: 'pages.condo.ticket.MobileAppInstalled' })
    const MobileAppNotInstalledMessage = intl.formatMessage({ id: 'pages.condo.ticket.MobileAppNotInstalled' })

    return (
        <Tooltip title={isContactHasMobileApp ? MobileAppInstalledMessage : MobileAppNotInstalledMessage}>
            <MobileIcon active={isContactHasMobileApp} />
        </Tooltip>
    )
}

interface PaymentsAvailableIndicatorProps {
    ticketOrganizationId: string
}

/**
 Availability is determined by:
 1. at least 1 receipt for the current or previous period has been uploaded to the organization.
 2. If the number of receipts for the previous period is not equal to 0,
 then the number of receipts for the current period must be greater than or equal to the number for the previous one.
 */
const getIsPaymentsInMobileAppAvailable = (receiptsInCurrentPeriod, receiptsInPreviousPeriod) => {
    if (receiptsInCurrentPeriod > 0 || receiptsInPreviousPeriod > 0) {
        if (receiptsInPreviousPeriod === 0) return true

        if (receiptsInCurrentPeriod >= receiptsInPreviousPeriod) {
            return true
        }
    }

    return false
}

const PaymentsAvailableIndicator: React.FC<PaymentsAvailableIndicatorProps> = ({ ticketOrganizationId }) => {
    const intl = useIntl()
    const PaymentsAvailableMessage = intl.formatMessage({ id: 'pages.condo.ticket.PaymentsAvailable' })
    const PaymentsNotAvailableMessage = intl.formatMessage({ id: 'pages.condo.ticket.PaymentsNotAvailable' })

    const currentPeriod = dayjs().startOf('month').subtract(1, 'month').format('YYYY-MM-DD')
    const previousPeriod = dayjs(currentPeriod).subtract(1, 'month').format('YYYY-MM-DD')

    const receiptsSearchQuery = { context: { organization: { id: ticketOrganizationId, deletedAt: null }, deletedAt: null } }

    const { count: receiptsInCurrentPeriod, loading: currentPeriodLoading } = BillingReceipt.useCount({
        where: {
            ...receiptsSearchQuery,
            period: currentPeriod,
            deletedAt: null,
        },
    })

    const { count: receiptsInPreviousPeriod, loading: previousPeriodLoading } = BillingReceipt.useCount({
        where: {
            ...receiptsSearchQuery,
            period: previousPeriod,
            deletedAt: null,
        },
    })

    const isPaymentsAvailable = getIsPaymentsInMobileAppAvailable(receiptsInCurrentPeriod, receiptsInPreviousPeriod)

    return (
        <Tooltip title={isPaymentsAvailable ? PaymentsAvailableMessage : PaymentsNotAvailableMessage}>
            <BankCardIcon active={isPaymentsAvailable} loading={currentPeriodLoading || previousPeriodLoading} />
        </Tooltip>
    )
}

interface TicketResidentFeaturesProps {
    ticket: Ticket
}

const TICKET_RESIDENT_FEATURES_ROW_GUTTER: [Gutter, Gutter] = [8, 0]

export const TicketResidentFeatures: React.FC<TicketResidentFeaturesProps> = ({ ticket }) => {
    const isContactHasMobileApp = !!get(ticket, 'client')
    const ticketOrganizationId = get(ticket, ['organization', 'id'], null)

    return (
        <Row gutter={TICKET_RESIDENT_FEATURES_ROW_GUTTER}>
            <Col>
                <MobileAppInstalledIndicator isContactHasMobileApp={isContactHasMobileApp} />
            </Col>
            <Col>
                <PaymentsAvailableIndicator ticketOrganizationId={ticketOrganizationId} />
            </Col>
        </Row>
    )
}