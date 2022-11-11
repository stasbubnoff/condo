/**
 * Generated by `createschema miniapp.B2CAppBuild 'app:Relationship:B2CApp:PROTECT; version:Text'`
 */

import {
    B2CAppBuild,
    B2CAppBuildCreateInput,
    B2CAppBuildUpdateInput,
    QueryAllB2CAppBuildsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { B2CAppBuild as B2CAppBuildGQL } from '@condo/domains/miniapp/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<B2CAppBuild, B2CAppBuildCreateInput, B2CAppBuildUpdateInput, QueryAllB2CAppBuildsArgs>(B2CAppBuildGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
