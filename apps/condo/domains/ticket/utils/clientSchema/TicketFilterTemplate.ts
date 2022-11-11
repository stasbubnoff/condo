/**
 * Generated by `createschema ticket.TicketFilterTemplate 'name:Text; employee:Relationship:OrganizationEmployee:CASCADE; filters:Json'`
 */

import {
    TicketFilterTemplate,
    TicketFilterTemplateCreateInput,
    TicketFilterTemplateUpdateInput,
    QueryAllTicketFilterTemplatesArgs } from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { TicketFilterTemplate as TicketFilterTemplateGQL } from '@condo/domains/ticket/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<TicketFilterTemplate, TicketFilterTemplateCreateInput, TicketFilterTemplateUpdateInput, QueryAllTicketFilterTemplatesArgs>(TicketFilterTemplateGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
