import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { Col, Row, Typography } from 'antd'

import { Modal } from '@condo/domains/common/components/Modal'
import { useIntl } from '@open-condo/next/intl'
import { Button } from '@condo/domains/common/components/Button'
import { MAX_FILTERED_ELEMENTS } from '@condo/domains/ticket/constants/restrictions'

interface IUseTicketWarningModal {
    (selectedEntity: string): { TicketWarningModal: React.FC, setIsVisible: Dispatch<SetStateAction<boolean>> }
}

export const useTicketWarningModal: IUseTicketWarningModal = (selectedEntity) => {
    const intl = useIntl()
    const ConfirmTitle = intl.formatMessage({ id: 'component.TicketWarningModal.ConfirmTitle' })
    const EntityTitle = intl.formatMessage({ id: 'component.TicketWarningModal.Entity.' + selectedEntity })
    const ModalTitle = intl.formatMessage({ id: 'component.TicketWarningModal.Title' }, {
        ticketFilterRestriction: MAX_FILTERED_ELEMENTS,
        selectedEntity: EntityTitle,
    })
    const ModalDescription = intl.formatMessage({ id: 'component.TicketWarningModal.Description' }, {
        ticketFilterRestriction: MAX_FILTERED_ELEMENTS,
        selectedEntity: EntityTitle,
    })

    const [isVisible, setIsVisible] = useState<boolean>(false)
    const closeModal = useCallback(() => {
        setIsVisible(false)
    }, [])

    const TicketWarningModal: React.FC = () => (
        <Modal
            closable={false}
            visible={isVisible}
            onCancel={closeModal}
            footer={[
                <Button
                    key='submit'
                    size='large'
                    type='sberPrimary'
                    onClick={closeModal}
                >{ConfirmTitle}</Button>,
            ]}
        >
            <Row gutter={[0, 40]}>
                <Col span={24}>
                    <Typography.Title level={3}>{ModalTitle}</Typography.Title>
                </Col>
                <Col span={24}>
                    <Typography.Text>
                        {ModalDescription}
                    </Typography.Text>
                </Col>
            </Row>
        </Modal>
    )

    return {
        setIsVisible,
        TicketWarningModal,
    }
}
