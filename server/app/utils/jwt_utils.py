import jwt
from datetime import datetime, timedelta, timezone

def sign_token(payload: dict, secret: str, expires_seconds: int):
    exp = datetime.now(timezone.utc) + timedelta(seconds=expires_seconds)
    to_encode = {**payload, "exp": exp}
    return jwt.encode(to_encode, secret, algorithm="HS256")

def verify_token(token: str, secret: str):
    return jwt.decode(token, secret, algorithms=["HS256"])
