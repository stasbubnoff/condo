/**
 * Generated by `createschema ticket.TicketPlaceClassifier 'organization?:Relationship:Organization:CASCADE;name:Text;'`
 */

import {
    TicketPlaceClassifier,
    TicketPlaceClassifierCreateInput,
    TicketPlaceClassifierUpdateInput,
    QueryAllTicketPlaceClassifiersArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { TicketPlaceClassifier as TicketPlaceClassifierGQL } from '@condo/domains/ticket/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<TicketPlaceClassifier, TicketPlaceClassifierCreateInput, TicketPlaceClassifierUpdateInput, QueryAllTicketPlaceClassifiersArgs>(TicketPlaceClassifierGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
