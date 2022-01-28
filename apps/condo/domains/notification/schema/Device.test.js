/**
 * Generated by `createschema notification.Device 'deviceId:Text; pushToken?:Text; pushTransport?:Select:firebase,apple,huawei; owner?:Relationship:User:SET_NULL; meta?:Json'`
 */
const faker = require('faker')
const sample = require('lodash/sample')

const { makeLoggedInAdminClient, makeClient, makeLoggedInClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')

const {
    expectToThrowValidationFailureError,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowMutationError,
    expectToThrowUserInputError,
} = require('@condo/domains/common/utils/testSchema')

const { Device, createTestDevice, updateTestDevice } = require('@condo/domains/notification/utils/testSchema')

const { PUSH_TRANSPORT_TYPES } = require('../constants/constants')

const DUPLICATE_CONSTRAINT_VIOLATION_ERROR_MESSAGE = 'duplicate key value violates unique constraint'

describe('Device', () => {
    test('anonymous: direct create Device access denied', async () => {
        const client = await makeClient()

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestDevice(client)
        })
    })

    test('user: direct create Device access denied', async () => {
        const client = await makeLoggedInClient()

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestDevice(client)
        })
    })

    test('admin: direct create Device allowed', async () => {
        const admin = await makeLoggedInAdminClient()

        const [obj, attrs] = await createTestDevice(admin)

        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.v).toEqual(1)
        expect(obj.newId).toEqual(null)
        expect(obj.deletedAt).toEqual(null)
        expect(obj.createdAt).toMatch(DATETIME_RE)
        expect(obj.updatedAt).toMatch(DATETIME_RE)
        expect(obj.owner.id).toEqual(admin.user.id)
    })

    test('admin: deviceId is required', async () => {
        const admin = await makeLoggedInAdminClient()

        await expectToThrowValidationFailureError( async () => {
            await createTestDevice(admin, { deviceId: null })
        })
    })

    test('admin: pushToken is not required by itself', async () => {
        const admin = await makeLoggedInAdminClient()

        const [obj, attrs] = await createTestDevice(admin, { pushToken: null })

        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.v).toEqual(1)
        expect(obj.newId).toEqual(null)
        expect(obj.deletedAt).toEqual(null)
        expect(obj.createdAt).toMatch(DATETIME_RE)
        expect(obj.updatedAt).toMatch(DATETIME_RE)
        expect(obj.owner.id).toEqual(admin.user.id)
        expect(obj.pushToken).toBeNull()
    })

    test('admin: pushTransport is required', async () => {
        const admin = await makeLoggedInAdminClient()

        await expectToThrowValidationFailureError(async () => {
            const extraAttrs = { pushTransport: null }

            await createTestDevice(admin, extraAttrs)
        })
    })

    test('admin: invalid pushTransport value', async () => {
        const admin = await makeLoggedInAdminClient()
        const extraAttrs = { pushTransport: 'xxxxxxx' }

        await expectToThrowUserInputError(
            async () => await createTestDevice(admin, extraAttrs),
            `got invalid value "${extraAttrs.pushTransport}" at "data.pushTransport";`,
        )
    })

    test('anonymous: fails to read other`s Device', async () => {
        const admin = await makeLoggedInAdminClient()
        const [pushToken] = await createTestDevice(admin)
        const client1 = await makeClient()

        await expectToThrowAuthenticationErrorToObjects(async () => {
            await Device.getOne(client1, { id: pushToken.id })
        })
    })

    test('user: fails to read other`s Device', async () => {
        const admin = await makeLoggedInAdminClient()
        const client = await makeLoggedInClient()
        const [pushToken] = await createTestDevice(admin)
        const othersDevice = await Device.getOne(client, { id: pushToken.id })

        expect(othersDevice).toBeUndefined()
    })

    test('admin: able to read other`s Devices', async () => {
        const admin = await makeLoggedInAdminClient()
        const admin2 = await makeLoggedInAdminClient()
        const [pushToken] = await createTestDevice(admin)
        const obj = await Device.getOne(admin2, { id: pushToken.id })

        expect(obj).toBeDefined()
        expect(obj).not.toBeNull()
        expect(obj.id).toEqual(pushToken.id)
        expect(obj.deviceId).toEqual(pushToken.deviceId)
        expect(obj.pushTransport).toEqual(pushToken.pushTransport)
        expect(obj.pushToken).toEqual(pushToken.pushToken)
        expect(obj.owner.id).toEqual(admin.user.id)
    })

    test('user: can read own Device', async () => {
        const admin = await makeLoggedInAdminClient()
        const [pushToken] = await createTestDevice(admin)
        const lastDevice = await Device.getOne(admin, { id: pushToken.id })

        expect(lastDevice).toBeDefined()
        expect(lastDevice.id).toEqual(pushToken.id)
        expect(lastDevice.owner.id).toEqual(admin.user.id)
    })

    test('anonymous: fails to read Devices', async () => {
        const client = await makeClient()

        await expectToThrowAuthenticationErrorToObjects(async () => {
            await Device.getAll(client)
        })
    })

    test('admin: deviceId + pushTransport is unique', async () => {
        const admin = await makeLoggedInAdminClient()
        const admin1 = await makeLoggedInAdminClient()
        const [objCreated] = await createTestDevice(admin)
        const extraAttrs = { deviceId: objCreated.deviceId, pushTransport: objCreated.pushTransport }

        await expectToThrowMutationError(
            async () => await createTestDevice(admin1, extraAttrs),
            DUPLICATE_CONSTRAINT_VIOLATION_ERROR_MESSAGE,
            ['obj']
        )
    })

    test('admin: pushToken is unique', async () => {
        const admin = await makeLoggedInAdminClient()
        const admin1 = await makeLoggedInAdminClient()
        const extraAttrs = { pushToken: faker.datatype.uuid(), pushTransport: sample(PUSH_TRANSPORT_TYPES) }

        await createTestDevice(admin, extraAttrs)

        await expectToThrowMutationError(
            async () => await createTestDevice(admin1, extraAttrs),
            DUPLICATE_CONSTRAINT_VIOLATION_ERROR_MESSAGE,
            ['obj']
        )
    })

    test('admin: update Device', async () => {
        const admin = await makeLoggedInAdminClient()
        const admin1 = await makeLoggedInAdminClient()
        const [objCreated] = await createTestDevice(admin)
        const payload = {
            owner: { disconnectAll: true, connect: { id: admin1.user.id } },
            deviceId: objCreated.deviceId,
        }
        const [objUpdated] = await updateTestDevice(admin1, objCreated.id, payload)

        expect(objUpdated.id).toEqual(objCreated.id)
        expect(objUpdated.owner.id).toEqual(admin1.user.id)
    })

    test('anonymous: fails to update Device', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestDevice(admin)
        const client = await makeClient()
        const payload = {
            owner: { disconnectAll: true },
            deviceId: objCreated.deviceId,
        }

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestDevice(client, objCreated.id, payload)
        })
    })

    test('user: fails to update Device', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestDevice(admin)
        const client = await makeLoggedInClient()
        const payload = {
            owner: { disconnectAll: true },
            deviceId: objCreated.deviceId,
        }

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestDevice(client, objCreated.id, payload)
        })
    })

    test('anonymous: fails to delete Device', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestDevice(admin)
        const client = await makeClient()

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await Device.delete(client, objCreated.id)
        })
    })

    test('user: fails to delete Device', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestDevice(admin)
        const client = await makeLoggedInClient()

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await Device.delete(client, objCreated.id)
        })
    })
})
