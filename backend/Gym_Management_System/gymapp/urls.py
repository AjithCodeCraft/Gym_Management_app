from django.urls import path


from .views import add_subscription,  assign_trainer, delete_all, delete_subscription, list_subscriptions, list_trainers, list_users, \
    list_users_and_trainers, login_user, register_user, remove_trainer, send_otp, send_password_reset_email, update_subscription, \
    update_trainer_details, update_user_details, verify_otp, NutritionGoalView,get_user_profile,home_chat, view_assigned_trainers


urlpatterns = [
    path('send-otp/', send_otp, name='send-otp'), 
    path('verify-otp/', verify_otp, name='verify-otp'),  
    path('register/', register_user, name='register-user'), 
    path('password-reset/', send_password_reset_email, name='send_password_reset_email'),
    path('login/',login_user, name='user_login'),
    path('subscriptions/', list_subscriptions, name='list_subscriptions'),
    path('subscriptions/add/', add_subscription, name='add_subscription'),
    path('subscriptions/edit/<uuid:subscription_id>/', update_subscription, name='update_subscription'),
    path('subscriptions/delete/<uuid:subscription_id>/', delete_subscription, name='delete_subscription'),
    path('users/', list_users, name='list_users_with_subscriptions'),
    path('trainers/',list_trainers, name = 'list_trainers'),
    path('delete',delete_all,name = 'delete'),
    path('list_users_and_trainers/', list_users_and_trainers, name='list_users_and_trainers'),
    path('update_user_details/', update_user_details, name='update_subscription'),
    path('update-trainer-details/', update_trainer_details, name='update_trainer_details'),
    path('nutrition-goals/<str:date_str>/', NutritionGoalView.as_view(), name="nutrition_goal"),
    path('nutrition-goals/', NutritionGoalView.as_view(), name="nutrition_goal"),
    path('user/profile/', get_user_profile, name='user_profile'),
    path('homechat/', home_chat, name='home_chat'),
    path('assign-trainer/', assign_trainer, name='assign-trainer'),
    path('remove-trainer/<int:user_id>/', remove_trainer, name='remove-trainer'),
    path('view-assigned-trainers/', view_assigned_trainers, name='view-assigned-trainers'),

]