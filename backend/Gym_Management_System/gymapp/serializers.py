from rest_framework import serializers
from .models import (
    Subscription,
    User,
    UserSubscription,
    NutritionGoal,
    DefaultWorkout,
    DailyWorkout,
    Attendance,
    Payment,
    Subscription,
    SleepLog,
)


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ["id", "name", "description", "duration", "personal_training", "price"]


class UserSubscriptionSerializer(serializers.ModelSerializer):
    subscription = SubscriptionSerializer(read_only=True)

    class Meta:
        model = UserSubscription
        fields = ["id", "subscription", "start_date", "end_date", "status"]


class UserSerializer(serializers.ModelSerializer):
    subscriptions = UserSubscriptionSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "user_id",
            "email",
            "name",
            "user_type",
            "date_of_birth",
            "gender",
            "phone_number",
            "profile_picture_url",
            "is_active",
            "created_at",
            "updated_at",
            "subscriptions",
        ]


class LightweightUserSerializer(serializers.ModelSerializer):
    subscriptions = serializers.SerializerMethodField()
    trainer_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "user_id",
            "name",
            "email",
            "user_type",
            "gender",
            "phone_number",
            "is_active",
            "created_at",
            "subscriptions",
            "trainer_profile",
        ]

    def get_subscriptions(self, obj):
        # Lightweight subscription information
        active_subs = obj.subscriptions.filter(status="active").first()
        if active_subs:
            return {
                "id": active_subs.subscription.id,
                "name": active_subs.subscription.name,
                "price": str(active_subs.subscription.price),
                "start_date": active_subs.start_date,
                "end_date": active_subs.end_date,
                "status": active_subs.status,
            }
        return None

    def get_trainer_profile(self, obj):
        # Lightweight trainer profile
        if hasattr(obj, "trainer_profile"):
            return {
                "specialization": obj.trainer_profile.specialization,
                "experience": obj.trainer_profile.experience_years,
                "salary": obj.trainer_profile.salary,
            }
        return None


class NutritionGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionGoal
        fields = [
            "user",
            "height",
            "weight",
            "age",
            "sex",
            "activity_level",
            "breakfast",
            "morning_snack",
            "lunch",
            "evening_snack",
            "dinner",
        ]
        extra_kargs = {"user": {"required": False}}


class DailyWorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyWorkout
        fields = ["id", "user", "exercise_data", "date"]
        read_only_fields = ["user", "date"]

    def create(self, validated_data):
        user = self.context["user"]
        date = self.context["date"]
        exercise_data = validated_data.get("exercise_data", {})

        daily_workout, _ = DailyWorkout.objects.update_or_create(
            user=user,
            date=date,  # Ensure unique lookup
            defaults={"exercise_data": exercise_data},  # Only update exercise_data
        )

        return daily_workout


class DefaultWorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = DefaultWorkout
        fields = ["user", "exercise_data"]
        read_only_fields = ["user"]

    def create(self, validated_data):
        user = self.context["user"]
        exercise_data = validated_data.get("exercise_data", {})

        workout, _ = DefaultWorkout.objects.update_or_create(
            user=user, defaults={"exercise_data": exercise_data}
        )

        return workout


class PaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="user.name", read_only=True
    )  # Get user's name

    class Meta:
        model = Payment
        fields = [
            "id",
            "user",
            "user_name",
            "amount",
            "payment_date",
            "payment_method",
            "status",
            "created_at",
            "updated_at",
        ]


class SleepLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SleepLog
        fields = [
            "id",
            "user",
            "sleep_date",
            "sleep_duration_hours",
            "sleep_quality",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
