/**
 * Generated by `createschema notification.RemoteClient 'deviceId:Text; pushToken?:Text; pushTransport?:Select:firebase,apple,huawei; owner?:Relationship:User:SET_NULL; meta?:Json'`
 */
const { get } = require('lodash')
const { Text, Relationship, Select } = require('@keystonejs/fields')

const { Json } = require('@open-condo/keystone/fields')
const { GQLListSchema } = require('@open-condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')

const { REQUIRED_NO_VALUE_ERROR, VALUE_TOO_SHORT } = require('@condo/domains/common/constants/errors')

const access = require('@condo/domains/notification/access/RemoteClient')

const { PUSH_TRANSPORT_TYPES, DEVICE_PLATFORM_TYPES } = require('../constants/constants')

const APP_ID_MIN_LENGTH = 7

const RemoteClient = new GQLListSchema('RemoteClient', {
    schemaDoc:  'Used to describe device in order to be able to send push notifications via corresponding transport, depending on pushTransport value. ' +
                'RemoteClient could be mobile or web based. ' +
                'RemoteClient could be registered (created by user, admin or anonymous) with or without token, and updated later on by admin (or a user within SyncRemoteClientService) by ' +
                'adding/changing token value and connecting device to user (whose authorization was passed within request). ' +
                'All such interactions should be done via SyncRemoteClientService.',
    fields: {
        deviceId: {
            schemaDoc: 'Mobile/web device ID, which is used to identify a device. One user can have many devices, and one device can be used by many users once upon a time.',
            type: Text,
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false },
        },

        appId: {
            schemaDoc: 'Application ID, which is used to identify app. Same device can have multiple apps installed for same user. It is also required for applying correct credentials for Firebase/Huawei/etc. API requests.',
            type: Text,
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false },
            hooks: {
                validateInput: async ({ resolvedData, addFieldValidationError }) => {
                    if (get(resolvedData, ['appId', 'length'], 0) < APP_ID_MIN_LENGTH) {
                        addFieldValidationError(`${VALUE_TOO_SHORT}appId] Value is too short`)
                    }
                },
            },
        },

        pushToken: {
            schemaDoc: 'Used by transport services (FireBase, Apple, Huawei, etc.) to transfer push notifications to devices.',
            type: Text,
            required: false,
            kmigratorOptions: { unique: true, null: true },
            hooks: {
                validateInput: async ({ resolvedData, addFieldValidationError }) => {
                    // NOTE(akarjakin): pushTransport is required when pushToken is present in request
                    if (resolvedData['pushToken']) {
                        if (!resolvedData['pushTransport']) addFieldValidationError(`${REQUIRED_NO_VALUE_ERROR}pushTransport] Value is required`)
                        if (!resolvedData['devicePlatform']) addFieldValidationError(`${REQUIRED_NO_VALUE_ERROR}devicePlatform] Value is required`)
                    }
                },
            },
        },

        pushTransport: {
            schemaDoc: 'Transport service, that delivers push notifications to client device. Type of device requires specific transport service, e.g. Huawei devices can not receive notifications through FireBase.',
            type: Select,
            options: PUSH_TRANSPORT_TYPES,
            isRequired: false,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true },
        },

        devicePlatform: {
            schemaDoc: 'Represents the platform type of the client application like android/ios/web.',
            type: Select,
            options: DEVICE_PLATFORM_TYPES,
            isRequired: false,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true },
        },

        owner: {
            schemaDoc: 'Owner user of a device and a push token. User, which is logged in on the device. Push token can be created by anonymous user and connected to authorized user later on.',
            type: Relationship,
            ref: 'User',
            isRequired: false,
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
            knexOptions: { isNotNullable: false }, // token can be crated by anonymous and User could be connected later.
        },

        meta: {
            schemaDoc: 'RemoteClient metadata. OS type, OS version, etc.',
            type: Json,
            isRequired: false,
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['deviceId', 'appId'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'remote_client_unique_deviceId_appId',
            },
        ],
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadRemoteClients,
        create: access.canManageRemoteClients,
        update: access.canManageRemoteClients,
        delete: false,
        auth: true,
    },
})

module.exports = {
    RemoteClient,
}
