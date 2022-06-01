/**
 * Generated by `createschema ticket.ExportTicketTask 'status:Select:processing,completed,error; format:Select:excel; exportedRecordsCount:Integer; totalRecordsCount:Integer; file?:File; meta?:Json'`
 */

const { Text, Relationship, Integer, Select, Checkbox, DateTimeUtc, CalendarDay, Decimal, Password, File, Url } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')
const access = require('@condo/domains/ticket/access/ExportTicketTask')
const { EXPORT_STATUS_VALUES, EXPORT_FORMAT_VALUES } = require('@condo/domains/common/constants/export')
const FileAdapter = require('@condo/domains/common/utils/fileAdapter')

const TICKET_EXPORT_TASK_FOLDER_NAME = 'ticketExport'
const Adapter = new FileAdapter(TICKET_EXPORT_TASK_FOLDER_NAME)

const ExportTicketTask = new GQLListSchema('ExportTicketTask', {
    schemaDoc: 'Stores requested export format, status of export job, link to exported file and information about progress of export job',
    fields: {

        status: {
            schemaDoc: 'Status of export job',
            type: Select,
            options: EXPORT_STATUS_VALUES,
            isRequired: true,
        },

        format: {
            schemaDoc: 'Requested export file format',
            type: Select,
            options: EXPORT_FORMAT_VALUES,
            isRequired: true,
        },

        exportedRecordsCount: {
            schemaDoc: 'How many records at the moment are exported',
            type: Integer,
            isRequired: true,
            defaultValue: 0,
        },

        totalRecordsCount: {
            schemaDoc: 'Total records to export. Can be unknown due to implementation specifics',
            type: Integer,
            isRequired: false,
            defaultValue: 0,
        },

        file: {
            schemaDoc: 'Link to exported file',
            type: File,
            adapter: Adapter,
        },

        meta: {
            schemaDoc: 'Stores information about query and ids of exported and failed records',
            type: Json,
        },

        where: {
            schemaDoc: 'Filtering conditions for records to export',
            type: Json,
            isRequired: true,
            // TODO(antonal): add validation by reusing `TicketWhereInput` as a GraphQL type
        },

        sortBy: {
            schemaDoc: 'Sorting parameters for records to export',
            type: Json,
            isRequired: true,
            // TODO(antonal): add validation by reusing `SortTicketsBy` as a GraphQL type
        },

        locale: {
            schemaDoc: 'Requested export locale, in that the resulting file will be rendered',
            type: Text,
            isRequired: true,
        },

        timeZone: {
            schemaDoc: 'To requested timeZone all datetime fields will be converted',
            type: Text,
            isRequired: true,
        },

        user: {
            schemaDoc: 'User that requested this exporting operation. Will be used for read access checks to display all exported tasks somewhere and to display progress indicator of ongoing exporting task for current user',
            type: 'Relationship',
            ref: 'User',
            isRequired: false,
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadExportTicketTasks,
        create: access.canManageExportTicketTasks,
        update: access.canManageExportTicketTasks,
        delete: false,
        auth: true,
    },
})

module.exports = {
    ExportTicketTask,
}
