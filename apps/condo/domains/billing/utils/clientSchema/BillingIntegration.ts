/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 */

import {
    BillingIntegration,
    BillingIntegrationCreateInput,
    BillingIntegrationUpdateInput,
    QueryAllBillingIntegrationsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { BillingIntegration as BillingIntegrationGQL } from '@condo/domains/billing/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<BillingIntegration, BillingIntegrationCreateInput, BillingIntegrationUpdateInput, QueryAllBillingIntegrationsArgs>(BillingIntegrationGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
