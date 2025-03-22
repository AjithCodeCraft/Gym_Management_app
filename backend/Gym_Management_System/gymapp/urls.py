from django.urls import path

from .views import (

    DailyWorkoutView,
    add_subscription,
    delete_all,
    delete_subscription,
    get_default_workout,
    list_subscriptions,
    list_trainers,
    list_users,
    list_users_and_trainers,
    login_user,
    register_user,
    send_otp,
    send_password_reset_email,
    update_subscription,
    update_trainer_details,
    update_user_details,
    verify_otp,
    NutritionGoalView,
    get_user_profile,
    home_chat,
    assign_trainer,
    remove_trainer,
    view_assigned_trainer_for_user,
    view_assigned_trainers,
    chat,
    sleep_log_list_create_update,
    view_assigned_users_for_trainer,
    user_payments_with_subscription,
    get_user_by_firebase_id,
    AttendanceCheckInView,
    AttendanceCheckOutView,
    AttendanceListView,
    ChatMessageListView, 
    SendMessageView

)

urlpatterns = [

    path("send-otp/", send_otp, name="send-otp"),
    path("verify-otp/", verify_otp, name="verify-otp"),
    path("register/", register_user, name="register-user"),
    path(
        "password-reset/", send_password_reset_email, name="send_password_reset_email"
    ),
    path("login/", login_user, name="user_login"),
    path("subscriptions/", list_subscriptions, name="list_subscriptions"),
    path("subscriptions/add/", add_subscription, name="add_subscription"),
    path(
        "subscriptions/edit/<uuid:subscription_id>/",
        update_subscription,
        name="update_subscription",
    ),
    path(
        "subscriptions/delete/<uuid:subscription_id>/",
        delete_subscription,
        name="delete_subscription",
    ),
    path("users/", list_users, name="list_users_with_subscriptions"),
    path("trainers/", list_trainers, name="list_trainers"),
    path("delete", delete_all, name="delete"),
    path(
        "list_users_and_trainers/",
        list_users_and_trainers,
        name="list_users_and_trainers",
    ),
    path("update_user_details/", update_user_details, name="update_subscription"),
    path(
        "update-trainer-details/", update_trainer_details, name="update_trainer_details"
    ),
    path(
        "nutrition-goals/<str:date_str>/",
        NutritionGoalView.as_view(),
        name="nutrition_goal",
    ),
    path("nutrition-goals/", NutritionGoalView.as_view(), name="nutrition_goal"),
    path("user/profile/", get_user_profile, name="user_profile"),
    path("homechat/", home_chat, name="home_chat"),
    path("assign-trainer/", assign_trainer, name="assign-trainer"),
    path("remove-trainer/<int:user_id>/", remove_trainer, name="remove-trainer"),
    path(
        "view-assigned-trainers/", view_assigned_trainers, name="view-assigned-trainers"
    ),
    path(
        "assigned-trainer/<int:user_id>/",
        view_assigned_trainer_for_user,
        name="assigned_trainer_for_user",
    ),
    path("workout-plan/", chat, name="workout_chat"),
    path("get-workout-plan/", get_default_workout, name="get_workout_chat"),
    path(
        "daily-workout/<str:date_str>/",
        DailyWorkoutView.as_view(),
        name="daily_workout",
    ),
    path(
        "user-payments/<int:user_id>/",
        user_payments_with_subscription,
        name="user-payments-with-subscription",
    ),
    path("sleep-logs/", sleep_log_list_create_update, name="sleep-logs"),
    path(
        "user/<str:firebase_id>/",
        get_user_by_firebase_id,
        name="get-user-by-firebase-id",
    ),
    path(
        "trainer/<int:id>/assigned-users/",
        view_assigned_users_for_trainer,
        name="assigned-users-for-trainer",
    ),
    path(
        "attendance/check-in/",
        AttendanceCheckInView.as_view(),
        name="attendance-check-in",
    ),
    path(
        "attendance/check-out/",
        AttendanceCheckOutView.as_view(),
        name="attendance-check-out",
    ),
    path(
        "attendance/<int:user_id>/",
        AttendanceListView.as_view(),
        name="attendance-list",
    ),
    path('trainers/<int:trainer_id>/', get_trainer_by_id, name='get_trainer_by_id'),
    path("messages/<int:user_id>/<int:trainer_id>/", ChatMessageListView.as_view(), name="get_messages"),
    path("messages/send/", SendMessageView.as_view(), name="send_message"),
]

