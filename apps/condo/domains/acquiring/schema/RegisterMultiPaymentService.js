/**
 * Generated by `createservice acquiring.RegisterMultiPaymentService`
 */

const { GQLCustomSchema } = require('@core/keystone/schema')
const access = require('@condo/domains/acquiring/access/RegisterMultiPaymentService')
const { DV_UNKNOWN_VERSION_ERROR } = require('@condo/domains/common/constants/errors')
const {
    REGISTER_MP_EMPTY_INPUT,
    REGISTER_MP_EMPTY_RECEIPTS,
    REGISTER_MP_CONSUMERS_DUPLICATE,
    REGISTER_MP_RECEIPTS_DUPLICATE,
    REGISTER_MP_REAL_CONSUMER_MISMATCH,
    REGISTER_MP_NO_ACQUIRING_CONSUMERS,
    REGISTER_MP_MULTIPLE_INTEGRATIONS,
    REGISTER_MP_CANNOT_GROUP_RECEIPTS,
    REGISTER_MP_UNSUPPORTED_BILLING,
    REGISTER_MP_REAL_RECEIPTS_MISMATCH,
    REGISTER_MP_DELETED_RECEIPTS,
    REGISTER_MP_MULTIPLE_CURRENCIES,
    REGISTER_MP_BILLING_ACCOUNTS_NO_MATCH,
    REGISTER_MP_INVALID_SENDER,
} = require('@condo/domains/acquiring/constants/errors')
const { DEFAULT_MULTIPAYMENT_SERVICE_CATEGORY } = require('@condo/domains/acquiring/constants/payment')
const { FEE_CALCULATION_PATH, WEB_VIEW_PATH } = require('@condo/domains/acquiring/constants/links')
const { JSON_STRUCTURE_FIELDS_CONSTRAINTS } = require('@condo/domains/common/utils/validation.utils')
// TODO(savelevMatthew): REPLACE WITH SERVER SCHEMAS AFTER GQL REFACTORING
const { find } = require('@core/keystone/schema')
const { Payment, MultiPayment, AcquiringIntegration } = require('@condo/domains/acquiring/utils/serverSchema')
const { freezeBillingReceipt } = require('@condo/domains/acquiring/utils/freezeBillingReceipt')
const get = require('lodash/get')
const Big = require('big.js')
const validate = require('validate.js')

const SENDER_FIELD_CONSTRAINTS = {
    ...JSON_STRUCTURE_FIELDS_CONSTRAINTS,
    dv: {
        numericality: {
            noStrings: true,
            equalTo: 1,
        },
    },
}


