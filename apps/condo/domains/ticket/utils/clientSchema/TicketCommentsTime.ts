/**
 * Generated by `createschema ticket.TicketCommentsTime 'organization:Relationship:Organization:CASCADE; ticket:Relationship:Ticket:CASCADE; lastCommentAt:DateTimeUtc; lastResidentCommentAt:DateTimeUtc;'`
 */

import {
    TicketCommentsTime,
    TicketCommentsTimeCreateInput,
    TicketCommentsTimeUpdateInput,
    QueryAllTicketCommentsTimesArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { TicketCommentsTime as TicketCommentsTimeGQL } from '@condo/domains/ticket/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<TicketCommentsTime, TicketCommentsTimeCreateInput, TicketCommentsTimeUpdateInput, QueryAllTicketCommentsTimesArgs>(TicketCommentsTimeGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
