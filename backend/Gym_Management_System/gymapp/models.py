from uuid import uuid4

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
import uuid
from django.utils import timezone


class Demo(models.Model):
    name = models.CharField(max_length=20)
    age = models.IntegerField()


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("user_id", str(uuid4()))
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = [("user", "User"), ("trainer", "Trainer"), ("admin", "Admin")]
    GENDER_CHOICES = [("male", "Male"), ("female", "Female"), ("others", "Others")]

    id = models.AutoField(primary_key=True)
    user_id = models.CharField(max_length=28, unique=True)
    email = models.EmailField(unique=True)
    password = models.TextField()
    name = models.CharField(max_length=120)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    phone_number = models.CharField(max_length=20, unique=True)
    profile_picture_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name", "phone_number"]


class OTPVerification(models.Model):
    email = models.EmailField(unique=True)
    otp = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


class UserProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        "User", on_delete=models.CASCADE, related_name="profile"
    )
    height = models.FloatField(help_text="Height in cm")
    weight = models.FloatField(help_text="Weight in kg")
    bmi = models.FloatField(help_text="Body Mass Index")
    fitness_goal = models.TextField(help_text="User's fitness goal")
    daily_calorie_target = models.IntegerField(help_text="Daily calorie intake target")

    def __str__(self):
        return f"{self.user.name}'s Profile"


class TrainerProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        "User", on_delete=models.CASCADE, related_name="trainer_profile"
    )
    specialization = models.CharField(max_length=255)
    experience_years = models.IntegerField()
    qualifications = models.TextField()
    availability = models.CharField(
        max_length=50,
        choices=[("Morning", "Morning"), ("Evening", "Evening"), ("Both", "Both")],
        default="Both",
    )
    salary = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.user.name} - {self.specialization}"


class Subscription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    duration = models.IntegerField(help_text="Duration of the subscription in months")
    personal_training = models.BooleanField(default="False")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class UserSubscription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    STATUS_CHOICES = [
        ("active", "Active"),
        ("expired", "Expired"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="subscriptions"
    )
    subscription = models.ForeignKey(
        "Subscription", on_delete=models.CASCADE, related_name="user_subscriptions"
    )
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (
            f"Subscription {self.subscription.name} - {self.user.name} ({self.status})"
        )


class MealType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Type of meal (e.g., Breakfast, Lunch, Dinner, Snack)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class NutritionLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="nutrition_logs"
    )
    meal_type = models.ForeignKey(
        "MealType", on_delete=models.SET_NULL, null=True, related_name="nutrition_logs"
    )
    log_date = models.DateField(help_text="Date of the meal log")
    food_item = models.CharField(max_length=255, help_text="Name of the food item")
    calories = models.IntegerField(help_text="Calories in kcal")
    protein = models.DecimalField(
        max_digits=6, decimal_places=2, help_text="Protein in grams"
    )
    carbs = models.DecimalField(
        max_digits=6, decimal_places=2, help_text="Carbohydrates in grams"
    )
    fats = models.DecimalField(
        max_digits=6, decimal_places=2, help_text="Fats in grams"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.name} - {self.food_item} ({self.log_date})"


class Attendance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="attendance_records"
    )
    status = models.CharField(
        max_length=20,
        choices=[("present", "Present"), ("absent", "Absent")],
        default="present",
    )
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Attendance - {self.user.name} ({self.status})"


class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="user_payments"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField()
    payment_method = models.CharField(
        max_length=10,
        choices=[
            ("online", "Online"),
            ("offline", "Offline"),
            ("fortifit", "Fortifit"),
        ],
        default="online",
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("completed", "Completed"),
            ("failed", "Failed"),
        ],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.id} - {self.trainer.name} ({self.status})"


class TrainerSalary(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trainer = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="salaries"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("paid", "Paid"), ("failed", "Failed")],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Salary {self.id} - {self.trainer.name} ({self.status})"


class UserProgress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="progress")
    measurement_date = models.DateField()
    weight = models.FloatField(help_text="Weight in kg")
    body_fat_percentage = models.FloatField(help_text="Body fat percentage")
    muscle_mass = models.FloatField(help_text="Muscle mass in kg")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Progress of {self.user.name} on {self.measurement_date}"


class SleepLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="sleep_logs"
    )
    sleep_date = models.DateField(help_text="Date of sleep log")
    sleep_duration_hours = models.FloatField(help_text="Duration of sleep in hours")
    sleep_quality = models.CharField(
        max_length=50,
        help_text="Quality of sleep (e.g., Poor, Average, Good, Excellent)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Sleep Log for {self.user.name} on {self.sleep_date}"


class Challenge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="Name of the challenge")
    description = models.TextField(help_text="Detailed description of the challenge")
    start_date = models.DateField(help_text="Challenge start date")
    end_date = models.DateField(help_text="Challenge end date")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class NutritionGoal(models.Model):
    ACTIVITY_LEVEL_CHOICES = [
        ("sedentary", "Sedentary"),
        ("light", "Light"),
        ("moderate", "Moderate"),
        ("active", "Active"),
        ("very_active", "Very Active"),
    ]

    SEX_CHOICES = [("male", "Male"), ("female", "Female")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="nutrition_goal"
    )
    height = models.IntegerField(
        default=165,
        validators=[MinValueValidator(50), MaxValueValidator(300)],
        blank=False,
        null=False,
    )
    weight = models.IntegerField(
        default=65,
        validators=[MinValueValidator(25), MaxValueValidator(1000)],
        blank=False,
        null=False,
    )
    age = models.IntegerField(default=16, blank=False, null=False)
    sex = models.CharField(default="male", max_length=6, choices=SEX_CHOICES)
    activity_level = models.CharField(
        max_length=15,
        choices=ACTIVITY_LEVEL_CHOICES,
        default="sedentary",
        verbose_name="Activity Level",
    )
    breakfast = models.JSONField(default=list)
    morning_snack = models.JSONField(default=list)
    lunch = models.JSONField(default=list)
    evening_snack = models.JSONField(default=list)
    dinner = models.JSONField(default=list)
    created_at = models.DateField(default=timezone.now)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "created_at"], name="unique_user_date"
            )
        ]


class TrainerAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="assigned_trainer"
    )
    trainer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="assigned_users"
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    def str(self):
        return f"{self.user.name} -> {self.trainer.name}"


# Exercise Section
class DailyWorkout(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="workout_history"
    )
    exercise_data = models.JSONField(default=list)
    date = models.DateField(default=timezone.now)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "date"], name="unique_daily_exercise"
            )
        ]


class DefaultWorkout(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="default_workout"
    )
    exercise_data = models.JSONField(default=list)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user"], name="unique_user_default_workout")
        ]


# End Exercise Section
