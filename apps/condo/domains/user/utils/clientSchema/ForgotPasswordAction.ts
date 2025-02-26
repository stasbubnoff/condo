/**
 * Generated by `createschema user.ForgotPasswordAction 'user:Relationship:User:CASCADE; token:Text; requestedAt:DateTimeUtc; expiresAt:DateTimeUtc; usedAt:DateTimeUtc;'`
 */

import {
    ForgotPasswordAction,
    ForgotPasswordActionCreateInput,
    ForgotPasswordActionUpdateInput,
    QueryAllForgotPasswordActionsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { ForgotPasswordAction as ForgotPasswordActionGQL } from '@condo/domains/user/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<ForgotPasswordAction, ForgotPasswordActionCreateInput, ForgotPasswordActionUpdateInput, QueryAllForgotPasswordActionsArgs>(ForgotPasswordActionGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
