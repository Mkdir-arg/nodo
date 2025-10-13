import time
import logging

logger = logging.getLogger('performance')


class PerformanceMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration = time.time() - start_time
        
        if duration > 0.5:
            logger.warning(
                f"Slow request: {request.method} {request.path} took {duration:.2f}s"
            )
        
        response['X-Response-Time'] = f"{duration:.3f}s"
        return response
