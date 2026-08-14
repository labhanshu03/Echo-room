import jwt
from app.config import INTERNAL_JWT_SECRET


def verify_internal_token(token: str) -> str:
    try:
        payload = jwt.decode(token, INTERNAL_JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise ValueError("Token expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")

    return payload["userId"]
