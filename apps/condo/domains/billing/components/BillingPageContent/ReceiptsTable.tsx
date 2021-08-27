import React, { useCallback, useState } from 'react'
import { IContextProps } from './index'
import {
    QueryMeta,
    getStringContainsFilter,
    getPageIndexFromOffset,
    parseQuery,
} from '@condo/domains/common/utils/tables.utils'
import { useQueryMappers } from '@condo/domains/common/hooks/useQueryMappers'
import { useRouter } from 'next/router'
import { useIntl } from '@core/next/intl'
import { Table, DEFAULT_PAGE_SIZE } from '@condo/domains/common/components/Table/Index'
import { BillingReceipt } from '@condo/domains/billing/utils/clientSchema'
import { BillingReceiptWhereInput, SortBillingReceiptsBy } from '@app/condo/schema'
import get from 'lodash/get'
import { useSearch } from '@condo/domains/common/hooks/useSearch'
import { usePeriodSelector } from '@condo/domains/billing/hooks/usePeriodSelector'
import { Row, Col, Input, Select, Typography } from 'antd'
import { BasicEmptyListView } from '@condo/domains/common/components/EmptyListView'
import { useReceiptTableColumns } from '@condo/domains/billing/hooks/useReceiptTableColumns'
import { getMoneyFilter } from '@condo/domains/billing/utils/helpers'
import { ServicesModal } from '../ServicesModal'
import { IBillingReceiptUIState } from '@condo/domains/billing/utils/clientSchema/BillingReceipt'

const addressFilter = getStringContainsFilter(['property', 'address'])
const accountFilter = getStringContainsFilter(['account', 'number'])
const periodFilter = (period: string) => ({ period })
const staticQueryMetas: Array<QueryMeta<BillingReceiptWhereInput>> = [
    { keyword: 'address', filters: [addressFilter] },
    { keyword: 'account', filters: [accountFilter] },
]

const sortableProperties = ['toPay']

export const ReceiptsTable: React.FC<IContextProps> = ({ context }) => {
    const intl = useIntl()
    const SearchPlaceholder = intl.formatMessage({ id: 'filters.FullSearch' })
    const DataForTitle = intl.formatMessage({ id: 'DataFor' })
    const LoadingErrorMessage = intl.formatMessage({ id: 'errors.LoadingError' })

    const router = useRouter()
    const { filters, sorters, offset } = parseQuery(router.query)
    const currentPageIndex = getPageIndexFromOffset(offset, DEFAULT_PAGE_SIZE)

    const contextPeriod = get(context, ['lastReport', 'period'], null)
    const separator = get(context, ['integration', 'currency', 'displayInfo', 'delimiterNative'], '.')
    const currencySign = get(context, ['integration', 'currency', 'displayInfo', 'symbolNative'], '₽')
    const toPayFilter = getMoneyFilter('toPay', separator)
    const queryMetas: Array<QueryMeta<BillingReceiptWhereInput>> = [
        ...staticQueryMetas,
        { keyword: 'period', filters: [periodFilter], defaultValue: contextPeriod },
        { keyword: 'toPay', filters: [toPayFilter] },
        { keyword: 'search', filters: [addressFilter, accountFilter, toPayFilter], combineType: 'OR' },
    ]
    const { filtersToWhere, sortersToSortBy } = useQueryMappers(queryMetas, sortableProperties)
    const {
        loading,
        count: total,
        objs: receipts,
        error,
    } = BillingReceipt.useObjects({
        where: { ...filtersToWhere(filters), context: { id: context.id } },
        sortBy: sortersToSortBy(sorters) as SortBillingReceiptsBy[],
        first: DEFAULT_PAGE_SIZE,
        skip: (currentPageIndex - 1) * DEFAULT_PAGE_SIZE,
    })

    const [search, handleSearchChange] = useSearch(loading)
    const [period, options, handlePeriodChange] = usePeriodSelector(contextPeriod)

    const hasToPayDetails = get(context, ['integration', 'dataFormat', 'hasToPayDetail'], false)
    const hasServices = get(context, ['integration', 'dataFormat', 'hasServices'], false)
    const hasServicesDetail = get(context, ['integration', 'dataFormat', 'hasServicesDetail'], false)
    const mainTableColumns = useReceiptTableColumns(hasToPayDetails, currencySign, separator)

    const [modalIsVisible, setModalIsVisible] = useState(false)
    const [detailedReceipt, setDetailedReceipt] = useState<IBillingReceiptUIState>(null)
    const showServiceModal = (receipt: IBillingReceiptUIState) => {
        setModalIsVisible(true)
        setDetailedReceipt(receipt || null)
        return
    }
    const hideServiceModal = () => {
        setModalIsVisible(false)
    }

    const onRow = useCallback((record: IBillingReceiptUIState) => {
        return {
            onClick: () => {
                if (hasServices) {
                    showServiceModal(record)
                }
            },
        }
    }, [hasServices])

    if (error) {
        return (
            <BasicEmptyListView>
                <Typography.Title level={4}>
                    {LoadingErrorMessage}
                </Typography.Title>
            </BasicEmptyListView>
        )
    }

    return (
        <>
            <Row gutter={[0, 40]}>
                <Col span={7}>
                    <Input
                        placeholder={SearchPlaceholder}
                        onChange={(e) => {handleSearchChange(e.target.value)}}
                        value={search}
                    />
                </Col>
                {options.length > 0 && (
                    <Col span={7} offset={1}>
                        <Select
                            defaultValue={contextPeriod}
                            value={period}
                            onChange={(newValue) => handlePeriodChange(newValue)}
                        >
                            {
                                options.map((option, index) => {
                                    return (
                                        <Select.Option value={option.period} key={index}>
                                            {`${DataForTitle} ${option.title}`}
                                        </Select.Option>
                                    )
                                })
                            }
                        </Select>
                    </Col>

                )}
                <Col span={24}>
                    <Table
                        loading={loading}
                        totalRows={total}
                        dataSource={receipts}
                        columns={mainTableColumns}
                        onRow={onRow}
                    />
                </Col>
            </Row>
            <ServicesModal
                receipt={detailedReceipt}
                visible={modalIsVisible}
                onOk={hideServiceModal}
                onCancel={hideServiceModal}
                isDetailed={hasServicesDetail}
                currencyMark={currencySign}
                currencySeparator={separator}
            />
        </>
    )
}