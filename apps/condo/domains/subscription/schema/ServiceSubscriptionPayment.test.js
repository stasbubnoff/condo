/**
 * Generated by `createschema subscription.ServiceSubscriptionPayment 'type:Select:default,sbbol; status:Select:processing,done,error,stopped,cancelled; externalId:Text; amount:Decimal; currency:Select:rub; organization:Relationship:Organization:CASCADE; subscription:Relationship:ServiceSubscription:CASCADE; meta:Json;'`
 */
const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@open-condo/keystone/test.utils')

const { ServiceSubscriptionPayment, createTestServiceSubscriptionPayment, updateTestServiceSubscriptionPayment,
    createTestServiceSubscription, ServiceSubscription,
} = require('@condo/domains/subscription/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects, catchErrorFrom,
} = require('@open-condo/keystone/test.utils')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithRegisteredOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { SUBSCRIPTION_PAYMENT_STATUS } = require('../constants')
const { expectErrorByChangingStatusOfPayment } = require('../utils/testSchema')

describe('ServiceSubscriptionPayment', () => {
    describe('Validations', () => {
        it('should have positive amount', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)

            const [subscription] = await createTestServiceSubscription(adminClient, organization, {
                unitsCount: 1,
                unitPrice: '100',
            })

            const wrongAttrs = {
                amount: String(-100.05),
            }

            await catchErrorFrom(async () => {
                await createTestServiceSubscriptionPayment(adminClient, organization, subscription, wrongAttrs)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('new row for relation "ServiceSubscriptionPayment" violates check constraint "service_subscription_payment_positive_amount_check"')
                expect(data).toEqual({ 'obj': null })
            })
        })

        describe('status transitions', () => {
            it('cannot change status back to "created"', async () => {
                const { CREATED, PROCESSING, DONE, ERROR, STOPPED, CANCELLED } = SUBSCRIPTION_PAYMENT_STATUS
                await expectErrorByChangingStatusOfPayment({ from: PROCESSING, to: CREATED })
                await expectErrorByChangingStatusOfPayment({ from: DONE, to: CREATED })
                await expectErrorByChangingStatusOfPayment({ from: ERROR, to: CREATED })
                await expectErrorByChangingStatusOfPayment({ from: STOPPED, to: CREATED })
                await expectErrorByChangingStatusOfPayment({ from: CANCELLED, to: CREATED })
            })

            it('cannot change status from "done" to any other', async () => {
                const { CREATED, PROCESSING, DONE, ERROR, STOPPED, CANCELLED } = SUBSCRIPTION_PAYMENT_STATUS
                await expectErrorByChangingStatusOfPayment({ from: DONE, to: CREATED })
                await expectErrorByChangingStatusOfPayment({ from: DONE, to: PROCESSING })
                await expectErrorByChangingStatusOfPayment({ from: DONE, to: ERROR })
                await expectErrorByChangingStatusOfPayment({ from: DONE, to: STOPPED })
                await expectErrorByChangingStatusOfPayment({ from: DONE, to: CANCELLED })
            })

            it('cannot change status from "error" to any other', async () => {
                const { CREATED, PROCESSING, DONE, ERROR, STOPPED, CANCELLED } = SUBSCRIPTION_PAYMENT_STATUS
                await expectErrorByChangingStatusOfPayment({ from: ERROR, to: CREATED })
                await expectErrorByChangingStatusOfPayment({ from: ERROR, to: PROCESSING })
                await expectErrorByChangingStatusOfPayment({ from: ERROR, to: DONE })
                await expectErrorByChangingStatusOfPayment({ from: ERROR, to: STOPPED })
                await expectErrorByChangingStatusOfPayment({ from: ERROR, to: CANCELLED })
            })

            it('cannot change status from "cancelled" to any other', async () => {
                const { CREATED, PROCESSING, DONE, ERROR, STOPPED, CANCELLED } = SUBSCRIPTION_PAYMENT_STATUS
                await expectErrorByChangingStatusOfPayment({ from: CANCELLED, to: CREATED })
                await expectErrorByChangingStatusOfPayment({ from: CANCELLED, to: PROCESSING })
                await expectErrorByChangingStatusOfPayment({ from: CANCELLED, to: DONE })
                await expectErrorByChangingStatusOfPayment({ from: CANCELLED, to: ERROR })
                await expectErrorByChangingStatusOfPayment({ from: CANCELLED, to: STOPPED })
            })
        })
    })

    describe('Create', () => {
        it('can be created by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [subscription] = await createTestServiceSubscription(adminClient, organization)
            const [obj, attrs] = await createTestServiceSubscriptionPayment(adminClient, organization, subscription)
            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
            expect(parseFloat(obj.amount)).toBeCloseTo(parseFloat(attrs.amount), 2)
            expect(obj.status).toEqual(attrs.status)
            expect(obj.type).toEqual(attrs.type)
            expect(obj.organization.id).toEqual(organization.id)
            expect(obj.subscription.id).toEqual(subscription.id)
        })

        it('cannot be created by user', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [subscription] = await createTestServiceSubscription(adminClient, organization)
            const userClient = await makeClientWithRegisteredOrganization()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestServiceSubscriptionPayment(userClient, userClient.organization, subscription)
            })
        })

        it('cannot be created by anonymous', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [subscription] = await createTestServiceSubscription(adminClient, organization)
            const anonymousClient = await makeClient()
            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestServiceSubscriptionPayment(anonymousClient, organization, subscription)
            })
        })
    })

    describe('Read', () => {
        it('can be read by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [subscription] = await createTestServiceSubscription(adminClient, organization)
            const [payment, attrs] = await createTestServiceSubscriptionPayment(adminClient, organization, subscription)

            const objs = await ServiceSubscriptionPayment.getAll(adminClient, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs.length >= 1).toBeTruthy()
            const obj = objs.find(x => x.id === payment.id)
            expect(obj.id).toMatch(payment.id)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.createdAt).toMatch(payment.createdAt)
            expect(obj.updatedAt).toMatch(payment.updatedAt)
            expect(obj.type).toMatch('default')
        })

        it('can be read by user from the same organization', async () => {
            // NOTE: `registerNewOrganization` mutation creates new ServiceSubscription
            const userClient = await makeClientWithRegisteredOrganization()
            const userClientFromAnotherOrganization = await makeClientWithRegisteredOrganization()

            const adminClient = await makeLoggedInAdminClient()

            const [subscriptionOfUser] = await ServiceSubscription.getAll(adminClient, {
                organization: { id: userClient.organization.id },
            }, { sortBy: ['updatedAt_DESC'] })
            const [subscriptionPaymentOfUser] = await createTestServiceSubscriptionPayment(adminClient, userClient.organization, subscriptionOfUser)

            const [subscriptionOfUserFromAnotherOrganization] = await ServiceSubscription.getAll(adminClient, {
                organization: { id: userClientFromAnotherOrganization.organization.id },
            }, { sortBy: ['updatedAt_DESC'] })
            const [subscriptionPaymentOfUserFromAnotherOrganization] = await createTestServiceSubscriptionPayment(adminClient, userClientFromAnotherOrganization.organization, subscriptionOfUserFromAnotherOrganization)

            let objs
            objs = await ServiceSubscriptionPayment.getAll(userClient, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs).toHaveLength(1)
            expect(objs[0].id).toEqual(subscriptionPaymentOfUser.id)
            expect(objs[0].organization.id).toEqual(userClient.organization.id)

            objs = await ServiceSubscriptionPayment.getAll(userClientFromAnotherOrganization, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs).toHaveLength(1)
            expect(objs[0].id).toEqual(subscriptionPaymentOfUserFromAnotherOrganization.id)
            expect(objs[0].organization.id).toEqual(userClientFromAnotherOrganization.organization.id)
        })

        it('cannot be read by anonymous', async () => {
            const anonymousClient = await makeClient()
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [subscription] = await createTestServiceSubscription(adminClient, organization)
            await createTestServiceSubscriptionPayment(adminClient, organization, subscription)
            await expectToThrowAuthenticationErrorToObjects(async () => {
                await ServiceSubscriptionPayment.getAll(anonymousClient, {}, { sortBy: ['updatedAt_DESC'] })
            })
        })
    })

    describe('Update', () => {
        it('can be updated by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [subscription] = await createTestServiceSubscription(adminClient, organization)
            const [objCreated] = await createTestServiceSubscriptionPayment(adminClient, organization, subscription)

            const [objUpdated, attrs] = await updateTestServiceSubscriptionPayment(adminClient, objCreated.id)

            expect(objUpdated.id).toEqual(objCreated.id)
            expect(objUpdated.dv).toEqual(1)
            expect(objUpdated.sender).toEqual(attrs.sender)
            expect(objUpdated.v).toEqual(2)
            expect(objUpdated.newId).toEqual(null)
            expect(objUpdated.deletedAt).toEqual(null)
            expect(objUpdated.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(objUpdated.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(objUpdated.createdAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
            expect(objUpdated.status).toEqual(attrs.status)
            expect(objUpdated.type).toEqual(attrs.type)
            expect(parseFloat(objUpdated.amount)).toBeCloseTo(parseFloat(attrs.amount), 2)
        })

        it('cannot be updated by user', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [subscription] = await createTestServiceSubscription(adminClient, organization)
            const [objCreated] = await createTestServiceSubscriptionPayment(adminClient, organization, subscription)

            const userClient = await makeClientWithRegisteredOrganization()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestServiceSubscriptionPayment(userClient, objCreated.id)
            })
        })

        it('cannot be updated by anonymous', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [subscription] = await createTestServiceSubscription(adminClient, organization)
            const [objCreated] = await createTestServiceSubscriptionPayment(adminClient, organization, subscription)
            const anonymousClient = await makeClient()
            await expectToThrowAuthenticationErrorToObj(async () => {
                await updateTestServiceSubscriptionPayment(anonymousClient, objCreated.id)
            })
        })
    })


    describe('Delete', () => {
        it('cannot be deleted by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [subscription] = await createTestServiceSubscription(adminClient, organization)
            const [objCreated] = await createTestServiceSubscriptionPayment(adminClient, organization, subscription)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await ServiceSubscriptionPayment.delete(adminClient, objCreated.id)
            })
        })

        it('cannot be deleted by user', async () => {
            const userClient = await makeClientWithRegisteredOrganization()
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [subscription] = await createTestServiceSubscription(adminClient, organization)
            const [objCreated] = await createTestServiceSubscriptionPayment(adminClient, organization, subscription)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await ServiceSubscriptionPayment.delete(userClient, objCreated.id)
            })
        })

        it('cannot be deleted by anonymous', async () => {
            const anonymousClient = await makeClient()
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [subscription] = await createTestServiceSubscription(adminClient, organization)
            const [objCreated] = await createTestServiceSubscriptionPayment(adminClient, organization, subscription)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await ServiceSubscriptionPayment.delete(anonymousClient, objCreated.id)
            })
        })
    })
})
