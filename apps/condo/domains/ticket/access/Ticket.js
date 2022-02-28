/**
 * Generated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; classifier:Relationship:TicketClassifier:PROTECT; details:Text; meta?:Json;`
 */

const get = require('lodash/get')
const uniq = require('lodash/uniq')
const compact = require('lodash/compact')
const flatten = require('lodash/flatten')
const omit = require('lodash/omit')
const isEmpty = require('lodash/isEmpty')
const { queryOrganizationEmployeeFromRelatedOrganizationFor } = require('@condo/domains/organization/utils/accessSchema')
const { queryOrganizationEmployeeFor } = require('@condo/domains/organization/utils/accessSchema')
const { checkPermissionInUserOrganizationOrRelatedOrganization } = require('@condo/domains/organization/utils/accessSchema')
const { getById, find } = require('@core/keystone/schema')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { RESIDENT, STAFF } = require('@condo/domains/user/constants/common')
const { OrganizationEmployee } = require('@condo/domains/organization/utils/serverSchema')
const { Division } = require('@condo/domains/division/utils/serverSchema')

async function canReadTickets ({ authentication: { item: user }, context }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}

    if (user.type === RESIDENT) {
        const residents = await find('Resident', { user: { id: user.id }, deletedAt: null })

        if (isEmpty(residents)) return false

        const organizationsIds = compact(residents.map(resident => get(resident, 'organization')))
        const residentAddressOrStatement = residents.map(resident =>
            ({ AND: [{ canReadByResident: true, contact: { phone: user.phone } }, { property: { id: resident.property } }, { unitName: resident.unitName }] }))

        return {
            organization: {
                id_in: uniq(organizationsIds),
                deletedAt: null,
            },
            OR: [
                { createdBy: { id: user.id } },
                ...residentAddressOrStatement,
            ],
        }
    }

    const divisionVisibleLimitedEmployees = await OrganizationEmployee.getAll(context, {
        user: { id: user.id },
        role: { isDivisionLimitedVisibility: true },
        deletedAt: null,
        isBlocked: false,
    })

    if (divisionVisibleLimitedEmployees.length > 0) {
        const organizationsIdsWithEmployeeInDivision = divisionVisibleLimitedEmployees.map(employee => employee.organization.id)
        const divisionVisibleLimitedEmployeesIds = divisionVisibleLimitedEmployees.map(employee => employee.id)
        const employeeDivisions = await Division.getAll(context, {
            OR: [
                { responsible: { id_in: divisionVisibleLimitedEmployeesIds } },
                { executors_some: { id_in: divisionVisibleLimitedEmployeesIds } },
            ],
        })
        const divisionsPropertiesIds = uniq(flatten(employeeDivisions.map(division => division.properties))
            .map(property => property.id))

        return {
            OR: [
                {
                    AND: [
                        {
                            organization: {
                                id_not_in: organizationsIdsWithEmployeeInDivision,
                                OR: [
                                    queryOrganizationEmployeeFor(user.id),
                                    queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
                                ],
                                deletedAt: null,
                            },
                        },
                    ],
                },
                {
                    AND: [
                        {
                            organization: { id_in: organizationsIdsWithEmployeeInDivision },
                            OR: [
                                { property: { id_in: divisionsPropertiesIds } },
                                { executor: { id_in: divisionVisibleLimitedEmployeesIds } },
                                { assignee: { id_in: divisionVisibleLimitedEmployeesIds } },
                            ],
                            deletedAt: null,
                        },
                    ],
                },
            ],
        }
    }

    return {
        organization: {
            OR: [
                queryOrganizationEmployeeFor(user.id),
                queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
            ],
            deletedAt: null,
        },
    }
}

async function canManageTickets ({ authentication: { item: user }, operation, itemId, originalInput }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    if (user.type === RESIDENT) {
        let unitName, propertyId

        if (operation === 'create') {
            unitName = get(originalInput, 'unitName', null)
            propertyId = get(originalInput, ['property', 'connect', 'id'])
        } else if (operation === 'update') {
            if (!itemId) return false

            const inaccessibleUpdatedFields = omit(originalInput, ['dv', 'sender', 'details'])
            if (!isEmpty(inaccessibleUpdatedFields)) return false

            const ticket = await getById('Ticket', itemId)
            if (!ticket) return false
            if (ticket.createdBy !== user.id) return false
            propertyId = get(ticket, 'property', null)
            unitName = get(ticket, 'unitName', null)
        }

        if (!unitName || !propertyId) return false

        const residents = await find('Resident', {
            user: { id: user.id },
            property: { id: propertyId, deletedAt: null },
            unitName,
            deletedAt: null,
        })

        return residents.length > 0
    }
    if (user.type === STAFF) {
        let organizationId

        if (operation === 'create') {
            organizationId = get(originalInput, ['organization', 'connect', 'id'])
        } else if (operation === 'update') {
            if (!itemId) return false
            const ticket = await getById('Ticket', itemId)
            organizationId = get(ticket, 'organization', null)
        }

        const permission = await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageTickets')
        if (!permission) return false

        const propertyId = get(originalInput, ['property', 'connect', 'id'], null)
        if (propertyId) {
            const property = await getById('Property', propertyId)
            if (!property) return false

            return organizationId === get(property, 'organization')
        }

        return true
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTickets,
    canManageTickets,
}
