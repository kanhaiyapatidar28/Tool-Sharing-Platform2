from rest_framework.authentication import SessionAuthentication, BaseAuthentication
from django.contrib.auth import get_user_model

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening

class EmailHeaderAuthentication(BaseAuthentication):
    def authenticate(self, request):
        email = request.headers.get('X-User-Email')
        if not email:
            return None
        
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
            return (user, None)
        except User.DoesNotExist:
            return None
