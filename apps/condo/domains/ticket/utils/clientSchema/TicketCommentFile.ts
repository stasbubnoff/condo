/**
 * Generated by `createschema ticket.TicketCommentFile 'organization:Relationship:Organization:CASCADE;file?:File;ticketComment?:Relationship:TicketComment:SET_NULL'`
 */

import {
    TicketCommentFile,
    TicketCommentFileCreateInput,
    TicketCommentFileUpdateInput,
    QueryAllTicketCommentFilesArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { TicketCommentFile as TicketCommentFileGQL } from '@condo/domains/ticket/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<TicketCommentFile, TicketCommentFileCreateInput, TicketCommentFileUpdateInput, QueryAllTicketCommentFilesArgs>(TicketCommentFileGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
