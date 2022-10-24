/**
 * Generated by `createschema ticket.TicketProblemClassifier 'organization?:Relationship:Organization:CASCADE;name:Text;'`
 */
const faker = require('faker')

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@condo/keystone/test.utils')
const { makeClientWithSupportUser, makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { TicketProblemClassifier, createTestTicketProblemClassifier, updateTestTicketProblemClassifier } = require('@condo/domains/ticket/utils/testSchema')
const { expectToThrowAuthenticationErrorToObjects, expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')

describe('TicketProblemClassifier CRUD', () => {
    describe('User', () => {
        it('can not create', async () => {
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicketProblemClassifier(client)
            })
        })
        it('can read', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated, attrs] = await createTestTicketProblemClassifier(admin)
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const objs = await TicketProblemClassifier.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
            const obj = objs.find((x) => x.id === objCreated.id)
            expect(obj.id).toMatch(objCreated.id)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(obj.createdAt).toMatch(objCreated.createdAt)
            expect(obj.updatedAt).toMatch(objCreated.updatedAt)
            expect(obj.name).toMatch(attrs.name)
        })
        it('can not update', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestTicketProblemClassifier(admin)
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const payload = { name: faker.lorem.word() }
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestTicketProblemClassifier(client, objCreated.id, payload)
            })
        })
        it('can not delete', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestTicketProblemClassifier(admin)
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await TicketProblemClassifier.delete(client, objCreated.id)
            })
        })
    })
    describe('Support', () => {
        it('can create', async () => {
            const support = await makeClientWithSupportUser()
            const [obj, attrs] = await createTestTicketProblemClassifier(support)
            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: support.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: support.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
        })
        it('can read', async () => {
            const admin = await makeLoggedInAdminClient()
            const support = await makeClientWithSupportUser()
            const [objCreated, attrs] = await createTestTicketProblemClassifier(admin)
            const objs = await TicketProblemClassifier.getAll(support, {}, { sortBy: ['updatedAt_DESC'] })
            const obj = objs.find((x) => x.id === objCreated.id)
            expect(obj.id).toMatch(objCreated.id)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(obj.createdAt).toMatch(objCreated.createdAt)
            expect(obj.updatedAt).toMatch(objCreated.updatedAt)
            expect(obj.name).toMatch(attrs.name)
        })
        it('can update', async () => {
            const admin = await makeLoggedInAdminClient()
            const support = await makeClientWithSupportUser()
            const [objCreated] = await createTestTicketProblemClassifier(admin)
            const payload = { name: faker.lorem.word() }
            const [obj] = await updateTestTicketProblemClassifier(support, objCreated.id, payload)
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: support.user.id }))
            expect(obj.name).toEqual(payload.name)
        })
        it('can not delete', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestTicketProblemClassifier(admin)
            const support = await makeClientWithSupportUser()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await TicketProblemClassifier.delete(support, objCreated.id)
            })
        })
    })
    describe('Anonymous', () => {
        it('can not create', async () => {
            const client = await makeClient()
            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestTicketProblemClassifier(client)
            })
        })
        it('can read', async () => {
            const client = await makeClient()
            await expectToThrowAuthenticationErrorToObjects(async () => {
                await TicketProblemClassifier.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
            })
        })
        it('can not update', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestTicketProblemClassifier(admin)
            const client = await makeClient()
            const payload = { name: faker.lorem.word() }
            await expectToThrowAuthenticationErrorToObj(async () => {
                await updateTestTicketProblemClassifier(client, objCreated.id, payload)
            })
        })
        it('can not delete', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestTicketProblemClassifier(admin)
            const client = await makeClient()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await TicketProblemClassifier.delete(client, objCreated.id)
            })
        })
    })
})
