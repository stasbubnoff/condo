/**
 * Generated by `createschema ticket.TicketPropertyHint 'organization:Relationship:Organization:CASCADE; name?:Text; content:Text;'`
 */

const { Text } = require('@keystonejs/fields')

const { GQLListSchema, find } = require('@open-condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const access = require('@condo/domains/ticket/access/TicketPropertyHint')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const { sanitizeXss } = require('@condo/domains/common/utils/xss')
const { TicketPropertyHintProperty } = require('@condo/domains/ticket/utils/serverSchema')

const TicketPropertyHint = new GQLListSchema('TicketPropertyHint', {
    schemaDoc: 'Textual information in free format related to a property or group of properties, ' +
        'for example list of responsible for property, organization number for clients',
    fields: {

        organization: ORGANIZATION_OWNED_FIELD,

        name: {
            schemaDoc: 'Hint name',
            type: Text,
        },

        content: {
            schemaDoc: 'Textual content of help in HTML format',
            type: Text,
            isRequired: true,
            hooks: {
                resolveInput: ({ resolvedData, fieldPath }) => {
                    return sanitizeXss(resolvedData[fieldPath])
                },
            },
        },
    },
    hooks: {
        afterChange: async ({ context, operation, existingItem, updatedItem }) => {
            const isSoftDeleteOperation = operation === 'update' && !existingItem.deletedAt && Boolean(updatedItem.deletedAt)

            if (isSoftDeleteOperation) {
                const now = new Date().toISOString()
                const { dv, sender } = updatedItem
                // soft delete all TicketPropertyHintProperty objects
                const ticketPropertyHintProperties = await find('TicketPropertyHintProperty', {
                    ticketPropertyHint: { id: updatedItem.id },
                    deletedAt: null,
                })

                for (const ticketPropertyHintProperty of ticketPropertyHintProperties) {
                    await TicketPropertyHintProperty.update(context, ticketPropertyHintProperty.id, {
                        deletedAt: now,
                        dv, sender,
                    })
                }
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadTicketPropertyHints,
        create: access.canManageTicketPropertyHints,
        update: access.canManageTicketPropertyHints,
        delete: false,
        auth: true,
    },
})

module.exports = {
    TicketPropertyHint,
}
