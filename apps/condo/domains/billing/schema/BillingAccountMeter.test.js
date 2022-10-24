/**
 * Generated by `createschema billing.BillingAccountMeter 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; account:Relationship:BillingAccount:CASCADE; resource:Relationship:BillingMeterResource:PROTECT; raw:Json; meta:Json'`
 */

const { createTestBillingIntegrationOrganizationContext } = require('@condo/domains/billing/utils/testSchema')
const { makeOrganizationIntegrationManager } = require('@condo/domains/billing/utils/testSchema')
const { makeContextWithOrganizationAndIntegrationAsAdmin } = require('@condo/domains/billing/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { createTestBillingMeterResource } = require('@condo/domains/billing/utils/testSchema')
const { createTestBillingAccount } = require('@condo/domains/billing/utils/testSchema')
const { createTestBillingProperty } = require('@condo/domains/billing/utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@condo/keystone/test.utils')
const { BillingAccountMeter, createTestBillingAccountMeter, updateTestBillingAccountMeter } = require('@condo/domains/billing/utils/testSchema')
const {
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAuthenticationErrorToObj,
    expectToThrowGraphQLRequestError,
    expectToThrowValidationFailureError,
} = require('@condo/domains/common/utils/testSchema')
const { UNEQUAL_CONTEXT_ERROR } = require('@condo/domains/common/constants/errors')

describe('BillingAccountMeter', () => {
    test('admin: create BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [obj] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        expect(obj.context.id).toEqual(context.id)
        expect(obj.property.id).toEqual(property.id)
        expect(obj.resource.id).toEqual(resource.id)
    })

    test('organization integration manager: create BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestBillingAccountMeter(managerUserClient, context, property, billingAccount, resource)
        })
    })

    test('user: create BillingAccountMeter', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestBillingAccountMeter(client, context, property, billingAccount, resource)
        })
    })

    test('anonymous: create BillingAccountMeter', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)

        await expectToThrowAuthenticationErrorToObj(async () => {
            await createTestBillingAccountMeter(client, context, property, billingAccount, resource)
        })
    })

    test('admin: read BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)
        const objs = await BillingAccountMeter.getAll(admin, { id: billingAccountMeter.id })

        expect(objs).toHaveLength(1)
    })

    test('organization integration manager: read BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        const objs = await BillingAccountMeter.getAll(managerUserClient, { id: billingAccountMeter.id })

        expect(objs).toHaveLength(1)
    })

    test('user: read BillingAccountMeter', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        const objs = await BillingAccountMeter.getAll(client, { id: billingAccountMeter.id })
        expect(objs).toHaveLength(0)
    })

    test('anonymous: read BillingAccountMeter', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        await expectToThrowAuthenticationErrorToObjects(async () => {
            await BillingAccountMeter.getAll(client, { id: billingAccountMeter.id })
        })
    })

    test('admin: update BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)
        const payload = {
            raw: '123',
        }
        const [objUpdated] = await updateTestBillingAccountMeter(admin, billingAccountMeter.id, payload)

        expect(objUpdated.id).toEqual(billingAccountMeter.id)
        expect(objUpdated.raw).toEqual('123')
    })

    test('organization integration manager: update BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)
        const payload = {
            raw: '123',
        }

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestBillingAccountMeter(managerUserClient, billingAccountMeter.id, payload)
        })
    })

    test('user: update BillingAccountMeter', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        const payload = {}
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestBillingAccountMeter(client, billingAccountMeter.id, payload)
        })
    })

    test('anonymous: update BillingAccountMeter', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        const payload = {}
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestBillingAccountMeter(client, billingAccountMeter.id, payload)
        })
    })

    test('admin: delete BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingAccountMeter.delete(admin, billingAccountMeter.id)
        })
    })

    test('organization integration manager: delete BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingAccountMeter.delete(managerUserClient, billingAccountMeter.id)
        })
    })

    test('user: delete BillingAccountMeter', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingAccountMeter.delete(client, billingAccountMeter.id)
        })
    })

    test('anonymous: delete BillingAccountMeter', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingAccountMeter.delete(client, billingAccountMeter.id)
        })
    })

    describe('Validation tests', async () => {
        test('Context field cannot be changed', async () => {
            const { context, admin } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const { context: anotherContext } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const [account] = await createTestBillingAccount(admin, context, property)
            const [resource] = await createTestBillingMeterResource(admin)
            const [accountMeter] = await createTestBillingAccountMeter(admin, context, property, account, resource)
            await expectToThrowGraphQLRequestError(async () => {
                await updateTestBillingAccountMeter(admin, accountMeter.id, {
                    context: { connect: { id: anotherContext.id } },
                })
            }, 'Field "context" is not defined')
        })
        test('Context and contexts from "account" and "property" fields must be equal', async () => {
            const { context, admin } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const { context: anotherContext } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const [anotherProperty] = await createTestBillingProperty(admin, anotherContext)
            const [account] = await createTestBillingAccount(admin, context, property)
            const [anotherAccount] = await createTestBillingAccount(admin, anotherContext, anotherProperty)
            const [resource] = await createTestBillingMeterResource(admin)
            const [accountMeter] = await createTestBillingAccountMeter(admin, context, property, account, resource)
            await expectToThrowValidationFailureError(async () => {
                await updateTestBillingAccountMeter(admin, accountMeter.id, {
                    account: { connect: { id: anotherAccount.id } },
                })
            }, `${UNEQUAL_CONTEXT_ERROR}:account:context] Context is not equal to account.context`)
            await expectToThrowValidationFailureError(async () => {
                await updateTestBillingAccountMeter(admin, accountMeter.id, {
                    property: { connect: { id: anotherProperty.id } },
                })
            }, `${UNEQUAL_CONTEXT_ERROR}:property:context] Context is not equal to property.context`)
        })
    })
})
