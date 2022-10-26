/**
 * Generated by `createservice user.SendMessageToSupportService`
 */

const { GQLCustomSchema } = require('@condo/keystone/schema')
const access = require('@condo/domains/user/access/SendMessageToSupportService')
const { sendMessage } = require('@condo/domains/notification/utils/serverSchema')
const { MESSAGE_FORWARDED_TO_SUPPORT_TYPE } = require('@condo/domains/notification/constants/constants')
const { get } = require('lodash')
const conf = require('@condo/config')
const { LOCALES } = require('@condo/domains/common/constants/locale')
const { Resident, ServiceConsumer } = require('@condo/domains/resident/utils/serverSchema')
const FileAdapter = require('@condo/domains/common/utils/fileAdapter')
const { v4: uuid } = require('uuid')
const dayjs = require('dayjs')
const { normalizeEmail } = require('@condo/domains/common/utils/mail')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@condo/keystone/errors')
const { WRONG_FORMAT } = require('@condo/domains/common/constants/errors')

const SUPPORT_EMAIL_MOBILE = conf['HELP_REQUISITES'] && get(JSON.parse(conf['HELP_REQUISITES']), 'support_email_mobile', null)
if (!SUPPORT_EMAIL_MOBILE) throw new Error('support_email_mobile variable not found. help_requisites must be specified in .env')
const SEND_MESSAGE_TO_SUPPORT_ATTACHMENTS_FILE_FOLDER_NAME = 'forwarded-emails-attachments'
const fileAdapter = new FileAdapter(SEND_MESSAGE_TO_SUPPORT_ATTACHMENTS_FILE_FOLDER_NAME)

const errors = {
    WRONG_EMAIL_FORMAT: {
        mutation: 'sendMessageToSupport',
        variable: ['data', 'emailFrom'],
        code: BAD_USER_INPUT,
        type: WRONG_FORMAT,
        message: 'api.user.sendMessageToSupport.WRONG_EMAIL_FORMAT',
    },
}

const SendMessageToSupportService = new GQLCustomSchema('SendMessageToSupportService', {
    types: [
        {
            access: true,
            type: `enum SendMessageToSupportLang { ${Object.keys(LOCALES).join(' ')} }`,
        },
        {
            access: true,
            type: 'input SendMessageToSupportInput { dv: Int!, sender: SenderFieldInput!, text: String!, emailFrom: String, attachments: [Upload], os: String!, appVersion: String!, lang: SendMessageToSupportLang!, meta: JSON! }',
        },
        {
            access: true,
            type: 'type SendMessageToSupportOutput { id: String!, status: String! }',
        },
    ],

    mutations: [
        {
            access: access.canSendMessageToSupport,
            schema: 'sendMessageToSupport(data: SendMessageToSupportInput!): SendMessageToSupportOutput',
            resolver: async (parent, args, context) => {
                const { data } = args
                const { dv, sender, text, emailFrom, attachments = [], os, appVersion, lang } = data

                const user = get(context, ['req', 'user'])
                if (!user) throw new Error('You cant execute sendMessageToSupport without user context!')

                const normalizedEmailFrom = normalizeEmail(emailFrom)
                if (emailFrom && !normalizedEmailFrom) throw new GQLError(errors.WRONG_EMAIL_FORMAT, context)

                const attachmentsData = await Promise.all(attachments)

                const filesPromises = attachmentsData.map((result) => {
                    const { filename: originalFilename, mimetype, encoding, createReadStream } = result
                    const stream = createReadStream()
                    return fileAdapter.save({
                        stream,
                        id: `${dayjs().format('YYYY-MM-DD_HH-mm-ss')}_${uuid()}`,
                        filename: originalFilename,
                    }).then(({ filename, id }) => {
                        const ret = {
                            encoding,
                            filename,
                            id,
                            mimetype,
                            originalFilename,
                            publicUrl: fileAdapter.publicUrl({ filename }),
                        }

                        if (fileAdapter.acl && fileAdapter.acl.generateUrl) {
                            ret.publicUrl = fileAdapter.acl.generateUrl(`${fileAdapter.folder}/${filename}`)
                        }

                        return ret
                    })
                })

                const files = await Promise.all(filesPromises)

                const residents = await Resident.getAll(context, { user: { id: user.id }, deletedAt: null })
                const serviceConsumers = await ServiceConsumer.getAll(context, { resident: { id_in: residents.map(({ id }) => id) }, deletedAt: null })

                const residentsExtraInfo = []

                for (const resident of residents) {
                    const residentServiceConsumers = serviceConsumers.filter(({ resident: { id } }) => id === resident.id)

                    const residentInfo = { address: resident.address, unitName: resident.unitName, organization: null }

                    if (residentServiceConsumers) {
                        residentInfo.serviceConsumers = [...residentServiceConsumers.map(({ accountNumber, organization: { name: organizationName } }) => ({
                            accountNumber,
                            organizationName,
                        }))]
                    }

                    const { organization } = resident
                    if (organization) {
                        residentInfo.organization = { name: organization.name, tin: organization.tin }
                    }

                    residentsExtraInfo.push(residentInfo)
                }

                const messageAttrs = {
                    sender,
                    lang,
                    type: MESSAGE_FORWARDED_TO_SUPPORT_TYPE,
                    to: {
                        email: SUPPORT_EMAIL_MOBILE,
                    },
                    emailFrom: normalizedEmailFrom ? `${user.name} <${normalizedEmailFrom}>` : null,
                    meta: {
                        dv,
                        text,
                        residentsExtraInfo,
                        os,
                        appVersion,
                        attachments: files,
                    },
                }

                const sendingResult = await sendMessage(context, messageAttrs)

                return {
                    id: sendingResult.id,
                    status: sendingResult.status,
                }
            },
        },
    ],

})

module.exports = {
    SendMessageToSupportService,
}
