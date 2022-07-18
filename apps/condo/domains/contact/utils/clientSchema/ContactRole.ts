/**
 * Generated by `createschema contact.ContactRole 'name:Text'`
 */
import {
    ContactRole,
    ContactRoleCreateInput,
    ContactRoleUpdateInput,
    QueryAllContactRolesArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'
import { ContactRole as ContactRoleGQL } from '@condo/domains/contact/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<ContactRole, ContactRoleCreateInput, ContactRoleUpdateInput, QueryAllContactRolesArgs>(ContactRoleGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
