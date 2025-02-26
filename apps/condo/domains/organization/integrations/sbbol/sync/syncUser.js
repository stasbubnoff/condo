const { CREATE_ONBOARDING_MUTATION } = require('@condo/domains/onboarding/gql.js')
const { getItems, createItem, updateItem } = require('@keystonejs/server-side-graphql-client')
const { MULTIPLE_ACCOUNTS_MATCHES } = require('@condo/domains/user/constants/errors')
const { sendMessage } = require('@condo/domains/notification/utils/serverSchema')
const { REGISTER_NEW_USER_MESSAGE_TYPE } = require('@condo/domains/notification/constants/constants')
const { COUNTRIES, RUSSIA_COUNTRY } = require('@condo/domains/common/constants/countries')
const { dvSenderFields } = require('../constants')

const createOnboarding = async ({ keystone, user }) => {
    const userContext = await keystone.createContext({
        authentication: {
            item: user,
            listKey: 'User',
        },
    })
    await userContext.executeGraphQL({
        context: userContext,
        query: CREATE_ONBOARDING_MUTATION,
        variables: {
            data: {
                ...dvSenderFields,
                type: 'ADMINISTRATOR',
                userId: user.id,
            },
        },
    })
}

/**
 * If another user will be found with given email, it will get email to null to avoid unique email violation constraint
 * It will be issue of inconvenience for that user, but since we does't have
 * a email validation, it will be not critical. We assume, that found user
 * representing the same person.
 * @param {String} email - search already existing user with this email
 * @param {String} userIdToExclude - ignore found user, that matches this id
 * @param context - Keystone context
 */
const cleanEmailForAlreadyExistingUserWithGivenEmail = async ({ email, userIdToExclude, context }) => {
    if (!email) throw new Error('email argument is not specified')
    const [ existingUser ] = await getItems({
        ...context,
        listKey: 'User',
        where: { email, id_not: userIdToExclude },
        returnFields: 'id type name email phone importId importRemoteSystem',
    })
    if (existingUser && existingUser.id !== userIdToExclude) {
        await updateItem({
            listKey: 'User',
            item: {
                id: existingUser.id,
                data: {
                    email: null,
                    ...dvSenderFields,
                },
            },
            returnFields: 'id',
            ...context,
        })
    }
}

/**
 * Creates or updates user, according to data from SBBOL
 *
 * @param {KeystoneContext} context
 * @param {UserInfo} userInfo
 * @param dvSenderFields
 * @return {Promise<{importId}|*>}
 */
const syncUser = async ({ context, userInfo }) => {
    const returnFields = 'id phone email name importId importRemoteSystem'
    const importFields = {
        type: 'staff',
        importId: userInfo.importId,
        importRemoteSystem: userInfo.importRemoteSystem,
    }
    const userFields = {
        type: 'staff',
        phone: userInfo.phone,
    }
    const existingUsers = await getItems({
        ...context,
        listKey: 'User',
        where: {
            OR: [
                { AND: userFields },
                { AND: importFields },
            ],
        },
        returnFields,
    })
    if (existingUsers.length > 1) {
        throw new Error(`${MULTIPLE_ACCOUNTS_MATCHES}] importId and phone conflict on user import`)
    }
    if (existingUsers.length === 0) {
        if (userInfo.email) {
            await cleanEmailForAlreadyExistingUserWithGivenEmail({ email: userInfo.email, context })
        }

        const user = await createItem({
            listKey: 'User',
            item: { ...userInfo, ...dvSenderFields },
            returnFields,
            ...context,
        })

        // SBBOL works only in Russia, another languages does not need t
        const lang = COUNTRIES[RUSSIA_COUNTRY].locale
        await sendMessage(context.context, {
            lang,
            to: {
                user: {
                    id: user.id,
                },
                phone: userInfo.phone,
            },
            type: REGISTER_NEW_USER_MESSAGE_TYPE,
            meta: {
                userPassword: userInfo.password,
                userPhone: userInfo.phone,
                dv: 1,
            },
            ...dvSenderFields,
        })

        await createOnboarding({ keystone: context.keystone, user, dvSenderFields })
        return user
    }
    const [user] = existingUsers
    if (!user.importId) {
        const { email, phone } = userInfo
        const update = {}
        if (email) {
            await cleanEmailForAlreadyExistingUserWithGivenEmail({ email: userInfo.email, userIdToExclude: user.id, context })
            if (!user.isEmailVerified && user.email === email) {
                update.isEmailVerified = true
            }
            if (!user.email || user.email !== email) {
                update.email = email
            }
        }
        if (!user.isPhoneVerified && user.phone === phone) {
            update.isPhoneVerified = true
        }
        const updatedUser = await updateItem({
            listKey: 'User',
            item: {
                id: user.id,
                data: {
                    ...update,
                    ...importFields,
                    ...dvSenderFields,
                },
            },
            returnFields,
            ...context,
        })
        return updatedUser
    }
    return user
}

module.exports = {
    syncUser,
}