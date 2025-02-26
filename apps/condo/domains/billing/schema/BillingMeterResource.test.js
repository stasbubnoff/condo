/**
 * Generated by `createschema billing.BillingMeterResource 'name:Text'`
 */

const { expectToThrowAuthenticationErrorToObjects, expectToThrowAuthenticationErrorToObj } = require('@open-condo/keystone/test.utils')
const { makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@open-condo/keystone/test.utils')
const { BillingMeterResource, createTestBillingMeterResource } = require('@condo/domains/billing/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObj } = require('@open-condo/keystone/test.utils')

describe('BillingMeterResource', () => {
    test('admin: create BillingMeterResource', async () => {
        const admin = await makeLoggedInAdminClient()
        const [obj] = await createTestBillingMeterResource(admin)

        expect(obj.createdBy.id).toEqual(admin.user.id)
    })

    test('support: create BillingMeterResource', async () => {
        const support = await makeClientWithSupportUser()
        const [obj] = await createTestBillingMeterResource(support)

        expect(obj.createdBy.id).toEqual(support.user.id)
    })

    test('user: create BillingMeterResource', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestBillingMeterResource(client)
        })
    })

    test('anonymous: create BillingMeterResource', async () => {
        const client = await makeClient()
        await expectToThrowAuthenticationErrorToObj(async () => {
            await createTestBillingMeterResource(client)
        })
    })

    test('admin: read BillingMeterResource', async () => {
        const admin = await makeLoggedInAdminClient()
        const [obj] = await createTestBillingMeterResource(admin)
        const objs = await BillingMeterResource.getAll(admin, { id : obj.id })

        expect(objs).toHaveLength(1)
    })

    test('user: read BillingMeterResource', async () => {
        const admin = await makeLoggedInAdminClient()
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const [obj] = await createTestBillingMeterResource(admin)
        const objs = await BillingMeterResource.getAll(client, { id : obj.id })

        expect(objs).toHaveLength(1)
    })

    test('anonymous: read BillingMeterResource', async () => {
        const admin = await makeLoggedInAdminClient()
        const client = await makeClient()
        const [obj] = await createTestBillingMeterResource(admin)

        await expectToThrowAuthenticationErrorToObjects(async () => {
            await BillingMeterResource.getAll(client, { id : obj.id })
        })
    })
})

