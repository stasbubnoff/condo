/**
 * Generated by `createschema acquiring.MultiPayment 'amount:Decimal; commission?:Decimal; time:DateTimeUtc; cardNumber:Text; serviceCategory:Text;'`
 */

const { checkAcquiringIntegrationAccessRight } = require(
    '../utils/accessSchema')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { RESIDENT } = require('@condo/domains/user/constants/common')


async function canReadMultiPayments ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return {}
    const userId = user.id
    // Resident user can get only it's own MultiPayments
    if (user.type === RESIDENT) {
        return {
            user: { id: userId },
        }
    }
    // Acquiring integration account can get only MultiPayments linked to this integration
    return {
        integration: { accessRights_some: { user: { id: userId } } },
    }
}

async function canManageMultiPayments ({ authentication: { item: user }, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true
    // Can be created only through custom mutation or by admin, can be modified by acquiring integration account
    if (operation === 'create') {
        return false
    } else if (operation === 'update') {
        if (!itemId) return false
        // Acquiring integration account can update only it's own multipayment
        return { integration: { accessRights_some: { user: { id: user.id } } } }
    }
    return false
}

async function canReadSensitiveData({ authentication: { item: user }, existingItem }) {
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true
    if (await checkAcquiringIntegrationAccessRight(user, existingItem.integration)) return true
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadMultiPayments,
    canManageMultiPayments,
    canReadSensitiveData,
}
