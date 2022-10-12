/**
 * Generated by `createschema condo.User 'name:Text;isAdmin:Checkbox;isSupport:Checkbox;type:Text' --force`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')
const { getRandomString, makeLoggedInClient, makeLoggedInAdminClient } = require('@condo/keystone/test.utils')

const { generateGQLTestUtils } = require('@condo/codegen/generate.test.utils')
const { STAFF_USER_TYPE, RESIDENT_USER_TYPE } = require('@miniapp/domains/condo/constants/user')

const { User: UserGQL } = require('@miniapp/domains/condo/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const User = generateGQLTestUtils(UserGQL)
/* AUTOGENERATE MARKER <CONST> */

const createTestEmail = () => ('test.' + getRandomString() + '@example.com').toLowerCase()
const createTestPhone = () => faker.phone.phoneNumber('+79#########')

async function createTestUser (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: 'test-' + faker.random.alphaNumeric(8) }
    const name = faker.name.firstName()
    const email = createTestEmail()
    const password = getRandomString()

    const attrs = {
        dv: 1,
        sender,
        name,
        email,
        password,
        type: STAFF_USER_TYPE,
        ...extraAttrs,
    }
    const obj = await User.create(client, attrs)
    return [obj, attrs]
}

async function updateTestUser (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await User.update(client, id, attrs)
    return [obj, attrs]
}

async function makeClientWithNewRegisteredAndLoggedInUser (extraAttrs = {}) {
    const admin = await makeLoggedInAdminClient()
    const [user, userAttrs] = await createTestUser(admin, extraAttrs)
    const client = await makeLoggedInClient(userAttrs)
    client.user = user
    client.userAttrs = userAttrs
    return client
}

async function makeClientWithSupportUser(extraAttrs = {}) {
    return await makeClientWithNewRegisteredAndLoggedInUser({ isSupport: true, type: STAFF_USER_TYPE, ...extraAttrs })
}

async function makeClientWithResidentUser(extraAttrs = {}) {
    return await makeClientWithNewRegisteredAndLoggedInUser({ type: RESIDENT_USER_TYPE, ...extraAttrs })
}

async function makeClientWithStaffUser(extraAttrs = {}) {
    return await makeClientWithNewRegisteredAndLoggedInUser({ type: STAFF_USER_TYPE, ...extraAttrs })
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    createTestEmail, createTestPhone,
    User, createTestUser, updateTestUser,
    makeClientWithSupportUser, makeClientWithStaffUser, makeClientWithResidentUser,
    /* AUTOGENERATE MARKER <EXPORTS> */
}
