from django.http import HttpRequest, JsonResponse
from rest_framework import permissions, views


class TestView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: HttpRequest):
        print("\nSucccessfully called API")
        print("User:", request.user.username)

        return JsonResponse({"successful": True})
