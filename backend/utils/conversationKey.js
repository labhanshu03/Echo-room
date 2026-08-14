export function getDmConversationKey(userIdA, userIdB) {
    const sortedIds = [userIdA.toString(), userIdB.toString()].sort()
    return  `dm:${sortedIds[0]}_${sortedIds[1]}`
}


export function getChannelConversationKey(channelId) {
    return `channel:${channelId.toString()}`
}