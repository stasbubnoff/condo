/**
 * Generated by `createservice user.ResetUserService --type mutations`
 */

const faker = require('faker')
const { makeLoggedInAdminClient } = require('@core/keystone/test.utils')
const { makeClient } = require('@core/keystone/test.utils')
const { catchErrorFrom } = require('@condo/domains/common/utils/testSchema')
const { DELETED_USER_NAME } = require('@condo/domains/user/constants')
const {
    makeClientWithNewRegisteredAndLoggedInUser,
    registerNewUser,
    resetUserByTestClient,
    makeClientWithSupportUser,
    UserAdmin,
} = require('@condo/domains/user/utils/testSchema')
const { expectToThrowAccessDeniedErrorToResult, expectToThrowAuthenticationErrorToResult } = require('@condo/domains/common/utils/testSchema')
const { makeClientWithRegisteredOrganization, OrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')


describe('ResetUserService', () => {
    let support
    let admin

    beforeAll(async () => {
        support = await makeClientWithSupportUser()
        admin = await makeLoggedInAdminClient()
    })

    test('support can reset user', async () => {
        const [user] = await registerNewUser(await makeClient())

        const payload = {
            user: { id: user.id },
        }

        await resetUserByTestClient(support, payload)

        // We use admin context here, since support does not have access to email and phone fields
        const [resetUser] = await UserAdmin.getAll(admin, { id: user.id })
        expect(resetUser.id).toEqual(user.id)
        expect(resetUser.name).toEqual(DELETED_USER_NAME)
        expect(resetUser.phone).toBeNull()
        expect(resetUser.email).toBeNull()
        expect(resetUser.isAdmin).toBeFalsy()
        expect(resetUser.isSupport).toBeFalsy()
        expect(resetUser.importId).toBeNull()
        expect(resetUser.importRemoteSystem).toBeNull()
        expect(resetUser.isPhoneVerified).toEqual(false)
        expect(resetUser.isEmailVerified).toEqual(false)
    })

    test('two reset users do not violate constrains', async () => {
        const [user] = await registerNewUser(await makeClient())
        const [user2] = await registerNewUser(await makeClient())

        const payload = {
            user: { id: user.id },
        }
        await resetUserByTestClient(support, payload)

        const payload2 = {
            user: { id: user2.id },
        }
        await resetUserByTestClient(support, payload2)

        // We use admin context here, since support does not have access to email and phone fields
        const [resetUser] = await UserAdmin.getAll(admin, { id: user.id })
        expect(resetUser.id).toEqual(user.id)
        expect(resetUser.name).toEqual(DELETED_USER_NAME)
        expect(resetUser.phone).toBeNull()
        expect(resetUser.email).toBeNull()

        const [resetUser2] = await UserAdmin.getAll(admin, { id: user.id })
        expect(resetUser2.id).toEqual(user.id)
        expect(resetUser2.name).toEqual(DELETED_USER_NAME)
        expect(resetUser2.phone).toBeNull()
        expect(resetUser2.email).toBeNull()
    })

    test('support cant reset non existing user', async () => {
        const userId = faker.datatype.uuid()
        const payload = {
            user: { id: userId },
        }

        await catchErrorFrom(async () => {
            await resetUserByTestClient(support, payload)
        }, ({ errors }) => {
            expect(errors).toMatchObject([{
                message: 'Could not find User by provided id',
                name: 'GQLError',
                path: ['result'],
                extensions: {
                    mutation: 'resetUser',
                    variable: ['data', 'user', 'id'],
                    code: 'BAD_USER_INPUT',
                    type: 'USER_NOT_FOUND',
                },
            }])
        })
    })

    test('support cant reset admin user', async () => {
        const userId = admin.user.id
        const payload = {
            user: { id: userId },
        }

        await catchErrorFrom(async () => {
            await resetUserByTestClient(support, payload)
        }, ({ errors }) => {
            expect(errors).toMatchObject([{
                message: 'You cannot reset admin user',
                name: 'GQLError',
                path: ['result'],
                extensions: {
                    mutation: 'resetUser',
                    variable: ['data', 'user', 'id'],
                    code: 'FORBIDDEN',
                    type: 'CANNOT_RESET_ADMIN_USER',
                },
            }])
        })
    })

    test('user can reset their account', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const payload = {
            user: { id: client.user.id },
        }

        await resetUserByTestClient(client, payload)

        // We use admin context here, since support does not have access to email and phone fields
        const [resetUser] = await UserAdmin.getAll(admin, { id: client.user.id })
        expect(resetUser.id).toEqual(client.user.id)
        expect(resetUser.name).toEqual(DELETED_USER_NAME)
        expect(resetUser.phone).toBeNull()
        expect(resetUser.email).toBeNull()
        expect(resetUser.isAdmin).toBeFalsy()
        expect(resetUser.isSupport).toBeFalsy()
        expect(resetUser.importId).toBeNull()
        expect(resetUser.importRemoteSystem).toBeNull()
        expect(resetUser.isPhoneVerified).toEqual(false)
        expect(resetUser.isEmailVerified).toEqual(false)
    })

    test('user cant reset another user', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const client2 = await makeClientWithNewRegisteredAndLoggedInUser()
        const payload = {
            user: { id: client.user.id },
        }

        await expectToThrowAccessDeniedErrorToResult(async () => {
            await resetUserByTestClient(client2, payload)
        })
    })

    test('anonymous cant reset user', async () => {
        const client = await makeClient()
        const userToResetId = faker.datatype.uuid()

        await expectToThrowAuthenticationErrorToResult(async () => {
            await resetUserByTestClient(client, { user: { id: userToResetId } })
        })
    })

    test('user will removed from all organizations after reset', async () => {
        const client = await makeClientWithRegisteredOrganization()
        await resetUserByTestClient(support, { user: { id: client.user.id } })

        const canAccessObjs = await OrganizationEmployee.getAll(client)
        expect(canAccessObjs).toHaveLength(0)
    })
})
