import { FocusContainer } from '@condo/domains/common/components/FocusContainer'
import styled from '@emotion/styled'
import { Alert, Col, Divider, Form, Input, Row, Space, Typography } from 'antd'
import { resourceIdToIcon } from '../utils/clientSchema'
import React, { useState } from 'react'
import { BillingAccountMeterReading } from '../../../schema'
import { IMeterFormState } from '../utils/clientSchema/Meter'
import dayjs from 'dayjs'
import { useIntl } from '@core/next/intl'
import { fontSizes } from '@condo/domains/common/constants/style'
import { useValidations } from '../../common/hooks/useValidations'

type MeterCardProps = {
    meter: IMeterFormState
    resource: {
        id: string
        name: string
        measure: string
    }
    name: string | number
    lastMeterBillingMeterReading?: BillingAccountMeterReading
}

const MeterCardWrapper = styled(FocusContainer)`
  margin: 0;
`

export const MeterCard = ({ meter, resource, name, lastMeterBillingMeterReading }: MeterCardProps) => {
    const intl = useIntl()
    const VerificationDateMessage = intl.formatMessage({ id: 'pages.condo.meter.VerificationDate' })

    const { numberValidator } = useValidations()
    const validations = {
        readingValue: [numberValidator],
    }

    const Icon = resource ? resourceIdToIcon[resource.id] : null
    const numberOfTariffs = meter.numberOfTariffs ? meter.numberOfTariffs : 1

    return (
        <MeterCardWrapper>
            <Row gutter={[10, 0]}>
                <Col span={24}>
                    <Row justify={'space-between'}>
                        <Col>
                            <Space>
                                <Icon style={{ fontSize: '20px' }} />
                                <Typography.Text style={{ fontSize: fontSizes.content }} strong={true}>
                                    {resource.name}
                                </Typography.Text>
                            </Space>
                        </Col>
                        {
                            meter.nextVerificationDate &&
                            dayjs(meter.nextVerificationDate).diff(dayjs(), 'month') < 2 ? (
                                    <Col>
                                        <Alert
                                            showIcon
                                            type='warning'
                                            message={
                                                <>
                                                    <Typography.Text type={'warning'}>
                                                        {VerificationDateMessage}
                                                    </Typography.Text>
                                                    &nbsp;
                                                    <Typography.Text strong={true} type={'warning'}>
                                                        {dayjs(meter.nextVerificationDate).format('DD.MM.YYYY')}
                                                    </Typography.Text>
                                                </>
                                            }
                                        />
                                    </Col>
                                ) : null
                        }
                    </Row>
                </Col>
                {
                    Array.from({ length: numberOfTariffs }, (_, i) => i + 1)
                        .map(tariffNumber => (
                            <React.Fragment key={tariffNumber}>
                                {
                                    tariffNumber > 1 ? (
                                        <Divider />
                                    ) : null
                                }
                                <Col span={24}>
                                    <Row gutter={[20, 0]} align={'bottom'}>
                                        <Col span={14}>
                                            <Form.Item
                                                name={[name, `value${tariffNumber}`]}
                                                label={
                                                    `№ ${meter.number} ${meter.place ? `(${meter.place})` : ''}
                                                        ${numberOfTariffs > 1 ? `T${tariffNumber}` : ''}`
                                                }
                                                rules={validations.readingValue}
                                            >
                                                <Input
                                                    addonAfter={resource.measure}
                                                />
                                            </Form.Item>
                                        </Col>
                                        {
                                            lastMeterBillingMeterReading ? (
                                                <Col span={8}>
                                                    <Typography.Paragraph style={{ margin: 0 }} strong={true}>
                                                        {lastMeterBillingMeterReading[`value${tariffNumber}`]} {resource.measure}
                                                    </Typography.Paragraph>
                                                    <Typography.Text type={'secondary'}>
                                                        ${lastMeterBillingMeterReading.date}
                                                    </Typography.Text>
                                                </Col>
                                            ) : null
                                        }
                                    </Row>
                                </Col>
                            </React.Fragment>
                        ))
                }
            </Row>
        </MeterCardWrapper>
    )
}