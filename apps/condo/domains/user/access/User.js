/**
 * Generated by `createschema user.User name:Text; password?:Password; isAdmin?:Checkbox; email?:Text; isEmailVerified?:Checkbox; phone?:Text; isPhoneVerified?:Checkbox; avatar?:File; meta:Json; importId:Text;`
 */
const access = require('@open-condo/keystone/access')
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

async function canReadUsers ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    return true
}

async function canManageUsers ({ authentication: { item: user }, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isSupport || user.isAdmin) return true

    if (operation === 'create') return false
    if (operation === 'update') return itemId === user.id

    return false
}

const readByAnyUpdateByAdminField = {
    read: true,
    create: access.userIsAdmin,
    update: access.userIsAdmin,
}

const readBySupportUpdateByAdminField = {
    read: access.userIsAdminOrIsSupport,
    create: access.userIsAdmin,
    update: access.userIsAdmin,
}

const canAccessToEmailField = {
    read: access.userIsAdminOrIsThisItem,
    create: access.userIsAdmin,
    // TODO(pahaz): !!! change it to access.userIsAdmin
    update: access.userIsAdminOrIsThisItem,
}

const canAccessToPhoneField = {
    read: access.userIsAdminOrIsThisItem,
    create: access.userIsAdmin,
    // TODO(pahaz): !!! change it to access.userIsAdmin
    update: ({ authentication: { item: user, listKey }, existingItem, originalInput }) => {
        if (!access.userIsAuthenticated({ authentication: { item: user, listKey } })) return false
        const updateByResidentToTheSamePhone = Boolean(existingItem && user.type === 'resident' && existingItem.id === user.id && originalInput.phone === existingItem.phone)
        return Boolean(user && user.isAdmin) || updateByResidentToTheSamePhone
    },
}

const canAccessToPasswordField = {
    // 3. Only admins can see if a password is set. No-one can read their own or other user's passwords.
    read: access.userIsAdmin,
    create: access.userIsAdmin,
    // 4. Only authenticated users can update their own password. Admins can update anyone's password.
    update: access.userIsAdminOrIsThisItem,
}
const canManageToIsAdminField = {
    read: true,
    create: access.userIsAdmin,
    update: access.userIsAdmin,
}

const canAccessToIsAdminField = {
    read: access.userIsAdmin,
    create: access.userIsAdmin,
    update: access.userIsAdmin,
}

const canAccessToIsEmailVerifiedField = readByAnyUpdateByAdminField
const canAccessToIsPhoneVerifiedField = readByAnyUpdateByAdminField
const canAccessToImportField = readByAnyUpdateByAdminField
const canAccessToEmployeesField = readBySupportUpdateByAdminField
const canAccessToRelatedOrganizationsField = readBySupportUpdateByAdminField

const canAccessToStaffUserField = {
    read: access.canReadOnlyIfUserIsActiveOrganizationEmployee,
    create: access.userIsNotResidentUser,
    update: access.userIsNotResidentUser,
}
/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadUsers,
    canManageUsers,
    canAccessToEmailField,
    canAccessToPhoneField,
    canAccessToPasswordField,
    canAccessToIsAdminField,
    canAccessToIsEmailVerifiedField,
    canAccessToIsPhoneVerifiedField,
    canAccessToImportField,
    canAccessToStaffUserField,
    canManageToIsAdminField,
    canAccessToRelatedOrganizationsField,
    canAccessToEmployeesField,
}
