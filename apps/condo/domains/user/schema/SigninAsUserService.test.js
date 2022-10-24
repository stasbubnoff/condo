/**
 * Generated by `createservice user.SigninAsUserService`
 */

const { makeLoggedInAdminClient, makeClient, makeLoggedInClient } = require('@condo/keystone/test.utils')
const { makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { expectToThrowAccessDeniedErrorToResult, expectToThrowAuthenticationError } = require('@condo/domains/common/utils/testSchema')
const { signinAsUserByTestClient } = require('@condo/domains/user/utils/testSchema')
const { GET_MY_USERINFO } = require('@condo/domains/user/gql')
const { catchErrorFrom } = require('@condo/domains/common/utils/testSchema')

describe('SigninAsUserService', () => {
    describe('Support', () => {
        it('can signin as a simple user', async () => {
            const supportClient = await makeClientWithSupportUser()
            const userClient = await makeLoggedInClient()
            await signinAsUserByTestClient(supportClient, userClient.user.id )
            const { data: { user } } = await supportClient.query(GET_MY_USERINFO)
            expect(user.id).toEqual(userClient.user.id)
        })
        it('can not signin as a support user', async () => {
            const supportClient = await makeClientWithSupportUser()
            const userClient = await makeClientWithSupportUser()
            await catchErrorFrom(async () => {
                await signinAsUserByTestClient(supportClient, userClient.user.id )
            }, ({ errors, data }) => {
                expect(errors).toMatchObject([{
                    message: 'You cannot authenticate for an another support user',
                    name: 'GQLError',
                    path: ['result'],
                    extensions: {
                        mutation: 'signinAsUser',
                        code: 'FORBIDDEN',
                    },
                }])
                expect(data).toEqual({ 'result': null })
            })
        })
        it('can not signin as an admin user', async () => {
            const supportClient = await makeClientWithSupportUser()
            const userClient = await makeLoggedInAdminClient()
            await catchErrorFrom(async () => {
                await signinAsUserByTestClient(supportClient, userClient.user.id )
            }, ({ errors, data }) => {
                expect(errors).toMatchObject([{
                    message: 'You cannot authenticate for an another admin user',
                    name: 'GQLError',
                    path: ['result'],
                    extensions: {
                        mutation: 'signinAsUser',
                        code: 'FORBIDDEN',
                    },
                }])
                expect(data).toEqual({ 'result': null })
            })
        })
    })
    describe('User', () => {
        it('can not signin as another user', async () => {
            const userClient = await makeLoggedInClient()
            const anotherUserClient = await makeLoggedInClient()
            await expectToThrowAccessDeniedErrorToResult(async () => {
                await signinAsUserByTestClient(userClient, anotherUserClient.user.id )
            })
        })
    })
    describe('Anonymous', () => {
        it('has no access to action', async () => {
            const userClient = await makeLoggedInClient()
            const client = await makeClient()
            await expectToThrowAuthenticationError(async () => {
                await signinAsUserByTestClient(client, userClient.user.id )
            }, 'result')
        })
    })
})