const RegisterMultiPaymentService = new GQLCustomSchema('RegisterMultiPaymentService', {
    types: [
        {
            access: true,
            type: 'input RegisterMultiPaymentServiceConsumerInput { consumerId: String!, receiptsIds: [String!]! }',
        },
        {
            access: true,
            type: 'input RegisterMultiPaymentInput { dv: Int!, sender: SenderFieldInput!, groupedReceipts: [RegisterMultiPaymentServiceConsumerInput!]! }',
        },
        {
            access: true,
            type: 'type RegisterMultiPaymentOutput { dv: Int!, multiPaymentId: String!, webViewUrl: String!, feeCalculationUrl: String! }',
        },
    ],
    
    mutations: [
        {
            access: access.canRegisterMultiPayment,
            schema: 'registerMultiPayment(data: RegisterMultiPaymentInput!): RegisterMultiPaymentOutput',
            resolver: async (parent, args, context) => {
                const { data } = args
                const { dv, sender, groupedReceipts } = data

                // Stage 0. Check if input is valid
                if (dv !== 1) {
                    throw new Error(`${DV_UNKNOWN_VERSION_ERROR}dv] Unknown \`dv\``)
                }

                const senderErrors = validate(sender, SENDER_FIELD_CONSTRAINTS)
                if (senderErrors && Object.keys(senderErrors).length) {
                    const details = Object.keys(senderErrors).map(field => {
                        return `${field}: [${senderErrors[field].map(error => `'${error}'`).join(', ')}]`
                    }).join(', ')
                    throw new Error(`${REGISTER_MP_INVALID_SENDER}. ${details}`)
                }

                if (!get(groupedReceipts, 'length')) {
                    throw new Error(REGISTER_MP_EMPTY_INPUT)
                }
                if (groupedReceipts.some(group => !get(group, ['receiptsIds', 'length']))) {
                    throw new Error(REGISTER_MP_EMPTY_RECEIPTS)
                }

                // Stage 0.1: Duplicates check
                const consumersIds = groupedReceipts.map(group => group.consumerId)
                const uniqueConsumerIds = new Set(consumersIds)
                if (consumersIds.length !== uniqueConsumerIds.size) {
                    throw new Error(REGISTER_MP_CONSUMERS_DUPLICATE)
                }
                const receiptsIds = groupedReceipts.flatMap(group => group.receiptsIds)
                const uniqueReceiptsIds = new Set(receiptsIds)
                if (receiptsIds.length !== uniqueReceiptsIds.size) {
                    throw new Error(REGISTER_MP_RECEIPTS_DUPLICATE)
                }

                // Stage 1. Check Acquiring
                const consumers = await find('ServiceConsumer', {
                    id_in: consumersIds,
                })
                if (consumers.length !== consumersIds.length) {
                    const existingConsumerIds = consumers.map(consumer => consumer.id)
                    const missingConsumerIds = consumersIds.filter(consumerId => !existingConsumerIds.includes(consumerId))
                    throw new Error(`${REGISTER_MP_REAL_CONSUMER_MISMATCH} Missing: ${missingConsumerIds.join(', ')}`)
                }
                const contextMissingConsumers = consumers
                    .filter(consumer => !get(consumer, 'acquiringIntegrationContext'))
                    .map(consumer => consumer.id)
                if (contextMissingConsumers.length) {
                    throw new Error(`${REGISTER_MP_NO_ACQUIRING_CONSUMERS} (${contextMissingConsumers.join(', ')})`)
                }

                const consumersByIds = Object.assign({}, ...consumers.map(obj => ({ [obj.id]: obj })))

                const uniqueAcquiringContextsIds = new Set(consumers.map(consumer => consumer.acquiringIntegrationContext))
                const acquiringContexts = await find('AcquiringIntegrationContext', {
                    id_in: Array.from(uniqueAcquiringContextsIds),
                })

                const acquiringContextsByIds = Object.assign({}, ...acquiringContexts.map(obj => ({ [obj.id]: obj })))

                const acquiringIntegrations = new Set(acquiringContexts.map(context => context.integration))
                if (acquiringIntegrations.size !== 1) {
                    throw new Error(REGISTER_MP_MULTIPLE_INTEGRATIONS)
                }

                // NOTE: Here using serverSchema to get many relation
                let acquiringIntegration = await AcquiringIntegration.getAll(context, {
                    id: Array.from(acquiringIntegrations)[0],
                })
                acquiringIntegration = get(acquiringIntegration, '0')
                // const acquiringIntegration = await getById('AcquiringIntegration', Array.from(acquiringIntegrations)[0])

                // TODO (savelevMatthew): check that all receipts linked to right consumers?
                // Stage 2. Check BillingReceipts
                if (receiptsIds.length > 1 && !acquiringIntegration.canGroupReceipts) {
                    throw new Error(REGISTER_MP_CANNOT_GROUP_RECEIPTS)
                }
                const receipts = await find('BillingReceipt', {
                    id_in: receiptsIds,
                })
                if (receipts.length !== receiptsIds.length) {
                    const existingReceiptsIds = new Set(receipts.map(receipt => receipt.id))
                    const missingReceipts = receiptsIds.filter(receiptId => !existingReceiptsIds.has(receiptId))
                    throw new Error(`${REGISTER_MP_REAL_RECEIPTS_MISMATCH} Missing: ${missingReceipts.join(', ')}`)
                }

                const deletedReceiptsIds = receipts.filter(receipt => Boolean(receipt.deletedAt)).map(receipt => receipt.id)
                if (deletedReceiptsIds.length) {
                    throw new Error(`${REGISTER_MP_DELETED_RECEIPTS} (${deletedReceiptsIds.join(', ')})`)
                }

                const receiptsByIds = Object.assign({}, ...receipts.map(obj => ({ [obj.id]: obj })))
                groupedReceipts.forEach(group => {
                    group.receiptsIds.forEach(receiptId => {
                        const receipt = receiptsByIds[receiptId]
                        const billingAccount = receipt.account
                        const consumer = consumersByIds[group.consumerId]
                        if (billingAccount !== consumer.billingAccount) {
                            throw new Error(`${REGISTER_MP_BILLING_ACCOUNTS_NO_MATCH} (ReceiptId: ${receiptId}, ConsumerId: ${group.consumerId})`)
                        }
                    })
                })
                const uniqueBillingContextsIds = new Set(receipts.map(receipt => receipt.context))
                const billingContexts = await find('BillingIntegrationOrganizationContext', {
                    id_in: Array.from(uniqueBillingContextsIds),
                })
                const supportedBillingIntegrations = get(acquiringIntegration, 'supportedBillingIntegrations', [])
                    .map(integration => integration.id)
                const uniqueBillingIntegrationsIds = new Set(billingContexts.map(context => context.integration))
                const unsupportedBillings = Array.from(uniqueBillingIntegrationsIds)
                    .filter(integration => !supportedBillingIntegrations.includes(integration))
                if (unsupportedBillings.length) {
                    throw new Error(`${REGISTER_MP_UNSUPPORTED_BILLING} (${unsupportedBillings.join(', ')})`)
                }

                const billingIntegrations = await find('BillingIntegration', {
                    id_in: Array.from(uniqueBillingIntegrationsIds),
                })

                const currencies = new Set(billingIntegrations.map(integration => integration.currencyCode))
                if (currencies.size > 1) {
                    throw new Error(REGISTER_MP_MULTIPLE_CURRENCIES)
                }
                const currencyCode = get(billingIntegrations, ['0', 'currencyCode'])

                // Stage 3 Generating payments
                const payments = []
                for (const group of groupedReceipts) {
                    const serviceConsumer = consumersByIds[group.consumerId]
                    const acquiringContext = acquiringContextsByIds[serviceConsumer.acquiringIntegrationContext]
                    for (const receiptId of group.receiptsIds) {
                        const receipt = receiptsByIds[receiptId]
                        const frozenReceipt = await freezeBillingReceipt(receipt)
                        const billingAccountNumber = get(frozenReceipt, ['data', 'account', 'number'])
                        const payment = await Payment.create(context, {
                            dv: 1,
                            sender,
                            amount: receipt.toPay,
                            currencyCode,
                            accountNumber: billingAccountNumber,
                            period: receipt.period,
                            receipt: { connect: { id: receiptId } },
                            frozenReceipt,
                            context: { connect: { id: acquiringContext.id } },
                            organization: { connect: { id: acquiringContext.organization } },
                        })
                        payments.push(payment)
                    }
                }

                const paymentIds = payments.map(payment => ({ id: payment.id }))
                const totalAmount = payments.reduce((acc, cur) => {
                    return acc.plus(cur.amount)
                }, Big('0.0'))
                const multiPayment = await MultiPayment.create(context, {
                    dv: 1,
                    sender,
                    amountWithoutExplicitFee: totalAmount.toString(),
                    currencyCode,
                    user: { connect: { id: context.authedItem.id } },
                    integration: { connect: { id: acquiringIntegration.id } },
                    payments: { connect: paymentIds },
                    // TODO(DOMA-1574): add correct category
                    serviceCategory: DEFAULT_MULTIPAYMENT_SERVICE_CATEGORY,
                })

                return {
                    dv: 1,
                    multiPaymentId: multiPayment.id,
                    webViewUrl: `${acquiringIntegration.hostUrl}${WEB_VIEW_PATH.replace('[id]', multiPayment.id)}`,
                    feeCalculationUrl: `${acquiringIntegration.hostUrl}${FEE_CALCULATION_PATH.replace('[id]', multiPayment.id)}`,
                }
            },
        },
    ],
    
})

module.exports = {
    RegisterMultiPaymentService,
}
