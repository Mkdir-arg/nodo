from rest_framework.views import APIView
from rest_framework.response import Response


class UserListAPIView(APIView):
    def get(self, request):
        return Response({'users': []})
