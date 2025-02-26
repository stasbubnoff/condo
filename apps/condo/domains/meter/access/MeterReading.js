/**
 * Generated by `createschema meter.MeterReading 'organization:Relationship:Organization:CASCADE; property:Relationship:Property:CASCADE; account?:Relationship:BillingAccount:SET_NULL; billingAccountMeter?:Relationship:BillingAccountMeter:SET_NULL; date:DateTimeUtc; meter:Relationship:Meter:CASCADE; value:Integer; source:Relationship:MeterReadingSource:PROTECT'`
 */
const { getAvailableResidentMeters } = require('../utils/serverSchema')
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { RESIDENT } = require('@condo/domains/user/constants/common')
const {
    queryOrganizationEmployeeFromRelatedOrganizationFor,
    queryOrganizationEmployeeFor,
    checkPermissionInUserOrganizationOrRelatedOrganization,
} = require('@condo/domains/organization/utils/accessSchema')
const { get } = require('lodash')
const { getUserDivisionsInfo } = require('@condo/domains/division/utils/serverSchema')
const { getById } = require('@open-condo/keystone/schema')

async function canReadMeterReadings ({ authentication: { item: user }, context }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    
    if (user.isSupport || user.isAdmin) return {}

    if (user.type === RESIDENT) {
        const availableMeters = await getAvailableResidentMeters(user.id)
        const availableMeterIds = availableMeters.map((meter) => meter.id)

        return {
            meter: { id_in: availableMeterIds, deletedAt: null },
            deletedAt: null,
        }
    }

    const userDivisionsInfo = await getUserDivisionsInfo(context, user.id)

    if (userDivisionsInfo) {
        const { organizationsIdsWithEmployeeInDivision, divisionsPropertiesIds } = userDivisionsInfo

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
                            },
                        },
                    ],
                },
                {
                    AND: [
                        {
                            organization: { id_in: organizationsIdsWithEmployeeInDivision },
                            meter: { property: { id_in: divisionsPropertiesIds } },
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
        },
    }
}

async function canManageMeterReadings ({ authentication: { item: user }, originalInput, operation }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    if (operation === 'create') {
        const meterId = get(originalInput, ['meter', 'connect', 'id'], null)
        if (!meterId) return false

        if (user.type === RESIDENT) {
            const availableMeters = await getAvailableResidentMeters(user.id)
            return availableMeters.some((meter) => meter.id === meterId && !meter.isAutomatic)
        }

        const meter = await getById('Meter', meterId)
        const meterOrganization = get(meter, 'organization', null)

        return await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, meterOrganization, 'canManageMeterReadings')
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadMeterReadings,
    canManageMeterReadings,
}
