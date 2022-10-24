/**
 * Generated by `createschema organization.OrganizationEmployeeRole 'organization:Relationship:Organization:CASCADE; name:Text; statusTransitions:Json; canManageOrganization:Checkbox; canManageEmployees:Checkbox; canManageRoles:Checkbox; canManageIntegrations:Checkbox; canManageProperties:Checkbox; canManageTickets:Checkbox;' --force`
 */
const { COUNTRY_RELATED_STATUS_TRANSITIONS } = require('@condo/domains/ticket/constants/statusTransitions')
const { Checkbox, Virtual } = require('@keystonejs/fields')
const { LocalizedText } = require('@condo/keystone/fields')
const { GQLListSchema } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, dvAndSender } = require('@condo/keystone/plugins')
const { Organization } = require('../utils/serverSchema')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const access = require('@condo/domains/organization/access/OrganizationEmployeeRole')
const get = require('lodash/get')

const OrganizationEmployeeRole = new GQLListSchema('OrganizationEmployeeRole', {
    schemaDoc: 'Employee role name and access permissions',
    fields: {
        organization: ORGANIZATION_OWNED_FIELD,

        // There is no `user` reference, because Organization will have a set of pre-defined roles
        // and each employee will be associated with one of the role, not role with user.

        name: {
            type: LocalizedText,
            isRequired: true,
            template: 'employee.role.*.name',
        },
        description: {
            type: LocalizedText,
            isRequired: false,
            template: 'employee.role.*.description',
        },
        statusTransitions: {
            schemaDoc: 'Employee status transitions map',
            type: Virtual,
            graphQLReturnType: 'JSON',
            resolver: async (item, _, context) => {
                const organizationId = get(item, 'organization')
                const [organization] = await Organization.getAll(context, { id: organizationId })

                if (!organization) {
                    throw new Error('No organization found for OrganizationEmployeeRole')
                }

                const organizationCountry = get(organization, 'country', 'en')
                return COUNTRY_RELATED_STATUS_TRANSITIONS[organizationCountry]
            },
        },

        canManageOrganization: { type: Checkbox, defaultValue: false },
        canManageEmployees: { type: Checkbox, defaultValue: false },
        canManageRoles: { type: Checkbox, defaultValue: false },
        canManageIntegrations: { type: Checkbox, defaultValue: false },
        canManageProperties: { type: Checkbox, defaultValue: false },
        canManageTickets: { type: Checkbox, defaultValue: false },
        canManageMeters: { type: Checkbox, defaultValue: true },
        canManageMeterReadings: { type: Checkbox, defaultValue: true },
        canManageContacts: { type: Checkbox, defaultValue: false },
        canManageContactRoles: { type: Checkbox, defaultValue: false },
        canManageTicketComments: { type: Checkbox, defaultValue: true },
        canManageDivisions: { type: Checkbox, defaultValue: false },
        canShareTickets: { type: Checkbox, defaultValue: true },
        canReadBillingReceipts: { type: Checkbox, defaultValue: false },
        canReadPayments: { type: Checkbox, defaultValue: false },
        canInviteNewOrganizationEmployees: { type: Checkbox, defaultValue: false },
        canBeAssignedAsResponsible: {
            schemaDoc: 'Allows employees with this role to be assigned to tickets as responsible',
            type: Checkbox,
            defaultValue: true,
        },
        canBeAssignedAsExecutor: {
            schemaDoc: 'Allows employees with this role to be assigned to tickets as executor',
            type: Checkbox,
            defaultValue: true,
        },
        canReadEntitiesOnlyInScopeOfDivision: {
            schemaDoc: 'Limits the visibility of entities (such as ticket or meter/meterReading) to division',
            type: Checkbox,
            defaultValue: false,
        },
        canManageTicketPropertyHints: {
            type: Checkbox,
            defaultValue: false,
        },
    },
    plugins: [uuided(), versioned(), tracked(), dvAndSender(), historical()],
    access: {
        read: access.canReadOrganizationEmployeeRoles,
        create: access.canManageOrganizationEmployeeRoles,
        update: access.canManageOrganizationEmployeeRoles,
        delete: false,
        auth: true,
    },
    escapeSearch: true,
})

module.exports = {
    OrganizationEmployeeRole,
}
