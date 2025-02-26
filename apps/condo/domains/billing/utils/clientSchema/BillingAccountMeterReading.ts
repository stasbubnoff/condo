/**
 * Generated by `createschema billing.BillingAccountMeterReading 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; account:Relationship:BillingAccount:CASCADE; meter:Relationship:BillingAccountMeter:CASCADE; period:CalendarDay; value1:Integer; value2:Integer; value3:Integer; date:DateTimeUtc; raw:Json; meta:Json' --force`
 */
import {
    BillingAccountMeterReading,
    BillingAccountMeterReadingCreateInput,
    BillingAccountMeterReadingUpdateInput,
    QueryAllBillingAccountMeterReadingsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { BillingAccountMeterReading as BillingAccountMeterReadingGQL } from '@condo/domains/billing/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<BillingAccountMeterReading, BillingAccountMeterReadingCreateInput, BillingAccountMeterReadingUpdateInput, QueryAllBillingAccountMeterReadingsArgs>(BillingAccountMeterReadingGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
