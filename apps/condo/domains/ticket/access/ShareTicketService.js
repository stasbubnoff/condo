const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { checkPermissionInUserOrganizationOrRelatedOrganization } = require('@condo/domains/organization/utils/accessSchema')
const { getByCondition } = require('@open-condo/keystone/schema')

async function canShareTicket ({ args: { data }, authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    const ticket = await getByCondition('Ticket', { id: data.ticketId, deletedAt: null })

    return await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, ticket.organization, 'canShareTickets')
}

module.exports = {
    canShareTicket,
}
