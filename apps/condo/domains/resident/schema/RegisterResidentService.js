/**
 * Generated by `createservice property.RegisterResidentService --type mutations`
 */

const { getById, GQLCustomSchema } = require('@core/keystone/schema')
const access = require('../access/RegisterResidentService')
const { Resident } = require('../utils/serverSchema/index')
const { Property } = require('@condo/domains/property/utils/serverSchema')
const { Resident: ResidentAPI } = require('../utils/serverSchema')


const RegisterResidentService = new GQLCustomSchema('RegisterResidentService', {
    types: [
        {
            access: true,
            type: 'input RegisterResidentInput { dv: Int!, sender: JSON!, address: String!, addressMeta: JSON!, unitName: String! }',
        },
    ],
    
    mutations: [
        {
            access: access.canRegisterResident,
            schema: 'registerResident(data: RegisterResidentInput!): Resident',
            resolver: async (parent, args, context) => {
                const { data: { dv, sender, address, addressMeta, unitName } } = args
                const attrs = {
                    dv,
                    sender,
                    address,
                    addressMeta,
                    unitName,
                    user: { connect: { id: context.authedItem.id } },
                }
                const [existingResident] = await ResidentAPI.getAll(context, {
                    address,
                    unitName,
                    user: { id: context.authedItem.id },
                })
                let id
                if (existingResident) {
                    await ResidentAPI.update(context, existingResident.id, {
                        deletedAt: null,
                    })
                    id = existingResident.id
                } else {
                    const [property] = await Property.getAll(context, { address })
                    if (property) {
                        attrs.property = { connect: { id: property.id } }
                        attrs.organization = { connect: { id: property.organization.id } }
                    }
                    const resident = await Resident.create(context, attrs)
                    id = resident.id
                }
                // Hack that helps to resolve all subfields in result of this mutation
                return await getById('Resident', id)
            },
        },
    ],
    
})

module.exports = {
    RegisterResidentService,
}
