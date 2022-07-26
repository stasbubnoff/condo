/**
 * Generated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')
const isEmpty = require('lodash/isEmpty')
const sample = require('lodash/sample')
const get = require('lodash/get')

const { getRandomString } = require('@core/keystone/test.utils')

const { generateGQLTestUtils, throwIfError } = require('@condo/domains/common/utils/codegeneration/generate.test.utils')

const {
    PUSH_TRANSPORT_TYPES,
    DEVICE_PLATFORM_TYPES,
    INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
} = require('@condo/domains/notification/constants/constants')

const {
    Message: MessageGQL,
    SEND_MESSAGE,
    RESEND_MESSAGE,
    RemoteClient: RemoteClientGQL,
    SYNC_REMOTE_CLIENT_MUTATION,
    DISCONNECT_USER_FROM_REMOTE_CLIENT_MUTATION,
} = require('@condo/domains/notification/gql')

const { SET_MESSAGE_STATUS_MUTATION } = require('@condo/domains/notification/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const Message = generateGQLTestUtils(MessageGQL)
const RemoteClient = generateGQLTestUtils(RemoteClientGQL)

/* AUTOGENERATE MARKER <CONST> */

const lang = 'en'
const type = INVITE_NEW_EMPLOYEE_MESSAGE_TYPE

const getRandomEmail = () => `test.${getRandomString()}@example.com`.toLowerCase()

async function createTestMessage (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const email = getRandomEmail()
    const meta = { dv: 1, name: faker.random.alphaNumeric(8) }
    const attrs = { dv: 1, sender, email, type, meta, lang, ...extraAttrs}
    const obj = await Message.create(client, attrs)

    return [obj, attrs]
}

async function updateTestMessage (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const attrs = { dv: 1, sender, ...extraAttrs }
    const obj = await Message.update(client, id, attrs)

    return [obj, attrs]
}

async function sendMessageByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const email = getRandomEmail()
    const to = get(client, 'user.id') ? { email, user: { id: client.user.id } }: { email }
    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const type = INVITE_NEW_EMPLOYEE_MESSAGE_TYPE
    const meta = { dv: 1, inviteCode: faker.random.alphaNumeric(8) }
    const attrs = { dv: 1, sender, to, type, meta, lang, ...extraAttrs }
    const { data, errors } = await client.mutate(SEND_MESSAGE, { data: attrs })

    throwIfError(data, errors)

    return [data.result, attrs]
}

async function resendMessageByTestClient (client, message, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!message) throw new Error('no message')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const attrs = { dv: 1, sender, message: { id: message.id }, ...extraAttrs }
    const { data, errors } = await client.mutate(RESEND_MESSAGE, { data: attrs })

    throwIfError(data, errors)

    return [data.result, attrs]
}

async function createTestRemoteClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const deviceId = faker.datatype.uuid()
    const appId = faker.datatype.uuid()
    const pushTransport = sample(PUSH_TRANSPORT_TYPES)
    const devicePlatform = sample(DEVICE_PLATFORM_TYPES)
    const attrs = {
        dv: 1,
        sender,
        deviceId,
        appId,
        pushTransport,
        devicePlatform,
        owner: !isEmpty(client.user) ? { connect: { id: client.user.id } } : null,
        ...extraAttrs,
    }
    const obj = await RemoteClient.create(client, attrs)

    return [obj, attrs]
}

async function updateTestRemoteClient (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const attrs = {
        dv: 1,
        sender,
        owner: !isEmpty(client.user) ? { disconnectAll: true, connect: { id: client.user.id } } : null,
        ...extraAttrs,
    }
    const obj = await RemoteClient.update(client, id, attrs)

    return [obj, attrs]
}

async function syncRemoteClientByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const attrs = { dv: 1, sender, ...extraAttrs }
    const { data, errors } = await client.mutate(SYNC_REMOTE_CLIENT_MUTATION, { data: attrs })

    throwIfError(data, errors)

    return [data.result, attrs]
}

async function disconnectUserFromRemoteClientByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const attrs = { dv: 1, sender, ...extraAttrs }
    const { data, errors } = await client.mutate(DISCONNECT_USER_FROM_REMOTE_CLIENT_MUTATION, { data: attrs })

    throwIfError(data, errors)

    return [data.result, attrs]
}

async function setMessageStatusByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const attrs = { dv: 1, sender, ...extraAttrs }
    const { data, errors } = await client.mutate(SET_MESSAGE_STATUS_MUTATION, { data: attrs })

    throwIfError(data, errors)

    return [data.result, attrs]
}
/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    Message, createTestMessage, updateTestMessage, sendMessageByTestClient, resendMessageByTestClient, setMessageStatusByTestClient,
    RemoteClient, createTestRemoteClient, updateTestRemoteClient, syncRemoteClientByTestClient, disconnectUserFromRemoteClientByTestClient,
/* AUTOGENERATE MARKER <EXPORTS> */
}
