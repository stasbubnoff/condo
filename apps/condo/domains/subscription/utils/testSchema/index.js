/**
 * Generated by `createschema subscription.ServiceSubscription 'type:Select:default,sbbol; isTrial:Checkbox; organization:Relationship:Organization:CASCADE; startAt:DateTimeUtc; finishAt:DateTimeUtc;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')

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
    const isTrial = true
    const startAt = dayjs()
    const finishAt = dayjs().add(15, 'days')

    const attrs = {
        dv: 1,
        sender,
        type,
        isTrial,
        startAt,
        finishAt,
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

async function expectOverlappingFor (client, organization, interval) {
    await catchErrorFrom(async () => {
        await createTestServiceSubscription(client, organization, interval)
    }, ({ errors, data }) => {
        expect(errors[0].data.messages[0]).toMatch('[overlapping]')
        expect(data).toEqual({ 'obj': null })
    })
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    ServiceSubscription, createTestServiceSubscription, updateTestServiceSubscription, expectOverlappingFor,
/* AUTOGENERATE MARKER <EXPORTS> */
}
