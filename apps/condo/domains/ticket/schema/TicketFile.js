/**
 * Generated by `createschema ticket.TicketFile 'organization:Text;file?:File;ticket?:Relationship:Ticket:SET_NULL;'`
 */
const { Relationship, File } = require('@keystonejs/fields')
const { GQLListSchema } = require('@open-condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const access = require('@condo/domains/ticket/access/TicketFile')

const FileAdapter = require('@condo/domains/common/utils/fileAdapter')
const { getFileMetaAfterChange } = require('@condo/domains/common/utils/fileAdapter')
const { addOrganizationFieldPlugin } = require('@condo/domains/organization/schema/plugins/addOrganizationFieldPlugin')

const TICKET_FILE_FOLDER_NAME = 'ticket'
const Adapter = new FileAdapter(TICKET_FILE_FOLDER_NAME)
const fileMetaAfterChange = getFileMetaAfterChange(Adapter)

// TODO(zuch): find a way to upload images in jest tests
// and make file field required
const TicketFile = new GQLListSchema('TicketFile', {
    schemaDoc: 'File attached to the ticket',
    fields: {
        file: {
            schemaDoc: 'File object with meta information and publicUrl',
            type: File,
            adapter: Adapter,
            isRequired: false,
        },
        ticket: {
            schemaDoc: 'Link to ticket',
            type: Relationship,
            ref: 'Ticket',
            many: false,
            isRequired: false,
            knexOptions: { isNotNullable: false }, // ticketFile can be without ticket on create (temporary)
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },
    },
    hooks: {
        afterChange: fileMetaAfterChange,
        afterDelete: async ({ existingItem }) => {
            if (existingItem.file) {
                await Adapter.delete(existingItem.file)
            }
        },
    },
    plugins: [
        addOrganizationFieldPlugin({ fromField: 'ticket' }),
        uuided(),
        versioned(),
        tracked(),
        softDeleted(),
        dvAndSender(),
        historical(),
    ],
    access: {
        read: access.canReadTicketFiles,
        create: access.canManageTicketFiles,
        update: access.canManageTicketFiles,
        delete: false,
        auth: true,
    },
})

module.exports = {
    TicketFile,
}
