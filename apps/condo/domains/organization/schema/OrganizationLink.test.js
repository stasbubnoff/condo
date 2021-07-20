/**
 * Generated by `createschema organization.OrganizationLink 'from:Relationship:Organization:CASCADE; to:Relationship:Organization:SET_NULL;'`
 */

const { Ticket } = require('../../ticket/utils/testSchema')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestTicket } = require('@condo/domains/ticket/utils/testSchema')
const { createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { createTestOrganizationEmployeeRole } = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganization } = require('../utils/testSchema')
const { makeLoggedInAdminClient, makeClient, UUID_RE } = require('@core/keystone/test.utils')
const { createTestOrganizationLink, updateTestOrganizationLink } = require('@condo/domains/organization/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObj } = require('../../common/utils/testSchema')

describe('OrganizationLink', () => {
    test('admin: can create OrganizationLink', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [organizationTo] = await createTestOrganization(admin)
        const [obj] = await createTestOrganizationLink(admin, organizationFrom, organizationTo)

        expect(obj.id).toMatch(UUID_RE)
    })

    test('admin: can update OrganizationLink', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [organizationTo1] = await createTestOrganization(admin)
        const [organizationTo2] = await createTestOrganization(admin)
        const [link] = await createTestOrganizationLink(admin, organizationFrom, organizationTo1)

        const [updatedLink] = await updateTestOrganizationLink(admin, link.id, {
            to: { connect: { id: organizationTo2.id } },
        })

        expect(updatedLink.to.id).toEqual(organizationTo2.id)
    })

    test('user: create OrganizationLink', async () => {
        const admin = await makeLoggedInAdminClient()
        const user = await makeClientWithNewRegisteredAndLoggedInUser()
        const [organizationFrom] = await createTestOrganization(admin)
        const [organizationTo] = await createTestOrganization(admin)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestOrganizationLink(user, organizationFrom, organizationTo)
        })
    })

    test('anonymous: create OrganizationLink', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [organizationTo] = await createTestOrganization(admin)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestOrganizationLink(client, organizationFrom, organizationTo)
        })
    })

    test('employee from "from" organization: can read tickets from "to" organizations', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom)
        const clientFrom = await makeClientWithNewRegisteredAndLoggedInUser()
        await createTestOrganizationEmployee(admin, organizationFrom, clientFrom.user, role)

        const [organizationTo1] = await createTestOrganization(admin)
        const [organizationTo2] = await createTestOrganization(admin)
        const [propertyTo1] = await createTestProperty(admin, organizationTo1)
        const [propertyTo2] = await createTestProperty(admin, organizationTo2)
        await createTestTicket(admin, organizationTo1, propertyTo1)
        await createTestTicket(admin, organizationTo2, propertyTo2)

        await createTestOrganizationLink(admin, organizationFrom, organizationTo1)
        await createTestOrganizationLink(admin, organizationFrom, organizationTo2)

        const tickets = await Ticket.getAll(clientFrom, { organization: { OR: [{ id: organizationTo1.id }, { id: organizationTo2.id }] } })
        expect(tickets).toHaveLength(2)
    })

    test('employee from "to" organization: cannot read tickets from "from" organization', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [propertyFrom] = await createTestProperty(admin, organizationFrom)
        await createTestTicket(admin, organizationFrom, propertyFrom)

        const [organizationTo] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom)
        const clientTo = await makeClientWithNewRegisteredAndLoggedInUser()
        await createTestOrganizationEmployee(admin, organizationTo, clientTo.user, role)

        await createTestOrganizationLink(admin, organizationFrom, organizationTo)

        const tickets = await Ticket.getAll(clientTo, { organization: { id: organizationFrom.id } })
        expect(tickets).toHaveLength(0)
    })

    test('employee from "from" organization: cannot check not its own "to" organizations', async () => {
        const admin = await makeLoggedInAdminClient()

        const [organizationFrom1] = await createTestOrganization(admin)
        const [role1] = await createTestOrganizationEmployeeRole(admin, organizationFrom1)
        const clientFrom1 = await makeClientWithNewRegisteredAndLoggedInUser()
        await createTestOrganizationEmployee(admin, organizationFrom1, clientFrom1.user, role1)

        const [organizationFrom2] = await createTestOrganization(admin)
        const clientFrom2 = await makeClientWithNewRegisteredAndLoggedInUser()
        const [role2] = await createTestOrganizationEmployeeRole(admin, organizationFrom1)
        await createTestOrganizationEmployee(admin, organizationFrom2, clientFrom2.user, role2)

        const [organizationTo] = await createTestOrganization(admin)
        const [propertyTo1] = await createTestProperty(admin, organizationTo)
        await createTestTicket(admin, organizationTo, propertyTo1)

        await createTestOrganizationLink(admin, organizationFrom1, organizationTo)
        await createTestOrganizationLink(admin, organizationFrom2, organizationFrom1)

        const tickets2 = await Ticket.getAll(clientFrom2, { organization: { id: organizationTo.id } })
        expect(tickets2).toHaveLength(0)
    })
})
