/**
 * Generated by `createschema meter.MeterResource 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const faker = require('faker')
const { generateGQLTestUtils, throwIfError } = require('@open-condo/codegen/generate.test.utils')

const { MeterResource: MeterResourceGQL } = require('@condo/domains/meter/gql')
const { MeterReadingSource: MeterReadingSourceGQL } = require('@condo/domains/meter/gql')
const { Meter: MeterGQL } = require('@condo/domains/meter/gql')
const { MeterReading: MeterReadingGQL } = require('@condo/domains/meter/gql')
const { EXPORT_METER_READINGS_QUERY } = require('@condo/domains/meter/gql')
const { MeterReadingFilterTemplate: MeterReadingFilterTemplateGQL } = require('@condo/domains/meter/gql')
const { DEFAULT_ORGANIZATION_TIMEZONE } = require('@condo/domains/organization/constants/common')
const { FLAT_UNIT_TYPE } = require('@condo/domains/property/constants/common')
/* AUTOGENERATE MARKER <IMPORT> */

const MeterResource = generateGQLTestUtils(MeterResourceGQL)
const MeterReadingSource = generateGQLTestUtils(MeterReadingSourceGQL)
const Meter = generateGQLTestUtils(MeterGQL)
const MeterReading = generateGQLTestUtils(MeterReadingGQL)
const MeterReadingFilterTemplate = generateGQLTestUtils(MeterReadingFilterTemplateGQL)
/* AUTOGENERATE MARKER <CONST> */
const { makeClientWithServiceConsumer } = require('@condo/domains/resident/utils/testSchema')
const { makeLoggedInAdminClient } = require('@open-condo/keystone/test.utils')


async function createTestMeterResource (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

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

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await MeterResource.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestMeterReadingSource (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await MeterReadingSource.create(client, attrs)
    return [obj, attrs]
}

async function updateTestMeterReadingSource (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await MeterReadingSource.update(client, id, attrs)
    return [obj, attrs]
}

async function makeClientWithResidentAndMeter (extraMeterAttrs = {}) {
    const client = await makeClientWithServiceConsumer()
    const adminClient = await makeLoggedInAdminClient()
    const { property, organization, serviceConsumer, resident } = client
    const [resource] = await MeterResource.getAll(client)
    client.resource = resource
    const [meter, attrs] = await createTestMeter(adminClient, organization, property, resource, {
        accountNumber: serviceConsumer.accountNumber,
        unitName: resident.unitName,
        ...extraMeterAttrs,
    })
    client.meterAttrs = attrs
    client.meter = meter
    return client
}


async function createTestMeter (client, organization, property, resource, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    if (!property || !property.id) throw new Error('no property.id')
    if (!resource || !resource.id) throw new Error('no resource.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const accountNumber = faker.random.alphaNumeric(8)

    const attrs = {
        dv: 1,
        sender,
        number: faker.random.alphaNumeric(5),
        unitName: faker.random.alphaNumeric(5),
        unitType: FLAT_UNIT_TYPE,
        organization: { connect: { id: organization.id } },
        property: { connect: { id: property.id } },
        resource: { connect: { id: resource.id } },
        accountNumber,
        numberOfTariffs: 1,
        ...extraAttrs,
    }
    const obj = await Meter.create(client, attrs)
    return [obj, attrs]
}

async function updateTestMeter (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await Meter.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestMeterReading (client, meter, source, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!meter || !meter.id) throw new Error('no meter.id')
    if (!source || !source.id) throw new Error('no source.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        meter: { connect: { id: meter.id } },
        source: { connect: { id: source.id } },
        date: faker.date.recent(),
        value1: String(faker.random.number()),
        ...extraAttrs,
    }
    const obj = await MeterReading.create(client, attrs)
    return [obj, attrs]
}

async function updateTestMeterReading (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await MeterReading.update(client, id, attrs)
    return [obj, attrs]
}

async function exportMeterReadingsByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        timeZone: DEFAULT_ORGANIZATION_TIMEZONE,
        ...extraAttrs,
    }
    const { data, errors } = await client.query(EXPORT_METER_READINGS_QUERY, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function createTestMeterReadingFilterTemplate (client, employee, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!employee || !employee.id) throw new Error('no employee.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const name = faker.random.alphaNumeric(5)
    const ticketUnitFilter = [faker.random.alphaNumeric(5)]
    const fields = { unitName: ticketUnitFilter }

    const attrs = {
        dv: 1,
        sender,
        employee: { connect: { id: employee.id } },
        name,
        fields,
        ...extraAttrs,
    }

    const obj = await MeterReadingFilterTemplate.create(client, attrs)
    return [obj, attrs]
}

async function updateTestMeterReadingFilterTemplate (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await MeterReadingFilterTemplate.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    MeterResource, createTestMeterResource, updateTestMeterResource,
    MeterReadingSource, createTestMeterReadingSource, updateTestMeterReadingSource,
    Meter, createTestMeter, updateTestMeter,
    MeterReading, createTestMeterReading, updateTestMeterReading,
    exportMeterReadingsByTestClient,
    MeterReadingFilterTemplate, createTestMeterReadingFilterTemplate, updateTestMeterReadingFilterTemplate,
    makeClientWithResidentAndMeter,
    /* AUTOGENERATE MARKER <EXPORTS> */
}
