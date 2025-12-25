from redis.asyncio import Redis
from fastapi import Request, HTTPException, status
from .config import settings

redis = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    decode_responses=True,
)


class RateLimiter:
    def __init__(self, request_limit: int, timeout: int):
        self.request_limit = request_limit
        self.timeout = timeout

    async def __call__(self, request: Request):
        client_ip = request.client.host

        pipeline = redis.pipeline()
        pipeline.incr(client_ip)
        pipeline.expire(client_ip, self.timeout)
        result = await pipeline.execute()

        number_of_requst = result[0]

        if number_of_requst > self.request_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Try again later.",
            )


rate_limiter = RateLimiter(5, 300)
