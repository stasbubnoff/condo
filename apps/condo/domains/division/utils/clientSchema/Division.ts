/**
 * Generated by `createschema division.Division 'name:Text; organization:Relationship:Organization:CASCADE; responsible:Relationship:OrganizationEmployee:PROTECT;'`
 */

import { get, map, omit } from 'lodash'
import {
    Division,
    DivisionCreateInput,
    DivisionUpdateInput,
    QueryAllDivisionsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { Division as DivisionGQL } from '@condo/domains/division/gql'

export interface IDivisionFormState {
    organization?: string
    properties?: string[]
    responsible?: string
    executors?: string[]
}

function convertToFormState (division: Division): IDivisionFormState | undefined {
    if (!division) return
    const result: IDivisionFormState = {}
    for (const key of Object.keys(division)) {
        if (Array.isArray(division[key])) {
            const relationIds = map(division[key], 'id')
            result[key] = relationIds.every(Boolean) ? relationIds : division[key]
        } else {
            const relationId = get(division[key], 'id')
            result[key] = relationId || division[key]
        }
    }

    return result
}

function formValuesProcessor (formValues: IDivisionFormState): DivisionCreateInput | DivisionUpdateInput {
    const input: DivisionCreateInput | DivisionUpdateInput = omit(formValues, ['organization', 'properties', 'responsible', 'executors'])
    if (formValues['organization']) {
        input['organization'] = { connect: { id: formValues['organization'] } }
    }
    if (formValues['properties'] && Array.isArray(formValues['properties'])) {
        input['properties'] = {
            disconnectAll: true,
            connect: formValues['properties'].map(id => ({ id })),
        }
    }
    if (formValues['responsible']) {
        input['responsible'] = { connect: { id: formValues['responsible'] } }
    }
    if (formValues['executors'] && Array.isArray(formValues['executors'])) {
        input['executors'] = {
            disconnectAll: true,
            connect: formValues['executors'].map(id => ({ id })),
        }
    }

    return input
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<Division, DivisionCreateInput, DivisionUpdateInput, QueryAllDivisionsArgs>(DivisionGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    convertToFormState,
    formValuesProcessor,
}
