/**
 * Generated by `createschema meter.MeterResource 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')

const { generateServerUtils, execGqlWithoutAccess } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')

const { generateGQLTestUtils, throwIfError } = require('@condo/domains/common/utils/codegeneration/generate.test.utils')

const { MeterResource: MeterResourceGQL } = require('@condo/domains/meter/gql')
const { Meter: MeterGQL } = require('@condo/domains/meter/gql')
const { MeterReading: MeterReadingGQL } = require('@condo/domains/meter/gql')
const { MeterReadingSource: MeterReadingSourceGQL } = require('@condo/domains/meter/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const MeterResource = generateGQLTestUtils(MeterResourceGQL)
const Meter = generateGQLTestUtils(MeterGQL)
const MeterReading = generateGQLTestUtils(MeterReadingGQL)
const MeterReadingSource = generateGQLTestUtils(MeterReadingSourceGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestMeterResource (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestMeterResource logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await MeterResource.create(client, attrs)
    return [obj, attrs]
}

async function updateTestMeterResource (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestMeterResource logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await MeterResource.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestMeter (client, property, resource, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!property || !property.id) throw new Error('no property.id')
    if (!resource || !resource.id) throw new Error('no resource.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestMeter logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        property: { connect: { id: property.id } },
        resource: { connect: { id: resource.id } },
        ...extraAttrs,
    }
    const obj = await Meter.create(client, attrs)
    return [obj, attrs]
}

async function updateTestMeter (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestMeter logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await Meter.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestMeterReading (client, account, billingAccountMeter, meter, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!account || !account.id) throw new Error('no account.id')
    if (!billingAccountMeter || !billingAccountMeter.id) throw new Error('no billingAccountMeter.id')
    if (!meter || !meter.id) throw new Error('no meter.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestMeterReading logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        account: { connect: { id: account.id } },
        billingAccountMeter: { connect: { id: billingAccountMeter.id } },
        meter: { connect: { id: meter.id } },
        ...extraAttrs,
    }
    const obj = await MeterReading.create(client, attrs)
    return [obj, attrs]
}

async function updateTestMeterReading (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestMeterReading logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await MeterReading.update(client, id, attrs)
    return [obj, attrs]
}


async function createTestMeterReadingSource (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestMeterReadingSource logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        organization: { connect: { id: organization.id } },
        ...extraAttrs,
    }
    const obj = await MeterReadingSource.create(client, attrs)
    return [obj, attrs]
}

async function updateTestMeterReadingSource (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestMeterReadingSource logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await MeterReadingSource.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    MeterResource, createTestMeterResource, updateTestMeterResource,
    Meter, createTestMeter, updateTestMeter,
    MeterReading, createTestMeterReading, updateTestMeterReading,
    MeterReadingSource, createTestMeterReadingSource, updateTestMeterReadingSource,
/* AUTOGENERATE MARKER <EXPORTS> */
}
