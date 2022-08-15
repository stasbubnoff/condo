/**
 * Generated by `createschema user.User 'name:Text;isAdmin:Checkbox;email:Text;password:Password;'`
 */

const { Text, Checkbox, Password } = require('@keystonejs/fields')
const { GQLListSchema } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@condo/keystone/plugins')
const { dvAndSender } = require('@address-service/domains/common/schema/plugins/dvAndSender')
const access = require('@address-service/domains/user/access/User')


const User = new GQLListSchema('User', {
    // TODO(codegen): write doc for the User domain model!
    schemaDoc: 'TODO DOC!',
    fields: {

        name: {
            // TODO(codegen): write doc for User.name field!
            schemaDoc: 'TODO DOC!',
            type: Text,
            isRequired: true,
        },

        isAdmin: {
            // TODO(codegen): write doc for User.isAdmin field!
            schemaDoc: 'TODO DOC!',
            type: Checkbox,
            isRequired: true,
        },

        email: {
            // TODO(codegen): write doc for User.email field!
            schemaDoc: 'TODO DOC!',
            type: Text,
            isRequired: true,
        },

        password: {
            // TODO(codegen): write doc for User.password field!
            schemaDoc: 'TODO DOC!',
            type: Password,
            isRequired: true,
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadUsers,
        create: access.canManageUsers,
        update: access.canManageUsers,
        delete: false,
        auth: true,
    },
})

module.exports = {
    User,
}
