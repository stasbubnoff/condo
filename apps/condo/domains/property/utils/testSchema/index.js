/**
 * Generated by `createschema property.Property 'organization:Text; name:Text; address:Text; addressMeta:Json; type:Select:building,village; map?:Json'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')
const { makeClientWithResidentUser } = require('@condo/domains/user/utils/testSchema')
const { addResidentAccess } = require('@condo/domains/user/utils/testSchema')
const { CHECK_PROPERTY_WITH_ADDRESS_EXIST_QUERY } = require('../../gql')
const { throwIfError } = require('@open-condo/codegen/generate.test.utils')
const { buildingMapJson } = require('@condo/domains/property/constants/property')
const { generateGQLTestUtils } = require('@open-condo/codegen/generate.test.utils')
const { buildFakeAddressAndMeta } = require('./factories')
const { Property: PropertyGQL } = require('@condo/domains/property/gql')
const { makeClientWithRegisteredOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { EXPORT_PROPERTIES_TO_EXCEL } = require('@condo/domains/property/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const Property = generateGQLTestUtils(PropertyGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestProperty (client, organization, extraAttrs = {}, withFlat = false, addressMetaExtraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization) throw new Error('no organization')

    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const name = faker.address.streetAddress(true)
    const { address, addressMeta } = buildFakeAddressAndMeta(withFlat, addressMetaExtraAttrs)
    const attrs = {
        dv: 1,
        sender,
        organization: { connect: { id: organization.id } },
        type: 'building',
        name,
        address,
        addressMeta,
        ...extraAttrs,
    }
    const obj = await Property.create(client, attrs)

    return [obj, attrs]
}

async function updateTestProperty (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await Property.update(client, id, attrs)
    return [obj, attrs]
}

async function makeClientWithProperty (includeFlat = false, addressMetaExtraAttrs = {}) {
    const client = await makeClientWithRegisteredOrganization()
    const [property] = await createTestProperty(client, client.organization, { map: buildingMapJson }, includeFlat, addressMetaExtraAttrs)
    client.property = property
    return client
}

// TODO(DOMA-1699): make create Resident for client. Rewrite tests where this utility is used.
async function makeClientWithResidentAccessAndProperty () {
    const clientWithOrganization = await makeClientWithProperty()
    const client = await makeClientWithResidentUser()
    const organization = clientWithOrganization.organization
    const property = clientWithOrganization.property

    client.organization = organization
    client.property = property

    return client
}

async function checkPropertyWithAddressExistByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const attrs = {
        ...extraAttrs,
    }
    const { data, errors } = await client.query(CHECK_PROPERTY_WITH_ADDRESS_EXIST_QUERY, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function exportPropertiesToExcelByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const attrs = {
        ...extraAttrs,
    }
    const { data, errors } = await client.query(EXPORT_PROPERTIES_TO_EXCEL, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}
/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    Property,
    createTestProperty,
    updateTestProperty,
    makeClientWithProperty,
    checkPropertyWithAddressExistByTestClient,
    makeClientWithResidentAccessAndProperty,
    exportPropertiesToExcelByTestClient,
/* AUTOGENERATE MARKER <EXPORTS> */
}
