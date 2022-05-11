from django.conf import settings
from allauth.account.adapter import DefaultAccountAdapter

class MyAccountAdapter(DefaultAccountAdapter):

    def get_login_redirect_url(self, request):
        if request.user.is_staff:
            return "/landing_page"
        else:
            return "/landing_page"