from django.urls import path

from .views import add_subscription, delete_all, delete_subscription, list_subscriptions, list_trainers, list_users, list_users_and_trainers, login_user, register_user, send_otp, send_password_reset_email, update_subscription, verify_otp



urlpatterns = [
    path('send-otp/', send_otp, name='send-otp'), 
    path('verify-otp/', verify_otp, name='verify-otp'),  
    path('register/', register_user, name='register-user'), 
    path('password-reset/', send_password_reset_email, name='send_password_reset_email'),
    path('login/',login_user,name = 'user_login'),
    path('subscriptions/', list_subscriptions, name='list_subscriptions'),
    path('subscriptions/add/', add_subscription, name='add_subscription'),
    path('subscriptions/edit/<uuid:subscription_id>/', update_subscription, name='update_subscription'),
    path('subscriptions/delete/<uuid:subscription_id>/', delete_subscription, name='delete_subscription'),
    path('users/', list_users, name='list_users_with_subscriptions'),
    path('trainers/',list_trainers, name = 'list_trainers'),
    path('delete',delete_all,name = 'delete'),
    path('list_users_and_trainers/', list_users_and_trainers, name='list_users_and_trainers'),


]
 