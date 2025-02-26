import { FilterFilled } from '@ant-design/icons'
import { useQuery } from '@open-condo/next/apollo'
import { BillingIntegrationOrganizationContext, SortPaymentsBy } from '@app/condo/schema'
import { PAYMENT_DONE_STATUS, PAYMENT_WITHDRAWN_STATUS } from '@condo/domains/acquiring/constants/payment'
import { PaymentsSumTable } from '@condo/domains/acquiring/components/payments/PaymentsSumTable'
import { EXPORT_PAYMENTS_TO_EXCEL, SUM_PAYMENTS_QUERY } from '@condo/domains/acquiring/gql'
import { usePaymentsTableColumns } from '@condo/domains/acquiring/hooks/usePaymentsTableColumns'
import { usePaymentsTableFilters } from '@condo/domains/acquiring/hooks/usePaymentsTableFilters'
import { Payment, PaymentsFilterTemplate } from '@condo/domains/acquiring/utils/clientSchema'
import { IFilters } from '@condo/domains/acquiring/utils/helpers'
import { Button } from '@condo/domains/common/components/Button'
import { ExportToExcelActionBar } from '@condo/domains/common/components/ExportToExcelActionBar'
import { useLayoutContext } from '@condo/domains/common/components/LayoutContext'
import DateRangePicker from '@condo/domains/common/components/Pickers/DateRangePicker'
import { DEFAULT_PAGE_SIZE, Table } from '@condo/domains/common/components/Table/Index'
import { TableFiltersContainer } from '@condo/domains/common/components/TableFiltersContainer'
import { useDateRangeSearch } from '@condo/domains/common/hooks/useDateRangeSearch'
import {
    MultipleFilterContextProvider,
    useMultipleFiltersModal,
} from '@condo/domains/common/hooks/useMultipleFiltersModal'
import { useQueryMappers } from '@condo/domains/common/hooks/useQueryMappers'
import { useSearch } from '@condo/domains/common/hooks/useSearch'
import { getPageIndexFromOffset, parseQuery } from '@condo/domains/common/utils/tables.utils'
import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'
import { Col, Row, Space, Typography } from 'antd'

import Input from '@condo/domains/common/components/antd/Input'
import { Gutter } from 'antd/lib/grid/row'
import dayjs, { Dayjs } from 'dayjs'
import { get, isEmpty } from 'lodash'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { getMoneyRender } from '@condo/domains/common/components/Table/Renders'
import { Modal } from '@condo/domains/common/components/Modal'

const SORTABLE_PROPERTIES = ['advancedAt', 'amount']
const PAYMENTS_DEFAULT_SORT_BY = ['advancedAt_DESC']
const DEFAULT_CURRENCY_CODE = 'RUB'
const DEFAULT_DATE_RANGE: [Dayjs, Dayjs] = [dayjs().subtract(1, 'week'), dayjs()]
const DEFAULT_DATE_RANGE_STR: [string, string] = [String(DEFAULT_DATE_RANGE[0]), String(DEFAULT_DATE_RANGE[1])]

const ROW_GUTTER: [Gutter, Gutter] = [0, 30]
const TAP_BAR_ROW_GUTTER: [Gutter, Gutter] = [0, 20]
const SUM_BAR_COL_GUTTER: [Gutter, Gutter] = [40, 0]
const DATE_PICKER_COL_LAYOUT = { span: 11, offset: 1 }

/**
 * Next two variables need for keeping data about default filters during component lifetime
 */
let isDefaultFilterApplied = false
let shouldApplyDefaultFilter = true

interface IPaymentsTableProps {
    billingContext: BillingIntegrationOrganizationContext,
    contextsLoading: boolean,
}

interface IPaymentsSumInfoProps {
    title: string
    message: string
    currencyCode: string
    type?:  'success' | 'warning'
    loading: boolean
}

const PaymentsSumInfo: React.FC<IPaymentsSumInfoProps> = ({
    title,
    message,
    currencyCode = DEFAULT_CURRENCY_CODE,
    type,
    loading,
}) => {
    const intl = useIntl()

    return (
        <Space direction='horizontal' size={10}>
            <Typography.Text type='secondary'>{title}</Typography.Text>
            <Typography.Text
                {...{ type }}
                strong={true}
            >
                {loading ? '…' : getMoneyRender(intl, currencyCode)(message)}
            </Typography.Text>
        </Space>
    )
}

