/**
 * Generated by `createservice analytics.GetExternalReportIframeUrlService`
 */

const { makeLoggedInAdminClient, makeClient } = require('@open-condo/keystone/test.utils')
const { registerNewOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const faker = require('faker')
const { makeClientWithRegisteredOrganization } = require('@condo/domains/organization/utils/testSchema')
const { expectToThrowAccessDeniedErrorToResult, expectToThrowAuthenticationErrorToResult } = require('@open-condo/keystone/test.utils')

const testIfConfigExists = process.env.METABASE_CONFIG ? test : test.skip

describe('GetExternalReportIframeUrlService', () => {
    describe('metabase report type', () => {
        testIfConfigExists('admin: can query', async () => {
            const { getExternalReportIframeUrlByTestClient, createTestExternalReport } = require('@condo/domains/analytics/utils/testSchema')
            const admin = await makeLoggedInAdminClient()
            const [organization] = await registerNewOrganization(admin)
            admin.organization = organization

            const [obj] = await createTestExternalReport(admin, { meta: { dashboard: faker.datatype.number() } })

            const [data] = await getExternalReportIframeUrlByTestClient(admin, {
                id: obj.id, organizationId: organization.id,
            })

            expect(data.title).toEqual(obj.title)
            expect(data.iframeUrl).toContain(JSON.parse(process.env.METABASE_CONFIG).url)
        })

        testIfConfigExists('user: can query report from it\'s organization', async () => {
            const { getExternalReportIframeUrlByTestClient, createTestExternalReport } = require('@condo/domains/analytics/utils/testSchema')
            const admin = await makeLoggedInAdminClient()
            const client = await makeClientWithRegisteredOrganization()

            const [obj] = await createTestExternalReport(admin, {
                meta: { dashboard: faker.datatype.number() },
                organization: { connect: { id: client.organization.id } },
            })

            const [data] = await getExternalReportIframeUrlByTestClient(client, {
                id: obj.id, organizationId: client.organization.id,
            })

            expect(data).toHaveProperty('title', obj.title)
            expect(data).toHaveProperty('iframeUrl')
            expect(data.iframeUrl).toContain(JSON.parse(process.env.METABASE_CONFIG).url)
        })

        test('user: can\'t query report from another organizations ', async () => {
            const { getExternalReportIframeUrlByTestClient, createTestExternalReport } = require('@condo/domains/analytics/utils/testSchema')
            const admin = await makeLoggedInAdminClient()
            const client = await makeClientWithRegisteredOrganization()
            const anotherClient = await makeClientWithRegisteredOrganization()

            const [obj] = await createTestExternalReport(admin, {
                meta: { dashboard: faker.datatype.number() },
                organization: { connect: { id: anotherClient.organization.id } },
            })

            await expectToThrowAccessDeniedErrorToResult(async () => {
                await getExternalReportIframeUrlByTestClient(client, {
                    id: obj.id, organizationId: client.organization.id,
                })

            })
        })

        testIfConfigExists('user: can query public report (without organization set)', async () => {
            const { getExternalReportIframeUrlByTestClient, createTestExternalReport } = require('@condo/domains/analytics/utils/testSchema')
            const admin = await makeLoggedInAdminClient()
            const client = await makeClientWithRegisteredOrganization()
            const [obj] = await createTestExternalReport(admin, { meta: { dashboard: faker.datatype.number() } })

            const [data] = await getExternalReportIframeUrlByTestClient(client, {
                id: obj.id, organizationId: client.organization.id,
            })

            expect(data.title).toEqual(obj.title)
            expect(data.iframeUrl).toContain(JSON.parse(process.env.METABASE_CONFIG).url)
        })

        test('anonymous: can\'t query', async () => {
            const { getExternalReportIframeUrlByTestClient, createTestExternalReport } = require('@condo/domains/analytics/utils/testSchema')
            const admin = await makeLoggedInAdminClient()
            const client = await makeClientWithRegisteredOrganization()
            const anonymousClient = await makeClient()

            const [obj] = await createTestExternalReport(admin, { meta: { dashboard: faker.datatype.number() } })

            await expectToThrowAuthenticationErrorToResult(async () => {
                await getExternalReportIframeUrlByTestClient(anonymousClient, {
                    id: obj.id,
                    organizationId: client.organization.id,
                })
            })
        })

    })

})
