/**
 * Generated by `createschema miniapp.B2CAppAccessRight 'user:Relationship:User:PROTECT; app:Relationship:B2CApp:PROTECT;'`
 */

import {
    B2CAppAccessRight,
    B2CAppAccessRightCreateInput,
    B2CAppAccessRightUpdateInput,
    QueryAllB2CAppAccessRightsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { B2CAppAccessRight as B2CAppAccessRightGQL } from '@condo/domains/miniapp/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<B2CAppAccessRight, B2CAppAccessRightCreateInput, B2CAppAccessRightUpdateInput, QueryAllB2CAppAccessRightsArgs>(B2CAppAccessRightGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
