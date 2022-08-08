/**
 * Generated by `createschema ticket.TicketPropertyHintProperty 'organization:Relationship:Organization:CASCADE;ticketPropertyHint:Relationship:TicketPropertyHint:CASCADE; property:Relationship:Property:SET_NULL;'`
 */
const get = require('lodash/get')
const { getById } = require('@condo/keystone/schema')

const { throwAuthenticationError } = require('@condo/keystone/apolloErrorFormatter')
const { queryOrganizationEmployeeFor, queryOrganizationEmployeeFromRelatedOrganizationFor, checkPermissionInUserOrganizationOrRelatedOrganization } = require('@condo/domains/organization/utils/accessSchema')

async function canReadTicketPropertyHintProperties ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return {}

    return {
        organization: {
            OR: [
                queryOrganizationEmployeeFor(user.id),
                queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
            ],
        },
    }
}

async function canManageTicketPropertyHintProperties ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    let organizationId

    if (operation === 'create') {
        const ticketPropertyHintId = get(originalInput, ['ticketPropertyHint', 'connect', 'id'])
        const ticketPropertyHint = await getById('TicketPropertyHint', ticketPropertyHintId)

        organizationId = get(ticketPropertyHint, 'organization', null)
    } else if (operation === 'update') {
        if (!itemId) return false

        const ticketPropertyHintProperty = await getById('TicketPropertyHintProperty', itemId)

        organizationId = get(ticketPropertyHintProperty, 'organization', null)
    }

    return await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageTicketPropertyHints')
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTicketPropertyHintProperties,
    canManageTicketPropertyHintProperties,
}
