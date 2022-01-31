import dayjs from 'dayjs'
import { useIntl } from '@core/next/intl'
import React, { useCallback, useState } from 'react'
import { Col, Form, Row, Typography } from 'antd'
import { Gutter } from 'antd/es/grid/row'

import DatePicker from '@condo/domains/common/components/Pickers/DatePicker'

const INITIAL_DEADLINE_VALUE = dayjs(new Date()).add(2, 'day')
const isDateDisabled = date => date.startOf('day').isBefore(dayjs().startOf('day'))
const AUTO_DETECTED_DEADLINE_COL_STYLE = { height: '48px' }
const AUTO_DETECTED_DEADLINE_ROW_STYLE = { height: '100%' }
const TICKET_DEADLINE_DATEPICKER_STYLE = { width: '100%' }
const TICKET_DEADLINE_FIELD_ROW_GUTTER: [Gutter, Gutter] = [40, 0]

export const TicketDeadlineField = ({ initialValue }) => {
    const intl = useIntl()
    const CompleteBeforeMessage = intl.formatMessage({ id: 'ticket.deadline.CompleteBefore' })
    const AutoCompletionMessage = intl.formatMessage({ id: 'ticket.deadline.AutoCompletion' })

    const [isAutoDetectedValue, setIsAutoDetectedValue] = useState<boolean>(!initialValue)

    const handleTicketDeadlineChange = useCallback(() => {
        setIsAutoDetectedValue(false)
    }, [])

    return (
        <Row align={'bottom'} gutter={TICKET_DEADLINE_FIELD_ROW_GUTTER}>
            <Col span={10}>
                <Form.Item
                    label={CompleteBeforeMessage}
                    name={'deadline'}
                    required
                    initialValue={INITIAL_DEADLINE_VALUE}
                >
                    <DatePicker
                        format='DD MMMM YYYY'
                        style={TICKET_DEADLINE_DATEPICKER_STYLE}
                        onChange={handleTicketDeadlineChange}
                        disabledDate={isDateDisabled}
                    />
                </Form.Item>
            </Col>
            {
                isAutoDetectedValue && (
                    <Col style={AUTO_DETECTED_DEADLINE_COL_STYLE}>
                        <Row justify={'center'} align={'middle'} style={AUTO_DETECTED_DEADLINE_ROW_STYLE}>
                            <Col>
                                <Typography.Text type={'secondary'}>
                                    {AutoCompletionMessage}
                                </Typography.Text>
                            </Col>
                        </Row>
                    </Col>
                )
            }
        </Row>
    )
}