import jwt from "jsonwebtoken"

const INTERNAL_TOKEN_TTL_SECONDS = 5 * 60

export function createInternalToken(userId) {
    return jwt.sign(
        { userId: userId.toString() },
        process.env.INTERNAL_JWT_SECRET,
        { expiresIn: INTERNAL_TOKEN_TTL_SECONDS }
    )
}
