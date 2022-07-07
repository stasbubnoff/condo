/**
 * Generated by `createschema division.Division 'name:Text; organization:Relationship:Organization:CASCADE; responsible:Relationship:OrganizationEmployee:PROTECT;'`
 */

import { pick, get, map, difference } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'
import { generateNewReactHooks } from '@condo/domains/common/utils/codegeneration/new.generate.hooks'

import { Division as DivisionGQL } from '@condo/domains/division/gql'
import {
    Division,
    DivisionCreateInput,
    DivisionUpdateInput,
    OrganizationEmployee,
    Property,
    QueryAllDivisionsArgs,
} from '@app/condo/schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'name', 'organization', 'responsible', 'executors', 'properties']
const RELATIONS = ['organization', 'properties', 'responsible', 'executors']

export interface IDivisionUIState extends Division {
    id: string
    responsible: OrganizationEmployee
    properties: Property[]
    executors: OrganizationEmployee[]
}

function convertToUIState (item: Division): IDivisionUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IDivisionUIState
}

export interface IDivisionFormState {
    organization?: string
    properties?: string[]
    responsible?: string[]
    executors?: string[]
}

function convertToUIFormState (state: IDivisionUIState): IDivisionFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        if (RELATIONS.includes(attr)) {
            if (Array.isArray(state[attr])) {
                result[attr] = map(state[attr], 'id')
            } else {
                const attrId = get(state[attr], 'id')
                result[attr] = attrId || state[attr]
            }
        } else {
            result[attr] = state[attr]
        }
    }
    return result as IDivisionFormState
}

// TODO(antonal): move this type into `generate.hooks`
type RelateToManyInput = {
    connect?: { id: any }[],
    disconnect?: { id: any }[],
}

// TODO(antonal): move this function into `generate.hooks` and use it everywhere, since no extra logic is introduced in each duplicate of this function
/**
 * Converts form values of form into GraphQL `…UpdateInput` shape
 * @param state - form values
 * @param obj - existing object from `useObjects`, that will be passed in case of update operation by `useUpdate` and `useSoftDelete` hooks
 */
export function convertToGQLInput (state: IDivisionFormState, obj?: IDivisionUIState): DivisionUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        if (RELATIONS.includes(attr)) {
            if (Array.isArray(state[attr])) {
                const newIds = map(state[attr], item => get(item, 'id') || item)
                if (obj) { // update operation
                    const oldIds = map(obj[attr], item => get(item, 'id') || item)
                    const changes: RelateToManyInput = {}
                    const idsToConnect = difference(newIds, oldIds)
                    if (idsToConnect.length > 0) {
                        changes.connect = map(idsToConnect, id => ({ id }))
                    }
                    const idsToDisconnect = difference(oldIds, newIds)
                    if (idsToDisconnect.length > 0) {
                        changes.disconnect = map(idsToDisconnect, id => ({ id }))
                    }
                    if (Object.keys(changes).length > 0) {
                        result[attr] = changes
                    }
                } else { // create operation
                    if (newIds.length > 0) {
                        result[attr] = {
                            connect: map(newIds, id => ({ id })),
                        }
                    }
                }
            } else {
                const newAttrId = get(state[attr], 'id') || state[attr]
                if (obj) { // update operation
                    const oldAttrId = get(obj[attr], 'id') || obj[attr]
                    if (newAttrId && oldAttrId && newAttrId !== oldAttrId) {
                        result[attr] = { connect: { id: newAttrId } }
                    } else if (!newAttrId) {
                        result[attr] = { disconnectAll: true }
                    }
                } else { // create operation
                    if (newAttrId) {
                        result[attr] = { connect: { id: newAttrId } }
                    }
                }

            }
        } else {
            result[attr] = state[attr]
        }
    }
    return result
}

function extractAttributes (state: IDivisionUIState, attributes: Array<string>): IDivisionUIState | undefined {
    const result = {}
    attributes.forEach((attribute) => {
        if (RELATIONS.includes(attribute)) {
            result[attribute] = get(state, [attribute, 'name'])
        } else {
            result[attribute] = get(state, attribute)
        }
    })
    return result as IDivisionUIState
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    useSoftDelete,
} = generateReactHooks<Division, DivisionUpdateInput, IDivisionFormState, IDivisionUIState, QueryAllDivisionsArgs>(DivisionGQL, { convertToGQLInput, convertToUIState })
const {
    useNewObject,
    useNewObjects,
    useNewCreate,
    useNewUpdate,
    useNewSoftDelete,
} = generateNewReactHooks<Division, DivisionCreateInput, DivisionUpdateInput, QueryAllDivisionsArgs>(DivisionGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    useSoftDelete,
    convertToUIFormState,
    extractAttributes,
    useNewObject,
    useNewObjects,
    useNewCreate,
    useNewUpdate,
    useNewSoftDelete,
}
