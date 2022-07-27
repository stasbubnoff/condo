/**
 * Generated by `createschema onboarding.OnBoarding 'completed:Checkbox; stepsTransitions:Json;'`
 */

const { Relationship, Checkbox, Select } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const access = require('@condo/domains/onboarding/access/OnBoarding')
const { dvAndSender } = require('../../common/schema/plugins/dvAndSender')

const OnBoarding = new GQLListSchema('OnBoarding', {
    schemaDoc: 'User action guide. It should be used to build complex hierarchical systems of user actions.',
    fields: {
        completed: {
            schemaDoc: `Primary Attribute of user guide what we need to watch for. 
                Indicates the status and detect the full completeness of guide.`,
            type: Checkbox,
            defaultValue: false,
        },

        stepsTransitions: {
            schemaDoc: `Graph of possible transitions for steps. If there is no transition in this graph, 
                it is impossible to move forward or backward of guide.`,
            type: Json,
            isRequired: true,
        },

        user: {
            schemaDoc: 'User onBoarding relates to.',
            type: Relationship,
            ref: 'User',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        type: {
            schemaDoc: 'Type of onBoarding. Used for guid classification',
            type: Select,
            options: 'ADMINISTRATOR', // Add more types
            defaultValue: 'member',
            isRequired: true,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadOnBoardings,
        create: access.canManageOnBoardings,
        update: access.canManageOnBoardings,
        delete: false,
        auth: true,
    },
})

module.exports = {
    OnBoarding,
}
