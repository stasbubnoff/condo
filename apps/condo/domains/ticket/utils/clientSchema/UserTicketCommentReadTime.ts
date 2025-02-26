/**
 * Generated by `createschema ticket.UserTicketCommentReadTime 'user:Relationship:User:CASCADE; ticket:Relationship:Ticket:CASCADE; readResidentCommentAt:DateTimeUtc;'`
 */

import {
    UserTicketCommentReadTime,
    UserTicketCommentReadTimeCreateInput,
    UserTicketCommentReadTimeUpdateInput,
    QueryAllUserTicketCommentReadTimesArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { UserTicketCommentReadTime as UserTicketCommentReadTimeGQL } from '@condo/domains/ticket/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<UserTicketCommentReadTime, UserTicketCommentReadTimeCreateInput, UserTicketCommentReadTimeUpdateInput, QueryAllUserTicketCommentReadTimesArgs>(UserTicketCommentReadTimeGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
