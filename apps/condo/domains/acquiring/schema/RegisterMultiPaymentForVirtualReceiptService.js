/**
 * Generated by `createservice acquiring.RegisterMultiPaymentForVirtualReceiptService`
 */
const { get, isNil } = require('lodash')
const Big = require('big.js')

const { getById, GQLCustomSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/acquiring/access/RegisterMultiPaymentForVirtualReceiptService')
const { DEFAULT_MULTIPAYMENT_SERVICE_CATEGORY } = require('@condo/domains/acquiring/constants/payment')
const {
    FEE_CALCULATION_PATH,
    WEB_VIEW_PATH,
    DIRECT_PAYMENT_PATH,
    ANONYMOUS_PAYMENT_PATH,
} = require('@condo/domains/acquiring/constants/links')
const { ISO_CODES } = require('@condo/domains/common/constants/currencies')
const { Payment, MultiPayment, AcquiringIntegration } = require('@condo/domains/acquiring/utils/serverSchema')
const {
    getAcquiringIntegrationContextFormula,
    FeeDistribution,
} = require('@condo/domains/acquiring/utils/serverSchema/feeDistribution')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { DV_VERSION_MISMATCH, WRONG_FORMAT } = require('@condo/domains/common/constants/errors')
const { checkDvAndSender } = require('@open-condo/keystone/plugins/dvAndSender')

const {
    RECEIPTS_HAVE_NEGATIVE_TO_PAY_VALUE,
    RECEIPT_HAVE_INVALID_TO_PAY_VALUE,
    RECEIPT_HAVE_INVALID_CURRENCY_CODE_VALUE,
    ACQUIRING_INTEGRATION_IS_DELETED,
    ACQUIRING_INTEGRATION_CONTEXT_IS_DELETED,
} = require('../constants/errors')

/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const errors = {
    DV_VERSION_MISMATCH: {
        mutation: 'registerMultiPaymentForVirtualReceipt',
        variable: ['data', 'dv'],
        code: BAD_USER_INPUT,
        type: DV_VERSION_MISMATCH,
        message: 'Wrong value for data version number',
    },
    WRONG_SENDER_FORMAT: {
        mutation: 'registerMultiPaymentForVirtualReceipt',
        variable: ['data', 'sender'],
        code: BAD_USER_INPUT,
        type: WRONG_FORMAT,
        message: 'Invalid format of "sender" field value. {details}',
        correctExample: '{ dv: 1, fingerprint: \'example-fingerprint-alphanumeric-value\'}',
    },
    ACQUIRING_INTEGRATION_CONTEXT_IS_DELETED: {
        mutation: 'registerMultiPaymentForVirtualReceipt',
        variable: ['data', 'acquiringIntegrationContext', 'id'],
        code: BAD_USER_INPUT,
        type: ACQUIRING_INTEGRATION_CONTEXT_IS_DELETED,
        message: 'Cannot pay via deleted acquiring integration context',
    },
    ACQUIRING_INTEGRATION_IS_DELETED: {
        mutation: 'registerMultiPaymentForVirtualReceipt',
        variable: ['data', 'acquiringIntegrationContext', 'id'],
        code: BAD_USER_INPUT,
        type: ACQUIRING_INTEGRATION_IS_DELETED,
        message: 'Cannot pay via deleted acquiring integration with id "{id}"',
    },
    RECEIPT_HAVE_INVALID_TO_PAY_VALUE: {
        mutation: 'registerMultiPaymentForVirtualReceipt',
        code: BAD_USER_INPUT,
        type: RECEIPT_HAVE_INVALID_TO_PAY_VALUE,
        message: 'Cannot pay for Receipt with invalid "toPay" value',
    },
    RECEIPT_HAVE_NEGATIVE_TO_PAY_VALUE: {
        mutation: 'registerMultiPaymentForVirtualReceipt',
        code: BAD_USER_INPUT,
        type: RECEIPTS_HAVE_NEGATIVE_TO_PAY_VALUE,
        message: 'Cannot pay for Receipt with negative "toPay" value',
    },
    RECEIPT_HAVE_INVALID_CURRENCY_CODE_VALUE: {
        mutation: 'registerMultiPaymentForVirtualReceipt',
        code: BAD_USER_INPUT,
        type: RECEIPT_HAVE_INVALID_CURRENCY_CODE_VALUE,
        message: 'Cannot pay for Receipt with invalid "currencyCode" value',
    },
}

const RegisterMultiPaymentForVirtualReceiptService = new GQLCustomSchema('RegisterMultiPaymentForVirtualReceiptService', {
    types: [
        {
            access: true,
            type: 'input RegisterMultiPaymentVirtualReceiptRecipientInput { routingNumber: String!, bankAccount: String!, accountNumber: String! }',
        },
        {
            access: true,
            type: 'input RegisterMultiPaymentVirtualReceiptInput { currencyCode: String!, amount: String!, period: String!, recipient: RegisterMultiPaymentVirtualReceiptRecipientInput! }',
        },
        {
            access: true,
            type: 'input RegisterMultiPaymentForVirtualReceiptInput { dv: Int!, sender: SenderFieldInput!, receipt: RegisterMultiPaymentVirtualReceiptInput!, acquiringIntegrationContext: AcquiringIntegrationContextWhereUniqueInput! }',
        },
        {
            access: true,
            type: 'type RegisterMultiPaymentForVirtualReceiptOutput { dv: Int!, multiPaymentId: String!, webViewUrl: String!, feeCalculationUrl: String!, directPaymentUrl: String!, anonymousPaymentUrl: String! }',
        },
    ],

    mutations: [
        {
            access: access.canRegisterMultiPaymentForOneReceipt,
            schema: 'registerMultiPaymentForVirtualReceipt(data: RegisterMultiPaymentForVirtualReceiptInput!): RegisterMultiPaymentForOneReceiptOutput',
            resolver: async (parent, args, context) => {
                // wrap validator function to the current call context
                const { data } = args
                const {
                    sender,
                    receipt,
                    acquiringIntegrationContext,
                } = data

                // Stage 0. Check if input is valid
                checkDvAndSender(data, errors.DV_VERSION_MISMATCH, errors.WRONG_SENDER_FORMAT, context)

                // Stage 1: get acquiring context & integration
                const acquiringContext = await getById('AcquiringIntegrationContext', acquiringIntegrationContext.id)

                if (acquiringContext.deletedAt) {
                    throw new GQLError(errors.ACQUIRING_INTEGRATION_CONTEXT_IS_DELETED, context)
                }

                const acquiringIntegration = await AcquiringIntegration.getOne(context, {
                    id: acquiringContext.integration,
                })

                if (acquiringIntegration.deletedAt) {
                    throw new GQLError({
                        ...errors.ACQUIRING_INTEGRATION_IS_DELETED,
                        messageInterpolation: { id: acquiringContext.integration },
                    }, context)
                }

                // Stage 2. Check VirtualReceipt
                const { currencyCode, amount, period, recipient: { routingNumber: bic, bankAccount, accountNumber } } = receipt

                if (!ISO_CODES.includes(currencyCode)) {
                    throw new GQLError({
                        ...errors.RECEIPT_HAVE_INVALID_CURRENCY_CODE_VALUE,
                    }, context)
                }

                // amount is not a number
                if (isNaN(amount)) {
                    throw new GQLError({
                        ...errors.RECEIPT_HAVE_INVALID_TO_PAY_VALUE,
                    }, context)
                }

                // negative to pay value
                if (Big(amount).lte(0)) {
                    throw new GQLError({
                        ...errors.RECEIPT_HAVE_NEGATIVE_TO_PAY_VALUE,
                    }, context)
                }

                // Stage 3 Generating payments
                const formula = await getAcquiringIntegrationContextFormula(context, acquiringIntegrationContext.id)
                const feeCalculator = new FeeDistribution(formula)
                const {
                    type,
                    explicitFee = '0',
                    implicitFee = '0',
                    fromReceiptAmountFee = '0',
                } = feeCalculator.calculate(amount)
                const explicitFees = type === 'service' ? {
                    explicitServiceCharge: String(explicitFee),
                    explicitFee: '0',
                } : {
                    explicitServiceCharge: '0',
                    explicitFee: String(explicitFee),
                }
                const paymentCommissionFields = {
                    ...explicitFees,
                    implicitFee: String(implicitFee),
                    serviceFee: String(fromReceiptAmountFee),
                }
                const paymentModel = await Payment.create(context, {
                    dv: 1,
                    sender,
                    amount,
                    currencyCode,
                    accountNumber,
                    period,
                    context: { connect: { id: acquiringContext.id } },
                    organization: { connect: { id: acquiringContext.organization } },
                    recipientBic: bic,
                    recipientBankAccount: bankAccount,
                    ...paymentCommissionFields,
                })
                const payment = { ...paymentModel, serviceFee: paymentCommissionFields.serviceFee }

                const totalAmount = {
                    amountWithoutExplicitFee: Big(payment.amount),
                    explicitFee: Big(payment.explicitFee),
                    explicitServiceCharge: Big(payment.explicitServiceCharge),
                    serviceFee: Big(payment.serviceFee),
                    implicitFee: Big(payment.implicitFee),
                }

                const authedItemId = get(context, 'authedItem.id')
                const multiPayment = await MultiPayment.create(context, {
                    dv: 1,
                    sender,
                    ...Object.fromEntries(Object.entries(totalAmount).map(([key, value]) => ([key, value.toFixed(2)]))),
                    currencyCode,
                    ...isNil(authedItemId) ? {} : { user: { connect: { id: authedItemId } } },
                    integration: { connect: { id: acquiringIntegration.id } },
                    payments: { connect: [{ id: payment.id }] },
                    // TODO(DOMA-1574): add correct category
                    serviceCategory: DEFAULT_MULTIPAYMENT_SERVICE_CATEGORY,
                })
                return {
                    dv: 1,
                    multiPaymentId: multiPayment.id,
                    webViewUrl: `${acquiringIntegration.hostUrl}${WEB_VIEW_PATH.replace('[id]', multiPayment.id)}`,
                    feeCalculationUrl: `${acquiringIntegration.hostUrl}${FEE_CALCULATION_PATH.replace('[id]', multiPayment.id)}`,
                    directPaymentUrl: `${acquiringIntegration.hostUrl}${DIRECT_PAYMENT_PATH.replace('[id]', multiPayment.id)}`,
                    anonymousPaymentUrl: `${acquiringIntegration.hostUrl}${ANONYMOUS_PAYMENT_PATH.replace('[id]', multiPayment.id)}`,
                }
            },
        },
    ],

})

module.exports = {
    RegisterMultiPaymentForVirtualReceiptService,
}
