/**
 * Generated by `createschema contact.ContactRole 'name:Text'`
 */
import {
    ContactRole,
    ContactRoleCreateInput,
    ContactRoleUpdateInput,
    QueryAllContactRolesArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { ContactRole as ContactRoleGQL } from '@condo/domains/contact/gql'

const convertGQLItemToFormSelectState = (item: ContactRole) => {
    if (!item) {
        return
    }
    const { name, id } = item

    return { value: id, label: name }
}

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
    convertGQLItemToFormSelectState,
}
