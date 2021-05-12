/**
 * Generated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 */

const JSON_NO_REQUIRED_ATTR_ERROR = '[json:noRequiredAttr:'
const JSON_SUSPICIOUS_ATTR_NAME_ERROR = '[json:suspiciousAttrName:'
const JSON_UNKNOWN_ATTR_NAME_ERROR = '[json:unknownAttrName:'

const SMS_TRANSPORT = 'sms'
const EMAIL_TRANSPORT = 'email'
const TELEGRAM_TRANSPORT = 'telegram'
const PUSH_TRANSPORT = 'push'
const MESSAGE_TRANSPORTS = [SMS_TRANSPORT, EMAIL_TRANSPORT, TELEGRAM_TRANSPORT, PUSH_TRANSPORT]

const INVITE_NEW_EMPLOYEE_MESSAGE_TYPE = 'INVITE_NEW_EMPLOYEE'
const REGISTER_NEW_USER_MESSAGE_TYPE = 'REGISTER_NEW_USER'
const RESET_PASSWORD_MESSAGE_TYPE = 'RESSET_PASSWORD'
const MESSAGE_TYPES = [INVITE_NEW_EMPLOYEE_MESSAGE_TYPE, REGISTER_NEW_USER_MESSAGE_TYPE, RESET_PASSWORD_MESSAGE_TYPE]


const MESSAGE_META = {
    [INVITE_NEW_EMPLOYEE_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        inviteCode: { defaultValue: '', required: true },
        userName: { defaultValue: 'USERNAME', required: false },
        userEmail: { defaultValue: '', required: false },
        userPhone: { defaultValue: '', required: false },
        organizationName: { defaultValue: 'ORGANIZATION', required: false },
    },
    [REGISTER_NEW_USER_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        userPhone: { defaultValue: '', required: false },
        userPassword: { defaultValue: '', required: false },
    },
    [RESET_PASSWORD_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        token: { defaultValue: '', required: true },
        userName: { defaultValue: 'USERNAME', required: false },
        userEmail: { defaultValue: '', required: false },
    },
}

const MESSAGE_SENDING_STATUS = 'sending'
const MESSAGE_RESENDING_STATUS = 'resending'
const MESSAGE_PROCESSING_STATUS = 'processing'
const MESSAGE_ERROR_STATUS = 'error'
const MESSAGE_DELIVERED_STATUS = 'delivered'
const MESSAGE_CANCELED_STATUS = 'canceled'
const MESSAGE_STATUSES = [
    MESSAGE_SENDING_STATUS, MESSAGE_RESENDING_STATUS, MESSAGE_PROCESSING_STATUS, MESSAGE_ERROR_STATUS,
    MESSAGE_DELIVERED_STATUS, MESSAGE_CANCELED_STATUS,
]

module.exports = {
    JSON_NO_REQUIRED_ATTR_ERROR,
    JSON_SUSPICIOUS_ATTR_NAME_ERROR,
    JSON_UNKNOWN_ATTR_NAME_ERROR,
    SMS_TRANSPORT,
    EMAIL_TRANSPORT,
    TELEGRAM_TRANSPORT,
    PUSH_TRANSPORT,
    MESSAGE_TRANSPORTS,
    REGISTER_NEW_USER_MESSAGE_TYPE,
    INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
    RESET_PASSWORD_MESSAGE_TYPE,
    MESSAGE_TYPES,
    MESSAGE_META,
    MESSAGE_SENDING_STATUS, MESSAGE_RESENDING_STATUS, MESSAGE_PROCESSING_STATUS, MESSAGE_ERROR_STATUS,
    MESSAGE_DELIVERED_STATUS, MESSAGE_CANCELED_STATUS,
    MESSAGE_STATUSES,
}
