/**
 * Generated by `createschema notification.MessageOrganizationBlackList 'organization?:Relationship:Organization:CASCADE; description:Text'`
 */

const { Text, Relationship, Select } = require('@keystonejs/fields')
const { GQLListSchema } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@condo/keystone/plugins')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')
const access = require('@condo/domains/notification/access/MessageOrganizationBlackList')
const { MESSAGE_TYPES } = require('@condo/domains/notification/constants/constants')

const MessageOrganizationBlackList = new GQLListSchema('MessageOrganizationBlackList', {
    schemaDoc: 'Rule for blocking specific type of messages for organization',
    fields: {
        organization: {
            schemaDoc: 'The organization we want to block from sending messages to (null - all organizations)',
            type: Relationship,
            ref: 'Organization',
            kmigratorOptions: { null: true, on_delete: 'models.CASCADE' },
        },

        type: {
            schemaDoc: 'The type of message we want to block',
            type: Select,
            options: MESSAGE_TYPES,
            dataType: 'string',
            isRequired: true,
        },

        description: {
            schemaDoc: 'The reason why the entry was added to the MessageOrganizationBlackList',
            type: Text,
            isRequired: true,
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['organization', 'type'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'message_organization_black_list_unique_organization_and_type',
            },
        ],
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadMessageOrganizationBlackLists,
        create: access.canManageMessageOrganizationBlackLists,
        update: access.canManageMessageOrganizationBlackLists,
        delete: false,
        auth: true,
    },
})

module.exports = {
    MessageOrganizationBlackList,
}
