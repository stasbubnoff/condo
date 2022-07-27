/**
 * Generated by `createschema onboarding.OnBoardingStep 'icon:Text; title:Text; description:Text; action:Select:create,read,update,delete; entity:Text; onBoarding:Relationship:OnBoarding:SET_NULL;'`
 */

const { Text, Relationship, Select, Checkbox, Integer } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { LocalizedText } = require('@core/keystone/fields')
const access = require('@condo/domains/onboarding/access/OnBoardingStep')
const { dvAndSender } = require('../../common/schema/plugins/dvAndSender')

const OnBoardingStep = new GQLListSchema('OnBoardingStep', {
    schemaDoc: 'Logic part of user app guide.',
    fields: {

        icon: {
            schemaDoc: 'Icon string definition of step.',
            type: Text,
            isRequired: true,
        },

        order: {
            schemaDoc: 'Step order in view maps, should be used as priority indicator.',
            type: Integer,
        },

        title: {
            schemaDoc: 'Shows the main point of a step.',
            type: LocalizedText,
            template: 'onboarding.step.title.*',
            isRequired: true,
        },

        description: {
            schemaDoc: 'Shows additional point of a step',
            type: LocalizedText,
            template: 'onboarding.step.description.*',
            isRequired: true,
        },

        required: {
            schemaDoc: 'Used for step transition logic calculation, if the value of this flag is true movement towards graph will be blocked.',
            type: Checkbox,
        },

        completed: {
            schemaDoc: 'Detect completness of the current step. If all steps in onBoarding will be completed, onBoarding completed state should be set to true.',
            type: Checkbox,
            defaultValue: false,
        },

        action: {
            schemaDoc: 'Detect step target action. Action should be used for validation step completness.',
            type: Select,
            options: 'create,read,update,delete',
            isRequired: true,
        },

        entity: {
            schemaDoc: 'Domain entity on which is performed to',
            type: Text,
            isRequired: true,
        },

        onBoarding: {
            type: Relationship,
            ref: 'OnBoarding',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadOnBoardingSteps,
        create: access.canManageOnBoardingSteps,
        update: access.canManageOnBoardingSteps,
        delete: false,
        auth: true,
    },
})

module.exports = {
    OnBoardingStep,
}
