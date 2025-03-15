from rest_framework import serializers
from .models import (
    Subscription,
    User,
    UserSubscription,
    NutritionGoal,
    Exercise,
    DefaultWorkout,
    DailyWorkout,
    BodyPart,
    WorkoutExercise,
    DefaultWorkoutExercise,
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
        extra_args = {"user": {"required": False}}


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ["id", "name"]


class BodyPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyPart
        fields = ["id", "name"]


class WorkoutExercisesSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer()

    class Meta:
        model = WorkoutExercise
        fields = ["id", "exercise", "status", "sets", "reps", "rest"]


class DailyWorkoutSerializer(serializers.ModelSerializer):
    body_part = BodyPartSerializer()
    workout_exercises = WorkoutExercisesSerializer(many=True)

    class Meta:
        model = DailyWorkout
        fields = ["id", "user", "body_part", "date", "workout_exercises"]
        read_only_fields = ["user"]


""" class ExerciseJSONSerializer(serializers.Serializer):
    exercise = serializers.CharField()
    sets = serializers.JSONField(default=list)
    reps = serializers.JSONField(default=list)
    rest = serializers.JSONField(default=list) """


class DefaultWorkoutExerciseSerializer(serializers.ModelSerializer):
    exercise = serializers.CharField()

    class Meta:
        model = DefaultWorkoutExercise
        fields = ["exercise", "sets", "reps", "rest"]

    def create(self, validated_data):
        exercise_name = validated_data.pop("exercise")
        exercise, _ = Exercise.objects.get_or_create(name=exercise_name)
        default_workout = self.context.get("default_workout")
        return DefaultWorkoutExercise.objects.create(
            workout=default_workout, exercise=exercise, **validated_data
        )


class DefaultWorkoutSerializer(serializers.ModelSerializer):
    day = serializers.CharField()
    body_part = serializers.CharField()
    workout = DefaultWorkoutExerciseSerializer(many=True, write_only=True)

    class Meta:
        model = DefaultWorkout
        fields = ("day", "body_part", "workout")

    def create(self, validated_data):
        user = self.context.get("user")
        day = validated_data.pop("day")
        target_body_part = validated_data.pop("body_part")
        exercise_data = validated_data.pop("workout")
        day = day.lower()
        body_part, _ = BodyPart.objects.get_or_create(name=target_body_part)

        default_workout, created = DefaultWorkout.objects.update_or_create(
            user=user, day=day, body_part=body_part
        )
        for ex_data in exercise_data:
            exercise_name = ex_data.pop("exercise")
            exercise_instance, _ = Exercise.objects.get_or_create(name=exercise_name)
            DefaultWorkoutExercise.objects.update_or_create(
                workout=default_workout, exercise=exercise_instance, defaults=ex_data
            )

        return default_workout


class DefaultWorkoutReadSerializer(serializers.ModelSerializer):
    workout = DefaultWorkoutExerciseSerializer(many=True, read_only=True, source="default_workout_exercise")
    body_part = serializers.CharField(source="body_part.name")

    class Meta:
        model = DefaultWorkout
        fields = ("day", "body_part", "workout")
        