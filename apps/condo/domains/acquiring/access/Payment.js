/**
 * Generated by `createschema acquiring.Payment 'amount:Decimal; currencyCode:Text; time:DateTimeUtc; accountNumber:Text; purpose?:Text; receipts:Relationship:BillingReceipt:PROTECT; multiPayment:Relationship:MultiPayment:PROTECT; context:Relationship:AcquiringIntegrationContext:PROTECT;' --force`
 */
const { find } = require('@open-condo/keystone/schema')
const { RESIDENT } = require('@condo/domains/user/constants/common')
const { checkOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')
const { checkAcquiringIntegrationAccessRight } = require('../utils/accessSchema')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const get = require('lodash/get')

async function canReadPayments ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}

    if (user.type === RESIDENT) {
        return { multiPayment: { user: { id: user.id } } }
    }

    return {
        OR: [
            // Acquiring integration account can see it's payments
            { context: { integration: { accessRights_some: { user: { id: user.id }, deletedAt: null } } } },
            // Employee with `canReadPayments` can see theirs organization payments
            { organization: { employees_some: { user: { id: user.id }, role: { canReadPayments: true }, deletedAt: null, isBlocked: false } } },
        ],
    }
}

async function canManagePayments ({ authentication: { item: user }, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin) return true
    // Nobody can create Payments manually
    if (operation === 'create') return false
    // Acquiring integration can update it's own Payments
    if (operation === 'update' && itemId) {
        return { context: { integration: { accessRights_some: { user: { id: user.id }, deletedAt: null } } } }
    }
    return false
}

async function canReadPaymentsSensitiveData ({ authentication: { item: user }, existingItem }) {
    if (!user || user.deletedAt) return false
    if (user.isSupport || user.isAdmin) return true

    const [acquiringContext] = await find('AcquiringIntegrationContext', {
        id: existingItem.context,
    })
    // If context exist => check is it's integration account
    if (acquiringContext) {
        const integrationId = get(acquiringContext, ['integration'])
        if (await checkAcquiringIntegrationAccessRight(user.id, integrationId)) return true
    }

    // Otherwise check if it's employee or not
    return !!(await checkOrganizationPermission(user.id, existingItem.organization, 'canReadPayments'))
}


/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadPayments,
    canManagePayments,
    canReadPaymentsSensitiveData,
}
