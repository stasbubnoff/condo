/**
 * Generated by `createschema ticket.TicketProblemClassifier 'organization?:Relationship:Organization:CASCADE;name:Text;'`
 */

import {
    TicketProblemClassifier,
    TicketProblemClassifierCreateInput,
    TicketProblemClassifierUpdateInput,
    QueryAllTicketProblemClassifiersArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { TicketProblemClassifier as TicketProblemClassifierGQL } from '@condo/domains/ticket/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<TicketProblemClassifier, TicketProblemClassifierCreateInput, TicketProblemClassifierUpdateInput, QueryAllTicketProblemClassifiersArgs>(TicketProblemClassifierGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
