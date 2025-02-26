/**
 * Generated by `{{ command }}`
 */

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE, waitFor } = require('@open-condo/keystone/test.utils')

const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj, expectToThrowAccessDeniedErrorToObjects,
} = require('@open-condo/keystone/test.utils')

const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@{{app}}/domains/user/utils/testSchema')

const { {{name}}, createTest{{name}}, updateTest{{name}} } = require('@{{app}}/domains/{{domain}}/utils/testSchema')

describe('{{name}}', () => {
    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                // 1) prepare data
                const admin = await makeLoggedInAdminClient()

                // 2) action
                const [obj, attrs] = await createTest{{name}}(admin)

                // 3) check
                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(1)
                expect(obj.newId).toEqual(null)
                expect(obj.deletedAt).toEqual(null)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(obj.createdAt).toMatch(DATETIME_RE)
                expect(obj.updatedAt).toMatch(DATETIME_RE)
                // TODO(codegen): write others fields here! provide as match fields as you can here!
            })

            // TODO(codegen): if you do not have any SUPPORT specific tests just remove this block!
            test('support can', async () => {
                const client = await makeClientWithSupportUser()  // TODO(codegen): create SUPPORT client!

                const [obj, attrs] = await createTest{{name}}(client)  // TODO(codegen): write 'support: create {{name}}' test

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
            })

            test('user can', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()  // TODO(codegen): create USER client!

                const [obj, attrs] = await createTest{{name}}(client)  // TODO(codegen): write 'user: create {{name}}' test

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
            })

            test('anonymous can\'t', async () => {
                const client = await makeClient()

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTest{{name}}(client)  // TODO(codegen): write 'anonymous: create {{name}}' test
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTest{{name}}(admin)

                const [obj, attrs] = await updateTest{{name}}(admin, objCreated.id)

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
            })

            // TODO(codegen): if you do not have any SUPPORT specific tests just remove this block!
            test('support can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTest{{name}}(admin)

                const client = await makeClientWithSupportUser()  // TODO(codegen): update SUPPORT client!
                const [obj, attrs] = await updateTest{{name}}(client, objCreated.id)  // TODO(codegen): write 'support: update {{name}}' test

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
            })

            test('user can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTest{{name}}(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()  // TODO(codegen): create USER client!
                const [obj, attrs] = await updateTest{{name}}(client, objCreated.id)  // TODO(codegen): write 'user: update {{name}}' test

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTest{{name}}(admin)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTest{{name}}(client, objCreated.id)  // TODO(codegen): write 'anonymous: update {{name}}' test
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTest{{name}}(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await {{name}}.delete(admin, objCreated.id)  // TODO(codegen): write 'admin: delete {{name}}' test
                })
            })

            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTest{{name}}(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()  // TODO(codegen): create USER client!
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await {{name}}.delete(client, objCreated.id)  // TODO(codegen): write 'user: delete {{name}}' test
                })
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTest{{name}}(admin)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await {{name}}.delete(client, objCreated.id)  // TODO(codegen): write 'anonymous: delete {{name}}' test
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTest{{name}}(admin)

                const objs = await {{name}}.getAll(admin, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                        // TODO(codegen): write fields which important to ADMIN access check
                    }),
                ]))
            })

            test('user can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTest{{name}}(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()  // TODO(codegen): create USER client!
                const objs = await {{name}}.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs).toHaveLength(1)
                expect(objs[0]).toMatchObject({
                    id: obj.id,
                    // TODO(codegen): write fields which important to USER access check
                })
            })

            // TODO(codegen): write test for user1 doesn't have access to user2 data if it's applicable

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTest{{name}}(admin)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await {{name}}.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })  // TODO(codegen): write 'anonymous: read {{name}}' test
                })
            })
        })
    })

    describe('Validation tests', () => {
        test('Should have correct dv field (=== 1)', async () => {
            // TODO(codegen): check it!
        })
    })

    describe('notifications', () => {
        // TODO(codegen): write notifications tests if you have any sendMessage calls or drop this block!
    })
})
