/**
 * Generated by `createschema miniapp.B2CAppAccessRight 'user:Relationship:User:PROTECT; app:Relationship:B2CApp:PROTECT;'`
 */

const { Relationship } = require('@keystonejs/fields')
const { GQLListSchema } = require('@open-condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const access = require('@condo/domains/miniapp/access/B2CAppAccessRight')
const { SERVICE_USER_FIELD } = require('@condo/domains/miniapp/schema/fields/accessRight')


const B2CAppAccessRight = new GQLListSchema('B2CAppAccessRight', {
    schemaDoc: 'Link between service user and B2C App. The existence of this connection means that this user has the rights to perform actions on behalf of the integration and modify some B2CApp-related models',
    fields: {
        user: SERVICE_USER_FIELD,
        app: {
            schemaDoc: 'Link to B2BApp.accessRights',
            type: Relationship,
            ref: 'B2CApp.accessRights',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadB2CAppAccessRights,
        create: access.canManageB2CAppAccessRights,
        update: access.canManageB2CAppAccessRights,
        delete: false,
        auth: true,
    },
})

module.exports = {
    B2CAppAccessRight,
}
