/**
 * Generated by `createschema analytics.ExternalReport 'type:Select:metabase; title:Text; description?:Text; meta?:Json'`
 */

const faker = require('faker')
const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { makeClientWithRegisteredOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { ExternalReport, createTestExternalReport, updateTestExternalReport } = require('@condo/domains/analytics/utils/testSchema')

describe('ExternalReport', () => {
    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()

                const [obj, attrs] = await createTestExternalReport(admin)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(1)
                expect(obj.newId).toBeNull()
                expect(obj.deletedAt).toBeNull()
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(obj.createdAt).toMatch(DATETIME_RE)
                expect(obj.updatedAt).toMatch(DATETIME_RE)
                expect(obj.title).toBeDefined()
                expect(obj.description).toBeDefined()
                expect(obj.isHidden).toBeFalsy()
                expect(obj.organization).toBeNull()
            })

            test('support can', async () => {
                const support = await makeClientWithSupportUser()

                const [obj, attrs] = await createTestExternalReport(support)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.deletedAt).toBeNull()
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: support.user.id }))
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: support.user.id }))
                expect(obj.organization).toBeNull()
            })

            test('user can\'t', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestExternalReport(client)
                })
            })

            test('anonymous can\'t', async () => {
                const client = await makeClient()

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestExternalReport(client)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestExternalReport(admin)

                const updatedTitle = faker.datatype.string()

                const [obj, attrs] = await updateTestExternalReport(admin, objCreated.id, {
                    title: updatedTitle,
                })

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.title).toEqual(updatedTitle)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            })

            test('support can', async () => {
                const support = await makeClientWithSupportUser()
                const [objCreated] = await createTestExternalReport(support)

                const updatedTitle = faker.datatype.string()

                const [obj, attrs] = await updateTestExternalReport(support, objCreated.id, {
                    title: updatedTitle,
                })

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.title).toEqual(updatedTitle)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: support.user.id }))
            })

            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestExternalReport(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestExternalReport(client, objCreated.id, {
                        title: faker.datatype.string(),
                    })
                })
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestExternalReport(admin)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestExternalReport(client, objCreated.id, {
                        title: faker.datatype.string(),
                    })
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestExternalReport(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await ExternalReport.delete(admin, objCreated.id)
                })
            })

            test('support can\'t', async () => {
                const support = await makeClientWithSupportUser()
                const [objCreated] = await createTestExternalReport(support)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await ExternalReport.delete(support, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestExternalReport(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await ExternalReport.delete(client, objCreated.id)
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTestExternalReport(admin)

                const objs = await ExternalReport.getAll(admin, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                        type: obj.type,
                        title: obj.title,
                        description: obj.description,
                        meta: obj.meta,
                        organization: obj.organization,
                    }),
                ]))
            })

            test('support can', async () => {
                const support = await makeClientWithSupportUser()
                const [obj] = await createTestExternalReport(support)

                const objs = await ExternalReport.getAll(support, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                        type: obj.type,
                        title: obj.title,
                        description: obj.description,
                        meta: obj.meta,
                        organization: obj.organization,
                    }),
                ]))
            })

            test('user can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTestExternalReport(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                const objs = await ExternalReport.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs[0]).toMatchObject({
                    id: obj.id,
                    type: obj.type,
                    title: obj.title,
                    description: obj.description,
                    meta: obj.meta,
                    organization: obj.organization,
                })
            })

            test('user can only it\'s organizations', async () => {
                const admin = await makeLoggedInAdminClient()
                const client = await makeClientWithRegisteredOrganization()
                const anotherClient = await makeClientWithRegisteredOrganization()

                const [obj] = await createTestExternalReport(admin, { organization: { connect: { id: anotherClient.organization.id } } })

                const objs = await ExternalReport.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs).not.toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                        type: obj.type,
                        title: obj.title,
                        description: obj.description,
                        meta: obj.meta,
                        organization: obj.organization,
                    }),
                ]))
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTestExternalReport(admin)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await ExternalReport.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })
        })
    })
})
