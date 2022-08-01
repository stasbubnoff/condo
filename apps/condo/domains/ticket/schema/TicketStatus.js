/**
 * Generated by `createschema ticket.TicketStatus 'organization?:Relationship:Organization:CASCADE; type:Select:neworreopened,processing,canceled,completed,deferred,closed; name:Text;' --force`
 */

const { Select, Virtual } = require('@keystonejs/fields')
const LocalizedText  = require('@core/keystone/fields/LocalizedText')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { COMMON_AND_ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const access = require('@condo/domains/ticket/access/TicketStatus')
const { TICKET_STATUS_TYPES } = require('../constants')
const { STATUS_SELECT_COLORS } = require('@condo/domains/ticket/constants/style')
const { JSON_SCHEMA_VALIDATION_ERROR } = require('@condo/domains/common/constants/errors')
const get = require('lodash/get')

const Ajv = require('ajv')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')

const validationSchema = {
    type: 'object',
    properties: {
        primary: { type: 'string' },
        secondary: { type: 'string' },
        additional: { type: 'string' },
    },
    required: ['primary', 'secondary', 'additional'],
    additionalProperties: false,
}

const ticketStatusColorsJsonValidator = new Ajv().compile(validationSchema)

const TicketStatus = new GQLListSchema('TicketStatus', {
    schemaDoc: 'Ticket status. We have a organization specific statuses',
    fields: {
        organization: COMMON_AND_ORGANIZATION_OWNED_FIELD,

        type: {
            schemaDoc: 'Ticket status. You should also increase `statusReopenedCounter` if you want to reopen ticket',
            type: Select,
            options: TICKET_STATUS_TYPES.join(','),
            isRequired: true,
        },
        name: {
            schemaDoc: 'Status name',
            type: LocalizedText,
            isRequired: true,
            template: 'ticket.status.*.name',
        },
        colors: {
            schemaDoc: 'Status colors, includes primary (font color), secondary (background color), additional (border color), all colors presented in HEX',
            type: Virtual,
            extendGraphQLTypes: ['type TicketStatusColorsField { primary: String, secondary: String, additional: String }'],
            graphQLReturnType: 'TicketStatusColorsField',
            graphQLReturnFragment: '{ primary secondary additional }',
            resolver: async (item) => {
                if (!get(item, 'type')) {
                    throw new Error('Error while trying to find ticket status color')
                }

                const statusColors = STATUS_SELECT_COLORS[item.type]

                if (!statusColors) {
                    throw new Error('Error while trying to find ticket status color: no ticketStatus colors found')
                }

                if (!ticketStatusColorsJsonValidator(statusColors)){
                    throw new Error(`${JSON_SCHEMA_VALIDATION_ERROR}] invalid json structure`)
                }

                return statusColors
            },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadTicketStatuses,
        create: access.canManageTicketStatuses,
        update: access.canManageTicketStatuses,
        delete: false,
        auth: true,
    },
    escapeSearch: true,
})

module.exports = {
    TicketStatus,
}
