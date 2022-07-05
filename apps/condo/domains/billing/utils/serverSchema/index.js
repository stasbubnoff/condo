/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateServerUtils } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')
const { BillingIntegration: BillingIntegrationGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationAccessRight: BillingIntegrationAccessRightGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationOrganizationContext: BillingIntegrationOrganizationContextGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationLog: BillingIntegrationLogGQL } = require('@condo/domains/billing/gql')
const { BillingProperty: BillingPropertyGQL } = require('@condo/domains/billing/gql')
const { BillingAccount: BillingAccountGQL } = require('@condo/domains/billing/gql')
const { BillingMeterResource: BillingMeterResourceGQL } = require('@condo/domains/billing/gql')
const { BillingAccountMeter: BillingAccountMeterGQL } = require('@condo/domains/billing/gql')
const { BillingAccountMeterReading: BillingAccountMeterReadingGQL } = require('@condo/domains/billing/gql')
const { BillingReceipt: BillingReceiptGQL } = require('@condo/domains/billing/gql')
const { BillingOrganization: BillingOrganizationGQL } = require('@condo/domains/billing/gql')
const { ResidentBillingReceipt: ResidentBillingReceiptGQL } = require('@condo/domains/billing/gql')
const { BillingCurrency: BillingCurrencyGQL } = require('@condo/domains/billing/gql')
const { BillingRecipient: BillingRecipientGQL } = require('@condo/domains/billing/gql')
const { execGqlWithoutAccess } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')
const { Payment } = require('@condo/domains/acquiring/gql')
const { BillingCategory: BillingCategoryGQL } = require('@condo/domains/billing/gql')
const { REGISTER_BILLING_RECEIPTS_MUTATION } = require('@condo/domains/billing/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const BillingIntegration = generateServerUtils(BillingIntegrationGQL)
const BillingIntegrationAccessRight = generateServerUtils(BillingIntegrationAccessRightGQL)
const BillingIntegrationOrganizationContext = generateServerUtils(BillingIntegrationOrganizationContextGQL)
const BillingIntegrationLog = generateServerUtils(BillingIntegrationLogGQL)
const BillingProperty = generateServerUtils(BillingPropertyGQL)
const BillingAccount = generateServerUtils(BillingAccountGQL)
const BillingMeterResource = generateServerUtils(BillingMeterResourceGQL)
const BillingAccountMeter = generateServerUtils(BillingAccountMeterGQL)
const BillingAccountMeterReading = generateServerUtils(BillingAccountMeterReadingGQL)
const BillingReceipt = generateServerUtils(BillingReceiptGQL)
const BillingOrganization = generateServerUtils(BillingOrganizationGQL)
const ResidentBillingReceipt = generateServerUtils(ResidentBillingReceiptGQL)


const BillingCurrency = generateServerUtils(BillingCurrencyGQL)
const BillingRecipient = generateServerUtils(BillingRecipientGQL)

async function exportPayments (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: Payment.GET_ALL_OBJS_QUERY,
        variables: data,
        errorMessage: '[error] Unable to exportPayments',
        dataPath: 'objs',
    })
}

const BillingCategory = generateServerUtils(BillingCategoryGQL)
async function registerBillingReceipts (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')
    // TODO(codegen): write registerBillingReceipts serverSchema guards

    return await execGqlWithoutAccess(context, {
        query: REGISTER_BILLING_RECEIPTS_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to registerBillingReceipts',
        dataPath: 'obj',
    })
}

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    BillingIntegration,
    BillingIntegrationAccessRight,
    BillingIntegrationOrganizationContext,
    BillingIntegrationLog,
    BillingProperty,
    BillingAccount,
    BillingMeterResource,
    BillingAccountMeter,
    BillingAccountMeterReading,
    BillingReceipt,
    BillingOrganization,
    ResidentBillingReceipt,
    BillingCurrency,
    BillingRecipient,
    exportPayments,
    BillingCategory,
    registerBillingReceipts,
/* AUTOGENERATE MARKER <EXPORTS> */
}
