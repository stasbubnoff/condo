/**
 * Generated by `createschema user.ConfirmPhoneAction 'phone:Text;token:Text;smsCode:Integer;smsCodeRequestedAt:DateTimeUtc;smsCodeExpiresAt:DateTimeUtc;retries:Integer;isPhoneVerified:Checkbox;requestedAt:DateTimeUtc;expiresAt:DateTimeUtc;completedAt:DateTimeUtc;'`
 */

import {
    ConfirmPhoneAction,
    ConfirmPhoneActionCreateInput,
    ConfirmPhoneActionUpdateInput,
    QueryAllConfirmPhoneActionsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { ConfirmPhoneAction as ConfirmPhoneActionGQL } from '@condo/domains/user/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<ConfirmPhoneAction, ConfirmPhoneActionCreateInput, ConfirmPhoneActionUpdateInput, QueryAllConfirmPhoneActionsArgs>(ConfirmPhoneActionGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
