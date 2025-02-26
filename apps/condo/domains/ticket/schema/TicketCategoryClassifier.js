/**
 * Generated by `createschema ticket.TicketCategoryClassifier 'organization?:Relationship:Organization:CASCADE;name:Text;'`
 */

const { Text } = require('@keystonejs/fields')
const { GQLListSchema } = require('@open-condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { COMMON_AND_ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const access = require('@condo/domains/ticket/access/TicketCategoryClassifier')

const TicketCategoryClassifier = new GQLListSchema('TicketCategoryClassifier', {
    schemaDoc: 'Describes what type of work needs to be done to fix incident',
    fields: {
        organization: COMMON_AND_ORGANIZATION_OWNED_FIELD,
        name: {
            schemaDoc: 'text description',
            type: Text,
            isRequired: true,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadTicketCategoryClassifiers,
        create: access.canManageTicketCategoryClassifiers,
        update: access.canManageTicketCategoryClassifiers,
        delete: false,
        auth: true,
    },
})

module.exports = {
    TicketCategoryClassifier,
}
