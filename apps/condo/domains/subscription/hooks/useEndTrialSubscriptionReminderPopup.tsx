import React, { useState, Dispatch, SetStateAction, useEffect } from 'react'
import { Col, Row, Typography } from 'antd'

import { Modal } from '@condo/domains/common/components/Modal'
import { useIntl } from '@open-condo/next/intl'
import { Button } from '@condo/domains/common/components/Button'
import styled from '@emotion/styled'
import { fontSizes } from '@condo/domains/common/constants/style'
import { FormattedMessage } from '@open-condo/next/intl'
import { ServiceSubscriptionTypeType } from '@app/condo/schema'
import dayjs from 'dayjs'
import cookie from 'js-cookie'
import { useOrganization } from '@open-condo/next/organization'
import { ServiceSubscription } from '../utils/clientSchema'
import { useAuth } from '@open-condo/next/auth'
import { get } from 'lodash'


interface IEndTrialSubscriptionReminderPopup {
    EndTrialSubscriptionReminderPopup: React.FC
    setIsSEndTrialSubscriptionReminderPopupVisible: Dispatch<SetStateAction<boolean>>
    isEndTrialSubscriptionReminderPopupVisible: boolean
}

const EndTrialSubscriptionReminderPopupParagraph = styled(Typography.Paragraph)`
  font-size: ${fontSizes.content};
  padding: 0;
  margin: 0;
`

export const useEndTrialSubscriptionReminderPopup = (): IEndTrialSubscriptionReminderPopup => {
    const intl = useIntl()
    const ServiceDisconnectMessage = intl.formatMessage({ id: 'subscription.modal.newClient.serviceDisconnect' })
    const GratitudeMessage = intl.formatMessage({ id: 'subscription.modal.newClient.gratitude' })
    const CompleteActionMessage = intl.formatMessage({ id: 'subscription.modal.complete.action' })

    const [isEndTrialSubscriptionReminderPopupVisible, setIsSEndTrialSubscriptionReminderPopupVisible] = useState<boolean>(false)

    const organizationInfo = useOrganization()
    const userInfo = useAuth()

    const organizationId = get(organizationInfo, ['organization', 'id'])
    const userId = get(userInfo, ['user', 'id'])

    const threeDaysLater = dayjs().startOf('hour').add(3, 'days').toISOString()
    const thisMinute = dayjs().startOf('minute').toISOString()

    const cookieEndTrialSubscriptionReminderPopupConfirmedInfo = cookie.get('endTrialSubscriptionReminderPopupConfirmedInfo')
    const endTrialSubscriptionReminderPopupConfirmedInfo = cookieEndTrialSubscriptionReminderPopupConfirmedInfo ?
        JSON.parse(cookieEndTrialSubscriptionReminderPopupConfirmedInfo) : []

    const { objs: subscriptions, loading: subscriptionsLoading } = ServiceSubscription.useObjects({
        where: {
            organization: { id: organizationId },
            type: ServiceSubscriptionTypeType.Sbbol,
            isTrial: true,
            finishAt_lte: threeDaysLater,
            finishAt_gte: thisMinute,
        },
    })

    useEffect(() => {
        if (
            subscriptions.length > 0 &&
            !subscriptionsLoading &&
            !isEndTrialSubscriptionReminderPopupVisible &&
            !endTrialSubscriptionReminderPopupConfirmedInfo.find(info =>
                info.organization === organizationId && info.user === userId)
        )
            setIsSEndTrialSubscriptionReminderPopupVisible(true)
    }, [subscriptionsLoading])

    const subscription = subscriptions && subscriptions.length > 0 && subscriptions[0]

    const handleCloseModal = () => {
        setIsSEndTrialSubscriptionReminderPopupVisible(false)
        const newConfirmedInfo = {
            organization: organizationId,
            user: userId,
        }
        const newCookieSubscriberFirstLoginPopupConfirmedInfo = Array.isArray(endTrialSubscriptionReminderPopupConfirmedInfo) ?
            [...endTrialSubscriptionReminderPopupConfirmedInfo, newConfirmedInfo] : [newConfirmedInfo]

        // expires - 1 day
        cookie.set('endTrialSubscriptionReminderPopupConfirmedInfo',
            JSON.stringify(newCookieSubscriberFirstLoginPopupConfirmedInfo), {
                expires: 1,
            })
    }

    const EndTrialSubscriptionReminderPopup = () => (
        <Modal
            visible={isEndTrialSubscriptionReminderPopupVisible}
            onCancel={handleCloseModal}
            centered
            width={600}
            bodyStyle={{ padding: '30px' }}
            footer={[
                <Button
                    size='large'
                    key='submit'
                    type='sberPrimary'
                    onClick={handleCloseModal}
                >
                    {CompleteActionMessage}
                </Button>,
            ]}
        >
            <Row gutter={[0, 40]}>
                <Col span={24}>
                    <EndTrialSubscriptionReminderPopupParagraph strong>
                        {GratitudeMessage}
                    </EndTrialSubscriptionReminderPopupParagraph>
                    <EndTrialSubscriptionReminderPopupParagraph>
                        <FormattedMessage
                            id='subscription.modal.endTrialReminder.daysToEndTrial'
                            values={{
                                days: subscription && dayjs.duration(dayjs(subscription.finishAt).diff(dayjs())).humanize(),
                            }}
                        />
                    </EndTrialSubscriptionReminderPopupParagraph>
                    <EndTrialSubscriptionReminderPopupParagraph>
                        {ServiceDisconnectMessage}
                    </EndTrialSubscriptionReminderPopupParagraph>
                </Col>
            </Row>
        </Modal>
    )

    return {
        isEndTrialSubscriptionReminderPopupVisible,
        setIsSEndTrialSubscriptionReminderPopupVisible,
        EndTrialSubscriptionReminderPopup,
    }
}
