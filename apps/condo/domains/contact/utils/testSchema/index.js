/**
 * Generated by `createschema contact.Contact 'property:Relationship:Property:SET_NULL; name:Text; phone:Text; unitName?:Text; email?:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')
const { createTestPhone } = require('@condo/domains/user/utils/testSchema')
const { createTestEmail } = require('@condo/domains/user/utils/testSchema')

const { generateGQLTestUtils } = require('@condo/codegen/generate.test.utils')

const { Contact: ContactGQL } = require('@condo/domains/contact/gql')
const { ContactRole: ContactRoleGQL } = require('@condo/domains/contact/gql')
const { FLAT_UNIT_TYPE } = require('@condo/domains/property/constants/common')
/* AUTOGENERATE MARKER <IMPORT> */

const Contact = generateGQLTestUtils(ContactGQL)
const ContactRole = generateGQLTestUtils(ContactRoleGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestContact (client, organization, property, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        organization: { connect: { id: organization.id } },
        property: { connect: { id: property.id } },
        unitName: faker.random.alphaNumeric(3),
        unitType: FLAT_UNIT_TYPE,
        name: faker.name.firstName(),
        email: createTestEmail(),
        phone: createTestPhone(),
        ...extraAttrs,
    }
    const obj = await Contact.create(client, attrs)
    return [obj, attrs]
}

async function updateTestContact (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.name.firstName(),
        email: createTestEmail(),
        phone: createTestPhone(),
        ...extraAttrs,
    }
    const obj = await Contact.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestContactRole (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.name.jobDescriptor(),
        ...extraAttrs,
    }
    const obj = await ContactRole.create(client, attrs)
    return [obj, attrs]
}

async function updateTestContactRole (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await ContactRole.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    Contact, createTestContact, updateTestContact,
    ContactRole, createTestContactRole, updateTestContactRole,
/* AUTOGENERATE MARKER <EXPORTS> */
}
