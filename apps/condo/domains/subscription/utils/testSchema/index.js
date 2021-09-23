/**
 * Generated by `createschema subscription.ServiceSubscription 'type:Select:default,sbbol; isTrial:Checkbox; organization:Relationship:Organization:CASCADE; startAt:DateTimeUtc; finishAt:DateTimeUtc;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')
const { has } = require('lodash')

const { generateServerUtils, execGqlWithoutAccess } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')

const { generateGQLTestUtils, throwIfError } = require('@condo/domains/common/utils/codegeneration/generate.test.utils')

const { ServiceSubscription: ServiceSubscriptionGQL } = require('@condo/domains/subscription/gql')
const dayjs = require('dayjs')
const { catchErrorFrom } = require('@condo/domains/common/utils/testSchema')
/* AUTOGENERATE MARKER <IMPORT> */

const ServiceSubscription = generateGQLTestUtils(ServiceSubscriptionGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestServiceSubscription (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const type = 'default'
    const isTrial = false
    const startAt = dayjs()
    const finishAt = dayjs().add(15, 'days')
    const unitsCount = faker.datatype.number()
    const unitPrice = faker.datatype.float({ precision: 0.01 }).toString()
    const totalPrice = unitsCount * unitPrice
    const currency = 'RUB'

    const attrs = {
        dv: 1,
        sender,
        type,
        isTrial,
        startAt,
        finishAt,
        unitsCount,
        unitPrice: String(unitPrice),
        totalPrice: String(totalPrice),
        currency,
        organization: { connect: { id: organization.id } },
        ...extraAttrs,
    }
    const obj = await ServiceSubscription.create(client, attrs)
    return [obj, attrs]
}

async function updateTestServiceSubscription (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestServiceSubscription logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await ServiceSubscription.update(client, id, attrs)
    return [obj, attrs]
}

const expectOverlappingFor = async (action, ...args) => (
    await catchErrorFrom(async () => {
        await action(...args)
    }, ({ errors, data }) => {
        expect(errors[0].data.messages[0]).toMatch('[overlapping]')
        expect(data).toEqual({ 'obj': null })
    })
)

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    ServiceSubscription, createTestServiceSubscription, updateTestServiceSubscription, expectOverlappingFor,
/* AUTOGENERATE MARKER <EXPORTS> */
}