function usePaymentsSum (whereQuery) {
    const { data, error, loading } = useQuery(SUM_PAYMENTS_QUERY, {
        fetchPolicy: 'cache-first',
        variables: {
            where: {
                ...whereQuery,
            },
        },
    })
    return { data, error, loading }
}

const PaymentsTableContent: React.FC<IPaymentsTableProps> = ({ billingContext, contextsLoading }): JSX.Element => {
    const intl = useIntl()
    const SearchPlaceholder = intl.formatMessage({ id: 'filters.FullSearch' })
    const FiltersButtonLabel = intl.formatMessage({ id: 'FiltersLabel' })
    const StartDateMessage = intl.formatMessage({ id: 'pages.condo.meter.StartDate' })
    const EndDateMessage = intl.formatMessage({ id: 'pages.condo.meter.EndDate' })
    const ConfirmTitle = intl.formatMessage({ id: 'component.TicketWarningModal.ConfirmTitle' })
    const TotalsSumTitle = intl.formatMessage({ id: 'pages.condo.payments.TotalSum' })
    const DoneSumTitle = intl.formatMessage({ id: 'MultiPayment.status.DONE' })
    const WithdrawnSumTitle = intl.formatMessage({ id: 'MultiPayment.status.PROCESSING' })

    const { isSmall } = useLayoutContext()
    const router = useRouter()
    const userOrganization = useOrganization()

    const { filters, sorters, offset } = parseQuery(router.query)
    const hasFilters = !isEmpty(filters)

    if (hasFilters) {
        shouldApplyDefaultFilter = false
        isDefaultFilterApplied = true
    }

    if (shouldApplyDefaultFilter) {
        filters.advancedAt = DEFAULT_DATE_RANGE_STR
    }

    const appliedFiltersCount = Object.keys(filters).length
    const currencyCode = get(billingContext, ['integration', 'currencyCode'], 'RUB')

    const [isStatusDescModalVisible, setIsStatusDescModalVisible] = useState<boolean>(false)
    const [titleStatusDescModal, setTitleStatusDescModal] = useState('')
    const [textStatusDescModal, setTextStatusDescModal] = useState('')
    const openStatusDescModal = (statusType) => {
        const titleModal = intl.formatMessage({ id: 'payment.status.description.title.' + statusType })
        const textModal = intl.formatMessage({ id: 'payment.status.description.text.' + statusType })

        setTitleStatusDescModal(titleModal)
        setTextStatusDescModal(textModal)
        setIsStatusDescModalVisible(true)
    }

    const tableColumns = usePaymentsTableColumns(currencyCode, openStatusDescModal)

    const organizationId = get(userOrganization, ['organization', 'id'], '')
    const queryMetas = usePaymentsTableFilters(billingContext, organizationId)

    const currentPageIndex = getPageIndexFromOffset(offset, DEFAULT_PAGE_SIZE)
    const { filtersToWhere, sortersToSortBy } = useQueryMappers(queryMetas, SORTABLE_PROPERTIES)

    const searchPaymentsQuery: Record<string, unknown> = {
        ...filtersToWhere(filters),
        organization: { id: organizationId },
        deletedAt: null,
        status_in: [PAYMENT_WITHDRAWN_STATUS, PAYMENT_DONE_STATUS],
    }
    const sortBy = sortersToSortBy(sorters, PAYMENTS_DEFAULT_SORT_BY)

    const {
        loading,
        count,
        objs,
        error,
    } = Payment.useObjects({
        where: searchPaymentsQuery,
        sortBy: sortBy as SortPaymentsBy[],
        first: DEFAULT_PAGE_SIZE,
        skip: (currentPageIndex - 1) * DEFAULT_PAGE_SIZE,
    }, {
        fetchPolicy: 'network-only',
    })

    const { data: sumDonePayments, loading: donePaymentsLoading } = usePaymentsSum({ ...searchPaymentsQuery, status: PAYMENT_DONE_STATUS })
    const { data: sumWithdrawnPayments, loading: withdrawnPaymentsLoading } = usePaymentsSum({ ...searchPaymentsQuery, status: PAYMENT_WITHDRAWN_STATUS })
    const { data: sumAllPayments, loading: allPaymentsLoading } = usePaymentsSum({ ...searchPaymentsQuery })

    const [search, handleSearchChange, handleResetSearch] = useSearch<IFilters>()
    const [dateRange, setDateRange] = useDateRangeSearch('advancedAt', loading)
    const {
        MultipleFiltersModal,
        ResetFiltersModalButton,
        setIsMultipleFiltersModalVisible,
    } = useMultipleFiltersModal(queryMetas, PaymentsFilterTemplate, handleResetSearch)

    /**
     * We need to check if default filters should be applied only at first render
     */
    useEffect(() => {
        if (!hasFilters && shouldApplyDefaultFilter && !isDefaultFilterApplied) {
            isDefaultFilterApplied = true
            setDateRange(DEFAULT_DATE_RANGE)
        } else {
            shouldApplyDefaultFilter = false
        }

        return () => {
            isDefaultFilterApplied = false
            shouldApplyDefaultFilter = true
        }
    }, [])

    return (
        <>
            <Row gutter={ROW_GUTTER} align='middle' justify='center'>
                <Col span={24}>
                    <TableFiltersContainer>
                        <Row justify='end' gutter={TAP_BAR_ROW_GUTTER}>
                            <Col flex='auto'>
                                <Row gutter={TAP_BAR_ROW_GUTTER}>
                                    <Col xs={24} sm={12} lg={8}>
                                        <Input
                                            placeholder={SearchPlaceholder}
                                            value={search}
                                            onChange={(e) => {
                                                handleSearchChange(e.target.value)
                                            }}
                                            allowClear
                                        />
                                    </Col>
                                    <Col xs={24} sm={DATE_PICKER_COL_LAYOUT} lg={DATE_PICKER_COL_LAYOUT}>
                                        <DateRangePicker
                                            value={dateRange}
                                            onChange={setDateRange}
                                            placeholder={[StartDateMessage, EndDateMessage]}
                                        />
                                    </Col>
                                </Row>
                            </Col>

                            <Col offset={1}>
                                <Row justify='end' align='middle'>
                                    {
                                        appliedFiltersCount > 0 && (
                                            <Col>
                                                <ResetFiltersModalButton />
                                            </Col>
                                        )
                                    }
                                    <Col>
                                        <Button
                                            secondary
                                            type='sberPrimary'
                                            onClick={() => setIsMultipleFiltersModalVisible(true)}
                                        >
                                            <FilterFilled/>
                                            {FiltersButtonLabel}
                                            {appliedFiltersCount > 0 && ` (${appliedFiltersCount})`}
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </TableFiltersContainer>
                </Col>

                <Col span={24}>
                    <PaymentsSumTable>
                        <Row justify='center' gutter={SUM_BAR_COL_GUTTER}>
                            <Col>
                                <PaymentsSumInfo
                                    title={TotalsSumTitle}
                                    message={get(sumAllPayments, 'result.sum')}
                                    currencyCode={currencyCode}
                                    loading={allPaymentsLoading}
                                />
                            </Col>
                            <Col>
                                <PaymentsSumInfo
                                    title={DoneSumTitle}
                                    message={get(sumDonePayments, 'result.sum')}
                                    currencyCode={currencyCode}
                                    type='success'
                                    loading={donePaymentsLoading}
                                />
                            </Col>
                            <Col>
                                <PaymentsSumInfo
                                    title={WithdrawnSumTitle}
                                    message={get(sumWithdrawnPayments, 'result.sum')}
                                    currencyCode={currencyCode}
                                    type='warning'
                                    loading={withdrawnPaymentsLoading}
                                />
                            </Col>
                        </Row>
                    </PaymentsSumTable>
                </Col>

                <Col span={24}>
                    <Table
                        loading={loading || contextsLoading}
                        dataSource={objs}
                        totalRows={count}
                        columns={tableColumns}
                    />
                </Col>
                <ExportToExcelActionBar
                    hidden={isSmall}
                    searchObjectsQuery={searchPaymentsQuery}
                    sortBy={sortBy}
                    exportToExcelQuery={EXPORT_PAYMENTS_TO_EXCEL}
                    disabled={count < 1}
                />
            </Row>

            <Modal
                visible={isStatusDescModalVisible}
                onCancel={() => setIsStatusDescModalVisible(false)}
                title={titleStatusDescModal}
                centered
                footer={[
                    <Button
                        key='close'
                        type='sberDefaultGradient'
                        onClick={() => setIsStatusDescModalVisible(false)}
                    >
                        {ConfirmTitle}
                    </Button>,
                ]}
            >
                <Typography.Text type='secondary'>
                    {textStatusDescModal}
                </Typography.Text>
            </Modal>

            <MultipleFiltersModal />
        </>
    )
}

const PaymentsTable: React.FC<IPaymentsTableProps> = (props) => {
    return (
        <MultipleFilterContextProvider>
            <PaymentsTableContent {...props} />
        </MultipleFilterContextProvider>
    )
}

export default PaymentsTable
