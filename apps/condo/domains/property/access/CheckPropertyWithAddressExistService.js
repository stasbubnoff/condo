/**
 * Generated by `createservice property.CheckPropertyWithAddressExistService --type queries`
 */
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

async function canCheckPropertyWithAddressExist ({ authentication: { item: user } }) {
    // TODO(dkoviazin): more complex access check for mobile devices
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    return true
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canCheckPropertyWithAddressExist,
}