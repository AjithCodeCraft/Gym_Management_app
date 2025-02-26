from django.urls import path

from .views import login_user, register_user, send_otp, send_password_reset_email, verify_otp



urlpatterns = [
    path('send-otp/', send_otp, name='send-otp'), 
    path('verify-otp/', verify_otp, name='verify-otp'),  
    path('register/', register_user, name='register-user'), 
    path('password-reset/', send_password_reset_email, name='send_password_reset_email'),
    path('login/',login_user,name = 'user_login')

]
