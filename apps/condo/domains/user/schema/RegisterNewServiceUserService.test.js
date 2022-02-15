/**
 * Generated by `createservice user.RegisterNewServiceUserService`
 */
const { makeLoggedInAdminClient } = require('@core/keystone/test.utils')

const {
    registerNewServiceUserByTestClient,
    createTestUser,
    makeLoggedInClient,
    makeClientWithSupportUser, User,
} = require('@condo/domains/user/utils/testSchema')
const { expectToThrowAccessDeniedErrorToResult, catchErrorFrom } = require('@condo/domains/common/utils/testSchema')
const { EMAIL_ALREADY_REGISTERED_ERROR } = require('@condo/domains/user/constants/errors')
const { GET_MY_USERINFO } = require('@condo/domains/user/gql')
const { SERVICE } = require('@condo/domains/user/constants/common')

describe('RegisterNewServiceUserServiceAccess', () => {
    test('admin can create service user', async () => {
        const client = await makeLoggedInAdminClient()
        const [{ email, password }] = await registerNewServiceUserByTestClient(client)
        const serviceClient = await makeLoggedInClient({ email: email, password: password })
        const { data: { user } } = await serviceClient.query(GET_MY_USERINFO)
        expect(user.id).toEqual(serviceClient.user.id)
        expect(user.type).toEqual(SERVICE)
    })
    test('support can create service user', async () => {
        const client = await makeClientWithSupportUser()
        const [{ email, password }] = await registerNewServiceUserByTestClient(client)
        const serviceClient = await makeLoggedInClient({ email: email, password: password })
        const { data: { user } } = await serviceClient.query(GET_MY_USERINFO)
        expect(user.id).toEqual(serviceClient.user.id)
        expect(user.type).toEqual(SERVICE)
    })
    test('user can not create service user', async () => {
        const client = await makeLoggedInClient()
        await expectToThrowAccessDeniedErrorToResult(async () => {
            await registerNewServiceUserByTestClient(client)
        })
    })
    test('support can create service user1', async () => {
        const client = await makeClientWithSupportUser()
        const admin = await makeLoggedInAdminClient()
        await User.update(admin, client.user.id, { deletedAt: 'true' })
        await expectToThrowAccessDeniedErrorToResult(async () => {
            await registerNewServiceUserByTestClient(client)
        })
    })
})

describe('RegisterNewServiceUserServiceLogic', () => {
    test('can not register service user with existed email', async () => {
        const admin = await makeLoggedInAdminClient()
        const [, userAttrs] = await createTestUser(admin)
        const email = userAttrs.email
        await catchErrorFrom(async () => {
            await registerNewServiceUserByTestClient(admin, { email })
        }, ({ errors }) => {
            expect(errors[0].originalError.errors[0].data.messages[0]).toEqual(
                expect.stringContaining(EMAIL_ALREADY_REGISTERED_ERROR))
        })
    })
})