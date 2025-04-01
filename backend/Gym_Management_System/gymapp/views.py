import random
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import (
    OTPVerification,
    Payment,
    Subscription,
    TrainerProfile,
    User,
    UserSubscription,
    NutritionGoal,
    TrainerAssignment,
    DailyWorkout,
    DefaultWorkout,
    SleepLog,
    Attendance,
    ChatMessage,
)
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)

from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework_simplejwt.authentication import JWTAuthentication
import firebase_admin


from django.contrib.auth.hashers import make_password, check_password
from firebase_admin import auth
from rest_framework.response import Response
from rest_framework import status, generics
from django.core.cache import cache
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.models import AnonymousUser

from .serializers import (
    LightweightUserSerializer,
    SubscriptionSerializer,
    TrainerSerializer,
    UserSerializer,
    NutritionGoalSerializer,
    DefaultWorkoutSerializer,
    DailyWorkoutSerializer,
    SleepLogSerializer,
    AttendanceSerializer,
    PaymentSerializer,
    ChatMessageSerializer,
)
from datetime import datetime

import json
import os
from django.http import JsonResponse
from gradio_client import Client
import re
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import MultipleObjectsReturned
from firebase_admin import auth
from firebase_admin.exceptions import FirebaseError
# Create your views here.


@api_view(["POST"])
def send_otp(request):
    email = request.data.get("email")

    # Validate required fields
    if not email:
        return Response(
            {"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Check if email already exists in MongoDB
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Generate a 6-digit OTP
    otp = random.randint(100000, 999999)

    # Store OTP in MongoDB (Temporary Storage)
    OTPVerification.objects.update_or_create(
        email=email,
        defaults={
            "otp": otp,
            "created_at": timezone.now(),
        },  # Use timezone-aware timestamp
    )

    # Send OTP via email
    try:
        send_mail(
            subject="Your OTP for Registration",
            message=f"Your OTP is: {otp}. It is valid for 5 minutes.",
            from_email="alameena068@gmail.com",
            recipient_list=[email],
        )

        return Response(
            {"message": "OTP sent. Verify OTP to complete registration."},
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response(
            {"error": f"Error sending OTP email: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def verify_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    if not email or not otp:
        return Response(
            {"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Check if OTP is valid
    try:
        otp_entry = OTPVerification.objects.get(email=email)
        otp_created_time = otp_entry.created_at  # Already timezone-aware
        current_time = timezone.now()  # Ensure timezone awareness

        # Check OTP expiry (valid for 5 minutes)
        if (current_time - otp_created_time).total_seconds() > 300:
            return Response(
                {"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check OTP correctness
        if otp_entry.otp != int(otp):
            return Response(
                {"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"message": "OTP verified successfully"}, status=status.HTTP_200_OK
        )

    except OTPVerification.DoesNotExist:
        return Response(
            {"error": "OTP not found or already used"},
            status=status.HTTP_400_BAD_REQUEST,
        )


VALID_USER_TYPES = ["user", "trainer", "admin"]


@api_view(["POST"])
def register_user(request):
    email = request.data.get("email")
    name = request.data.get("name")
    phone = request.data.get("phone_number")
    user_type = request.data.get("user_type", "user")
    gender = request.data.get("gender")

    # Set password based on user type
    if user_type == "admin":
        password = request.data.get("password")
    else:
        email_prefix = email.split("@")[0]
        password = f"{email_prefix}@fortifit"

    # Trainer-specific fields
    specialization = request.data.get("specialization")
    experience_years = request.data.get("experience_years")
    qualifications = request.data.get("qualifications")
    availability = request.data.get("availability")
    salary = request.data.get("salary")

    # Subscription (for normal users)
    subscription_plan_id = request.data.get("subscription_plan_id")

    # Validate user type
    if user_type not in VALID_USER_TYPES:
        return Response(
            {"error": "Invalid user type"}, status=status.HTTP_400_BAD_REQUEST
        )

    if not email or not phone:
        return Response(
            {"error": "Email and phone are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        auth.get_user_by_email(email)
        return Response(
            {"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST
        )
    except auth.UserNotFoundError:
        pass  # Email does not exist, continue checking phone number

    # Check if phone number exists in Firebase
    try:
        auth.get_user_by_phone_number(phone)
        return Response(
            {"error": "Phone number already exists"}, status=status.HTTP_400_BAD_REQUEST
        )
    except auth.UserNotFoundError:
        pass

    # Check if email exists in Django
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists "}, status=status.HTTP_400_BAD_REQUEST
        )

    # Check if phone number exists in Django User model
    if User.objects.filter(phone_number=phone).exists():
        return Response(
            {"error": "Phone number already exists "},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Create user in Firebase
        new_user = auth.create_user(email=email, password=password, email_verified=True)

        # Update Firebase user profile
        auth.update_user(new_user.uid, phone_number=phone)

        # Save user in Django
        user = User.objects.create(
            user_id=new_user.uid,
            email=email,
            phone_number=phone,
            name=name,
            user_type=user_type,
            gender=gender,
            password=make_password(password),  # Store hashed password
        )

        email_message = f"""
        <p>Hello {name},</p>
        <p>Your account has been successfully created!</p>
        <p>Login Credentials:</p>
        <table border="1" cellpadding="5" cellspacing="0">
            <tr>
                <th>Email</th>
                <th>Password</th>
            </tr>
            <tr>
                <td>{email}</td>
                <td>{password}</td>
            </tr>
        </table>
        """

        if user_type == "user":
            # Validate Subscription Plan
            try:
                subscription_plan = Subscription.objects.get(id=subscription_plan_id)
            except Subscription.DoesNotExist:
                return Response(
                    {"error": "Subscription plan not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Create Payment record
            payment = Payment.objects.create(
                user=user,
                amount=subscription_plan.price,
                payment_date=timezone.now(),
                status="completed",
                payment_method="offline",
            )

            # Create Subscription record
            start_date = timezone.now().date()
            end_date = start_date + relativedelta(months=subscription_plan.duration)
            UserSubscription.objects.create(
                user=user,
                subscription=subscription_plan,
                start_date=start_date,
                end_date=end_date,
                status="active",
            )

            email_message += f"""
            <p>Subscription Details:</p>
            <table border="1" cellpadding="5" cellspacing="0">
                <tr>
                    <th>Subscription Plan</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Amount Paid</th>
                    <th>Payment Method</th>
                </tr>
                <tr>
                    <td>{subscription_plan.name}</td>
                    <td>{start_date}</td>
                    <td>{end_date}</td>
                    <td>${subscription_plan.price}</td>
                    <td>Offline</td>
                </tr>
            </table>
            """

        elif user_type == "trainer":
            # Validate Trainer fields
            if not (
                specialization
                and experience_years
                and qualifications
                and availability
                and salary
            ):
                return Response(
                    {"error": "All trainer fields are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create Trainer Profile
            TrainerProfile.objects.create(
                user=user,
                specialization=specialization,
                experience_years=experience_years,
                qualifications=qualifications,
                availability=availability,
                salary=salary,
            )

            email_message += f"""
            <p>Trainer Profile Details:</p>
            <table border="1" cellpadding="5" cellspacing="0">
                <tr>
                    <th>Specialization</th>
                    <th>Experience (Years)</th>
                    <th>Qualifications</th>
                    <th>Availability</th>
                    <th>Salary</th>
                </tr>
                <tr>
                    <td>{specialization}</td>
                    <td>{experience_years}</td>
                    <td>{qualifications}</td>
                    <td>{availability}</td>
                    <td>${salary}</td>
                </tr>
            </table>
            """

        # Send email confirmation
        send_mail(
            subject="Welcome to Gym Management System",
            message="",
            html_message=email_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response(
            {
                "message": "User created successfully",
                "user_id": new_user.uid,
                "user_type": user_type,
            },
            status=status.HTTP_201_CREATED,
        )

    except Exception as e:
        return Response(
            {"error": f"Unexpected error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["POST"])
def send_password_reset_email(request):
    email = request.data.get("email")

    if not email:
        return Response({"error": "Email is required"}, status=400)

    try:
        # Check if user exists first
        try:
            user = auth.get_user_by_email(email)
        except auth.UserNotFoundError:
            return Response({"error": "No user found with this email"}, status=404)
        except ValueError as e:
            return Response({"error": f"Invalid email: {str(e)}"}, status=400)

        # Generate password reset link
        try:
            link = auth.generate_password_reset_link(email)
            
            send_mail(
                subject="Reset Your Password",
                message=f"Click the link below to reset your password:\n{link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            return Response({"message": "Password reset email sent"}, status=200)
            
        except FirebaseError as e:
            return Response({"error": f"Firebase error: {str(e)}"}, status=500)

    except Exception as e:
        return Response({"error": f"Unexpected error: {str(e)}"}, status=500)

@api_view(["POST"])
def login_user(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {"error": "Email and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Verify user with Firebase Authentication
        firebase_user = auth.get_user_by_email(email)

        # Firebase does not store passwords, so we need to sign in using Firebase REST API

        firebase_api_key = "AIzaSyB6M8BgWoTQq2RCFkAMMC82wSnER1E8z0g"  # Replace with your Firebase API Key
        firebase_auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={firebase_api_key}"

        payload = {"email": email, "password": password, "returnSecureToken": True}

        response = requests.post(firebase_auth_url, json=payload)
        firebase_data = response.json()

        if "error" in firebase_data:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Check if the user exists in the Django database
        user = User.objects.get(email=email)

        # If the stored password is different, update it
        if not check_password(password, user.password):
            user.password = make_password(password)
            user.save()

        # Generate JWT token
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "id": user.id,
                "user_id": user.user_id,
                "email": user.email,
                "name": user.name,
                "user_type": user.user_type,
            },
            status=status.HTTP_200_OK,
        )

    except User.DoesNotExist:
        return Response(
            {"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED
        )

    except Exception as e:
        return Response(
            {"error": f"Unexpected error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def list_subscriptions(request):
    if not request.user.is_authenticated:
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Check if the data is in the cache
    cache_key = "subscriptions_list"
    cached_data = cache.get(cache_key)
    if cached_data:
        return Response(cached_data, status=status.HTTP_200_OK)

    # Fetch data from the database
    subscriptions = Subscription.objects.all()  # Remove select_related if not needed
    serializer = SubscriptionSerializer(subscriptions, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def add_subscription(request):
    if (
        not request.user.is_authenticated
        or getattr(request.user, "user_type", "") != "admin"
    ):
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    data = request.data.copy()
    if data.get("personal_training"):
        data["price"] = float(data.get("price", 0)) + 5000

    serializer = SubscriptionSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
def update_subscription(request, subscription_id):
    if (
        not request.user.is_authenticated
        or getattr(request.user, "user_type", "") != "admin"
    ):
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        subscription = Subscription.objects.get(id=subscription_id)
    except Subscription.DoesNotExist:
        return Response(
            {"detail": "Subscription not found."}, status=status.HTTP_404_NOT_FOUND
        )

    data = request.data.copy()

    if "personal_training" in data:
        new_personal_training = data.get("personal_training")
        if bool(new_personal_training) != subscription.personal_training:
            if new_personal_training:
                data["price"] = float(data.get("price", subscription.price)) + 5000
            else:
                data["price"] = max(
                    float(data.get("price", subscription.price)) - 5000, 0
                )

    serializer = SubscriptionSerializer(subscription, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def delete_subscription(request, subscription_id):
    if (
        not request.user.is_authenticated
        or getattr(request.user, "user_type", "") != "admin"
    ):
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        subscription = Subscription.objects.get(id=subscription_id)
    except Subscription.DoesNotExist:
        return Response(
            {"detail": "Subscription not found."}, status=status.HTTP_404_NOT_FOUND
        )

    subscription.delete()
    return Response(
        {"detail": "Subscription deleted successfully."},
        status=status.HTTP_204_NO_CONTENT,
    )


@api_view(["GET"])
def list_users(request):
    if (
        not request.user.is_authenticated
        or getattr(request.user, "user_type", "") != "admin"
    ):
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    users = User.objects.filter(user_type="user")
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def list_trainers(request):
    if not request.user.is_authenticated:
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    trainers = User.objects.filter(user_type="trainer").select_related("trainer_profile")
    serializer = TrainerSerializer(trainers, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["DELETE"])
def delete_all(request):
    User.objects.all().delete()
    return Response({"message": "All users deleted."}, status=status.HTTP_200_OK)


@api_view(["GET"])
def list_users_and_trainers(request):

    if not request.user.is_authenticated:
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    user_type = request.query_params.get("type")
    if user_type not in ["user", "trainer"]:
        return Response(
            {"detail": "Invalid type parameter. Use 'user' or 'trainer'."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Create a unique cache key
    cache_key = f"users_list_{user_type}_{request.user.id}"

    # Try to get cached data
    cached_data = cache.get(cache_key)
    if cached_data is not None:
        return Response(cached_data, status=status.HTTP_200_OK)

    try:
        # Optimized queryset with select_related and prefetch_related
        users = (
            User.objects.select_related("trainer_profile")
            .prefetch_related("subscriptions__subscription")
            .filter(
                user_type=user_type
                # Only active users
            )
            .order_by("-created_at")
        )  # Most recent first

        # Serialize the data
        serializer = LightweightUserSerializer(users, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        # Log the error (replace with your logging mechanism)
        print(f"Error fetching users: {e}")
        return Response(
            {"detail": "An error occurred while fetching users."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Additional utility function for cache invalidation
def invalidate_users_cache(user_type, user_id):
    """
    Invalidate cache for a specific user type and user
    """
    cache_key = f"users_list_{user_type}_{user_id}"
    cache.delete(cache_key)


@api_view(["PUT"])
def update_user_details(request):
    if (
        not request.user.is_authenticated
        or getattr(request.user, "user_type", "") != "admin"
    ):
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    email = request.data.get("email")
    action = request.data.get(
        "action"
    )  # 'cancel', 'upgrade', or None for only updating phone number
    new_plan_id = request.data.get("new_plan_id")  # Required for upgrade
    is_active = request.data.get("is_active")  # Enable or disable user
    phone_number = request.data.get("phone_number")  # Update phone number
    payment_method = request.data.get(
        "payment_method", "offline"
    )  # Default to 'offline'

    try:
        user = User.objects.get(email=email)
        subscription = UserSubscription.objects.filter(
            user=user, status="active"
        ).first()

        # Update user details if needed (phone number and activation status)
        if is_active is not None:
            user.is_active = is_active
        if phone_number:
            user.phone_number = phone_number
        user.save()

        # If no subscription action is provided, return success after updating phone number
        if not action:
            return Response(
                {"message": "User details updated successfully"},
                status=status.HTTP_200_OK,
            )

        if action == "cancel":
            if not subscription:
                return Response(
                    {"error": "No active subscription found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            subscription.status = "cancelled"
            subscription.end_date = timezone.now().date()
            subscription.save()
            return Response(
                {"message": "Subscription cancelled successfully"},
                status=status.HTTP_200_OK,
            )

        elif action == "upgrade":
            try:
                new_plan = Subscription.objects.get(id=new_plan_id)
            except Subscription.DoesNotExist:
                return Response(
                    {"error": "New subscription plan not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Create a payment entry (Completed immediately)
            payment = Payment.objects.create(
                user=user,
                amount=new_plan.price,  # Assuming Subscription model has a 'price' field
                payment_date=timezone.now(),
                payment_method=payment_method,
                status="completed",  # All payments are marked as completed immediately
            )

            # Check if user has a cancelled subscription
            cancelled_subscription = UserSubscription.objects.filter(
                user=user, status="cancelled"
            ).first()
            if cancelled_subscription:
                cancelled_subscription.subscription = new_plan
                cancelled_subscription.status = "active"
                cancelled_subscription.start_date = timezone.now().date()
                cancelled_subscription.end_date = (
                    cancelled_subscription.start_date
                    + relativedelta(months=new_plan.duration)
                )
                cancelled_subscription.save()
                return Response(
                    {
                        "message": "Cancelled subscription reactivated with new plan",
                        "payment_id": str(payment.id),
                        "payment_status": payment.status,
                    },
                    status=status.HTTP_200_OK,
                )

            # If no cancelled subscription, upgrade the active one
            if subscription:
                subscription.subscription = new_plan
                subscription.start_date = timezone.now().date()
                subscription.end_date = subscription.start_date + relativedelta(
                    months=new_plan.duration
                )
                subscription.save()
                return Response(
                    {
                        "message": "Subscription upgraded successfully",
                        "payment_id": str(payment.id),
                        "payment_status": payment.status,
                    },
                    status=status.HTTP_200_OK,
                )

            # If no active or cancelled subscription, create a new one
            new_subscription = UserSubscription.objects.create(
                user=user,
                subscription=new_plan,
                start_date=timezone.now().date(),
                end_date=timezone.now().date()
                + relativedelta(months=new_plan.duration),
                status="active",
            )
            return Response(
                {
                    "message": "New subscription added successfully",
                    "payment_id": str(payment.id),
                    "payment_status": payment.status,
                },
                status=status.HTTP_201_CREATED,
            )

        else:
            return Response(
                {"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST
            )

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {"error": f"Unexpected error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class UpdateTrainerDetails(APIView):
    def put(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN,
            )

        email = request.data.get("email")
        specialization = request.data.get("specialization")
        experience_years = request.data.get("experience_years")
        qualifications = request.data.get("qualifications")
        availability = request.data.get("availability")
        salary = request.data.get("salary")
        is_active = request.data.get("is_active")  # Enable or disable trainer
        phone_number = request.data.get("phone_number")  # Update phone number
        gender = request.data.get("gender")  # Update gender
        name = request.data.get("name")  # Update name
        date_of_birth = request.data.get("date_of_birth")  # Update date of birth

        try:
            user = User.objects.get(email=email, user_type="trainer")
            trainer_profile = TrainerProfile.objects.get(user=user)

            if is_active is not None:
                user.is_active = is_active
            if phone_number:
                user.phone_number = phone_number
            if name:
                user.name = name
            if date_of_birth:
                user.date_of_birth = date_of_birth
            if gender:
                user.gender = gender
            user.save()

            if specialization:
                trainer_profile.specialization = specialization
            if experience_years:
                trainer_profile.experience_years = experience_years
            if qualifications:
                trainer_profile.qualifications = qualifications
            if availability:
                trainer_profile.availability = availability
            if salary:
                trainer_profile.salary = salary

            trainer_profile.save()

            return Response(
                {"message": "Trainer details updated successfully"},
                status=status.HTTP_200_OK,
            )
        except User.DoesNotExist:
            return Response(
                {"error": "Trainer not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except TrainerProfile.DoesNotExist:
            return Response(
                {"error": "Trainer profile not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Unexpected error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class NutritionGoalView(APIView):

    def get(self, request, date_str):
        if not request.user.is_authenticated:
            return Response(
                {"message": "You are not logged in"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        date = datetime.strptime(date_str, "%Y-%m-%d").date()

        goals = NutritionGoal.objects.filter(user=request.user, created_at=date).first()
        data = NutritionGoalSerializer(goals).data
        if not goals:
            goals = (
                NutritionGoal.objects.filter(user=request.user)
                .order_by("-created_at")
                .first()
            )
            if goals:
                data = dict(NutritionGoalSerializer(goals).data)
                for item in [
                    "breakfast",
                    "morning_snack",
                    "lunch",
                    "evening_snack",
                    "dinner",
                ]:
                    data[item] = []
            else:
                return Response(
                    {"error": "No nutrition goal found for current user"},
                    status=status.HTTP_404_NOT_FOUND,
                )

        return Response(data, status=status.HTTP_200_OK)

    # Will handle both Create and Update
    def put(self, request, date_str):
        if not request.user.is_authenticated:
            return Response(
                {"message": "You are not logged in"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        date = datetime.strptime(date_str, "%Y-%m-%d").date()

        serializer = NutritionGoalSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            goal, created = NutritionGoal.objects.update_or_create(
                user=request.user, created_at=date, defaults=validated_data
            )
            return Response(
                NutritionGoalSerializer(goal).data, status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_user_profile(request):
    # Ensure the user is authenticated
    if not request.user.is_authenticated:
        return Response(
            {"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED
        )

    # Use the authenticated user's ID
    user_id = request.user.id

    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)


# Get the directory of the current file (views.py)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the path to responses.json
json_file_path = os.path.join(current_dir, "data", "responses.json")

# Load the JSON dataset
gym_responses = {}
try:
    with open(json_file_path, "r") as file:
        gym_responses = json.load(file)
except FileNotFoundError:
    print(f"Error: The file {json_file_path} does not exist.")
except json.JSONDecodeError:
    print(f"Error: The file {json_file_path} is not a valid JSON file.")

# Initialize the Gradio client
client = Client("alameenas/gym_assastant")


@api_view(["POST"])
def home_chat(request):
    try:
        # Get user input from request
        req_message = request.data.get("message")

        # Validate input
        if not req_message:
            return JsonResponse({"error": "Message is required"}, status=400)

        # Ensure JSON responses are loaded properly
        if not gym_responses:
            return JsonResponse({"error": "Response data is not available"}, status=500)

        # Check if the message exists in the JSON dataset
        if req_message in gym_responses:
            matched_response = {"response": gym_responses[req_message]}

            # Debugging: Print the matched response
            print("Matched Response from JSON:", json.dumps(matched_response, indent=4))

            return JsonResponse(matched_response)

        # If no match found in JSON, use the AI model
        system_instruction = (
            "You are a friendly and helpful gym assistant. Your goal is to provide information about the gym, "
            "Only give short answers to the user based on the questions."
            "including timings, membership plans, trainers, facilities, and equipment. Be conversational and human-like in your responses.\n"
            "Do not generate workout plans or ask for user-specific details like weight, height, or age. "
            "Focus solely on answering questions about the gym . and you are an indian agent and the gym name is fortifit and you have to represent money in Rupees and the main thing is there are lost of plans /n"
            " plans: the Basic plan, starting at ₹999 per month, includes access to the gym floor, locker facilities, and cardio & strength training; the Pro plan, starting at ₹1999 per month, adds personalized workout plans, group training sessions, and priority locker access; and the Elite plan, starting at ₹2999 per month, includes all Pro plan benefits plus 1-on-1 personal training, diet consultations, and unlimited guest passes. /n",
            "You can also provide information about the trainers, including their specialization, experience, qualifications, availability."
            "If the user asks about the gym's timings, you can mention that the gym is open from 6 AM to 10 PM on weekdays and 8 AM to 8 PM on weekends. /n",
        )

        # Call the AI model
        result = client.predict(
            req_message,  # User input (e.g., "What are your timings?")
            system_instruction,  # Personalized AI instruction
            2048,  # max_tokens
            0.7,  # temperature
            0.95,  # top_p
            api_name="/chat",
        )

        # Debugging: Print raw AI response
        # print("Raw AI Response:", result)

        # Ensure result is JSON formatted
        if isinstance(result, str):
            try:
                result = json.loads(result)  # Convert AI response to JSON
            except json.JSONDecodeError as e:
                result = {"response": result}  # Wrap the AI response in a JSON object

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse(
            {"error": "Internal server error", "details": str(e)}, status=500
        )


@api_view(["POST"])
def assign_trainer(request):

    if (
        not request.user.is_authenticated
        or getattr(request.user, "user_type", "") != "admin"
    ):
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    user_id = request.data.get("user_id")
    trainer_id = request.data.get("trainer_id")

    try:
        user = User.objects.get(id=user_id, user_type="user")
        trainer = User.objects.get(id=trainer_id, user_type="trainer")
    except User.DoesNotExist:
        return Response(
            {"detail": "User or trainer not found."}, status=status.HTTP_404_NOT_FOUND
        )

    assignment, created = TrainerAssignment.objects.update_or_create(
        user=user, defaults={"trainer": trainer}
    )

    return Response(
        {"message": f"Trainer {trainer.name} assigned to {user.name}"},
        status=status.HTTP_200_OK,
    )


@api_view(["DELETE"])
def remove_trainer(request, user_id):

    if (
        not request.user.is_authenticated
        or getattr(request.user, "user_type", "") != "admin"
    ):
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        assignment = TrainerAssignment.objects.get(user_id=user_id)
        assignment.delete()
        return Response(
            {"message": "Trainer assignment removed successfully"},
            status=status.HTTP_200_OK,
        )
    except TrainerAssignment.DoesNotExist:
        return Response(
            {"detail": "No trainer assigned to this user."},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["GET"])
def view_assigned_trainers(request):

    if (
        not request.user.is_authenticated
        or getattr(request.user, "user_type", "") != "admin"
    ):
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    assignments = TrainerAssignment.objects.select_related("user", "trainer")

    data = [
        {
            "user_id": assignment.user.id,
            "user_name": assignment.user.name,
            "trainer_id": assignment.trainer.id,
            "trainer_name": assignment.trainer.name,
        }
        for assignment in assignments
    ]

    return Response({"assigned_trainers": data}, status=status.HTTP_200_OK)


@api_view(["GET"])
def view_assigned_trainer_for_user(request, user_id):
    # Check if the user is authenticated and an admin
    if (
        not request.user.is_authenticated
        or getattr(request.user, "user_type", "") != "admin"
    ):
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Filter assignments for the given user ID and include related data
    assignments = TrainerAssignment.objects.select_related(
        "trainer__trainer_profile"
    ).filter(user_id=user_id)

    # If no assignment found, return appropriate response
    if not assignments.exists():
        return Response(
            {"detail": "No trainer assigned for this user."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Prepare response data
    data = [
        {
            "user_id": assignment.user.id,
            "user_name": assignment.user.name,
            "trainer_id": assignment.trainer.id,
            "trainer_name": assignment.trainer.name,
            "experience": assignment.trainer.trainer_profile.experience_years,  # Fetch from TrainerProfile
            "specialization": assignment.trainer.trainer_profile.specialization,  # Fetch from TrainerProfile
            "availability": assignment.trainer.trainer_profile.availability,  # Fetch from TrainerProfile
        }
        for assignment in assignments
    ]

    return Response({"assigned_trainers": data}, status=status.HTTP_200_OK)


def clean_reps(value):
    """Convert reps values to integers while handling 's' and 'm' cases."""
    if isinstance(value, int):  # If it's already a number, keep it
        return value
    if isinstance(value, str):  # If it's a string, clean it
        cleaned_value = re.sub(r"[sm]", "", value)  # Remove 's' or 'm'
        return int(cleaned_value) if cleaned_value.isdigit() else None
    return None


@api_view(["POST"])
def chat(request):
    if not request.user.is_authenticated:
        return Response(
            {"message": "You are not logged in!"}, status=status.HTTP_403_FORBIDDEN
        )
    try:
        # Get user input from request
        req_message = (
            request.data.get("message") or "6-day workout plan monday to saturday"
        )
        weight = request.data.get("weight")
        height = request.data.get("height")
        age = request.data.get("age")
        target = request.data.get("target")

        if not all([weight, height, age, target]):
            return JsonResponse(
                {"error": "Weight, height, age, and target are required"}, status=400
            )

        # Enforce JSON-only response with personalized details
        system_instruction = (
            "You are a gym assistant. Generate a strict 6-day workout plan (Monday-Saturday) "
            "based on the user's details in **valid JSON format only**.\n\n"
            "**STRICT JSON RESPONSE FORMAT:**\n"
            "{"
            '  "week": {'
            '    "Monday": {'
            '      "day": "Monday",'
            '      "body_part": "Upper Body",'
            '      "workout": ['
            '        {"exercise": "Bench Press", "sets": "4", "reps": "8", "rest": "90"},'
            '        {"exercise": "Cable Flyes", "sets": "3", "reps": "10", "rest": "60"}'
            "      ]"
            "    },"
            '    "Tuesday": { ... },'
            '    "Wednesday": { ... },'
            "  }"
            "}\n"
            "DO NOT include any explanations, comments, or markdown formatting.\n"
            "ONLY return a valid JSON object."
        )

        user_details = {
            "Age": age,
            "Height": f"{height} cm",
            "Weight": f"{weight} kg",
            "Target": target,  # Example: "weight loss", "muscle gain"
        }

        prompt = json.dumps(user_details, indent=2)

        # Call the AI model
        result = client.predict(
            prompt,  # User input (e.g., "6-day workout plan")
            system_instruction,  # Personalized AI instruction
            2048,  # max_tokens
            0.7,  # temperature
            0.95,  # top_p
            api_name="/chat",
        )

        result = result.strip("'").replace("'", '"')

        start = result.find("{")
        end = (result.rfind("}") + 1) or len(result)

        result = result[start:end]

        result = re.sub(r"(\d+)([a-zA-Z]+)", r"\1", result)
        result = json.loads(result)

        serializer = DefaultWorkoutSerializer(
            data={"exercise_data": result}, context={"user": request.user}
        )

        if serializer.is_valid():
            serializer.save()

        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        return JsonResponse(
            {"error": "Internal server error", "details": str(e)}, status=500
        )


@api_view(["GET"])
def get_default_workout(request):
    if not request.user.is_authenticated:
        return Response(
            {"message": "You are not logged in!"}, status=status.HTTP_403_FORBIDDEN
        )

    default_workout = DefaultWorkout.objects.filter(user=request.user).first()
    if default_workout:
        serializer = DefaultWorkoutSerializer(default_workout)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(
        {"message": "No default workout found!"}, status=status.HTTP_404_NOT_FOUND
    )


class DailyWorkoutView(APIView):

    def get(self, request, date_str):
        if not request.user.is_authenticated:
            return Response(
                {"message": "You are not logged in!"}, status=status.HTTP_403_FORBIDDEN
            )

        date = datetime.strptime(date_str, "%Y-%m-%d").date()
        workout = DailyWorkout.objects.filter(user=request.user, date=date).first()
        if workout:
            return Response(
                DailyWorkoutSerializer(workout).data, status=status.HTTP_200_OK
            )
        return Response(
            {"message: No data found for the user on this date!"},
            status=status.HTTP_404_NOT_FOUND,
        )

    def post(self, request, date_str):
        if not request.user.is_authenticated:
            return Response(
                {"message": "You are not logged in!"}, status=status.HTTP_403_FORBIDDEN
            )

        date = datetime.strptime(date_str, "%Y-%m-%d").date()
        serializer = DailyWorkoutSerializer(
            data=request.data, context={"user": request.user, "date": date}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, date_str):
        if not request.user.is_authenticated:
            return Response(
                {"message": "You are not logged in!"}, status=status.HTTP_403_FORBIDDEN
            )

        date = datetime.strptime(date_str, "%Y-%m-%d").date()
        daily_workout = DailyWorkout.objects.filter(
            user=request.user, date=date
        ).first()

        if not daily_workout:
            return Response(
                {"message": "No such data exists!"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = DailyWorkoutSerializer(
            daily_workout, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(
            {"message": "Invalid data passed!"}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
def user_payments_with_subscription(request, user_id):
    if not request.user.is_authenticated:
        return Response(
            {"message": "You are not logged in"}, status=status.HTTP_401_UNAUTHORIZED
        )

    # Ensure only admin can access
    if request.user.user_type != "admin":
        return Response(
            {"message": "Unauthorized access"}, status=status.HTTP_403_FORBIDDEN
        )

    user = get_object_or_404(User, id=user_id)
    payments = Payment.objects.filter(user=user).order_by("-payment_date")

    # Fetch the latest subscription correctly
    user_subscription = (
        UserSubscription.objects.filter(user=user).order_by("-created_at").first()
    )
    subscription = user_subscription.subscription if user_subscription else None

    payment_data = PaymentSerializer(payments, many=True).data
    subscription_data = (
        SubscriptionSerializer(subscription).data if subscription else None
    )

    return Response(
        {
            "user_id": user.id,
            "user_name": user.name,
            "payments": payment_data,
            "subscription": subscription_data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET", "POST", "PUT"])
@permission_classes([IsAuthenticated])
def sleep_log_list_create_update(request):
    if request.method == "GET":
        sleep_logs = SleepLog.objects.filter(user=request.user)
        serializer = SleepLogSerializer(sleep_logs, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = SleepLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "PUT":
        try:
            sleep_logs = SleepLog.objects.filter(
                user=request.user, sleep_date=request.data["sleep_date"]
            )
            if sleep_logs.exists():
                sleep_log = sleep_logs.first()  # Update the first matching entry
                serializer = SleepLogSerializer(
                    sleep_log, data=request.data, partial=True
                )
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(
                    {"error": "Sleep log not found"}, status=status.HTTP_404_NOT_FOUND
                )
        except MultipleObjectsReturned:
            return Response(
                {"error": "Multiple sleep logs found for the same date"},
                status=status.HTTP_400_BAD_REQUEST,
            )


@api_view(["GET"])
def get_user_by_firebase_id(request, firebase_id):
    user = get_object_or_404(User, user_id=firebase_id)
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def view_assigned_users_for_trainer(request, id):
    """
    Get all users assigned to a specific trainer, including their attendance data.
    """
    try:
        # Ensure the trainer exists
        trainer = User.objects.get(id=id, user_type="trainer")
    except User.DoesNotExist:
        return Response(
            {"detail": "Trainer not found."}, status=status.HTTP_404_NOT_FOUND
        )

    # Fetch assigned users for this trainer
    assignments = TrainerAssignment.objects.filter(trainer=trainer).select_related(
        "user"
    )

    # If no assignments found, return a 404 response
    if not assignments.exists():
        return Response(
            {"detail": "No users assigned to this trainer."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Extract the users from assignments
    users = [assignment.user for assignment in assignments]

    # Serialize user data
    user_serializer = UserSerializer(users, many=True)

    # Fetch attendance data for each user
    response_data = []
    for user in users:
        # Get attendance records for the user
        attendance_records = Attendance.objects.filter(user=user)
        attendance_serializer = AttendanceSerializer(attendance_records, many=True)

        # Combine user and attendance data
        user_data = user_serializer.data[users.index(user)]
        user_data["attendance"] = attendance_serializer.data
        response_data.append(user_data)

    return Response({"assigned_users": response_data}, status=status.HTTP_200_OK)


class AttendanceCheckOutView(APIView):
    """API for trainers to check out a user with a given check-out time"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        trainer = request.user
        if trainer.user_type != "trainer":
            return Response(
                {"error": "Only trainers are allowed to check-out users"},
                status=status.HTTP_403_FORBIDDEN,
            )

        user_id = request.data.get("user_id")
        check_out_time = request.data.get("check_out_time")

        if not user_id or not check_out_time:
            return Response(
                {"error": "User ID and check-out time are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            # Validate check-out time format (HH:MM:SS)
            check_out_time_obj = datetime.strptime(check_out_time, "%H:%M:%S").time()
        except ValueError:
            return Response(
                {"error": "Invalid check-out time format. Use HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = datetime.today().date()

        try:
            attendance_record = Attendance.objects.get(
                user=user, created_at__date=today
            )
        except Attendance.DoesNotExist:
            return Response(
                {"error": "No check-in record found for today"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if attendance_record.check_out_time:
            return Response(
                {"error": "User has already checked out today"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        attendance_record.check_out_time = check_out_time_obj
        attendance_record.save()

        return Response(
            AttendanceSerializer(attendance_record).data, status=status.HTTP_200_OK
        )


class AttendanceListView(APIView):
    """API to get all attendance records for a specific user (Only accessible by trainers)"""

    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        trainer = request.user
        if trainer.user_type != "trainer":
            return Response(
                {"error": "Only trainers are allowed to view attendance records"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        attendance_records = Attendance.objects.filter(user=user).order_by(
            "-created_at"
        )
        serializer = AttendanceSerializer(attendance_records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AttendanceCheckInView(APIView):
    """API for trainers to check in a user with a given check-in time"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        trainer = request.user
        if trainer.user_type != "trainer":
            return Response(
                {"error": "Only trainers are allowed to check-in users"},
                status=status.HTTP_403_FORBIDDEN,
            )

        user_id = request.data.get("user_id")
        check_in_time = request.data.get("check_in_time")

        if not user_id or not check_in_time:
            return Response(
                {"error": "User ID and check-in time are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            # Validate check-in time format (HH:MM:SS)
            check_in_time_obj = datetime.strptime(check_in_time, "%H:%M:%S").time()
        except ValueError:
            return Response(
                {"error": "Invalid check-in time format. Use HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = datetime.today().date()

        # Check if the user has already checked in today
        attendance_record, created = Attendance.objects.get_or_create(
            user=user,
            created_at__date=today,
            defaults={"check_in_time": check_in_time_obj, "status": "present"},
        )

        if not created:
            return Response(
                {"error": "User has already checked in today"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            AttendanceSerializer(attendance_record).data, status=status.HTTP_201_CREATED
        )


class TrainerAttendanceCheckInView(APIView):
    """API for trainers to check in with a given check-in time"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        trainer = request.user
        if trainer.user_type != "trainer":
            return Response(
                {"error": "Only trainers are allowed to check-in"},
                status=status.HTTP_403_FORBIDDEN,
            )

        trainer_id = request.data.get("trainer_id")
        check_in_time = request.data.get("check_in_time")

        if not trainer_id or not check_in_time:
            return Response(
                {"error": "Trainer ID and check-in time are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            trainer_user = User.objects.get(id=trainer_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Trainer not found"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            # Validate check-in time format (HH:MM:SS)
            check_in_time_obj = datetime.strptime(check_in_time, "%H:%M:%S").time()
        except ValueError:
            return Response(
                {"error": "Invalid check-in time format. Use HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = datetime.today().date()

        # Check if the trainer has already checked in today
        attendance_record, created = Attendance.objects.get_or_create(
            user=trainer_user,
            created_at__date=today,
            defaults={"check_in_time": check_in_time_obj, "status": "present"},
        )

        if not created:
            return Response(
                {"error": "Trainer has already checked in today"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            AttendanceSerializer(attendance_record).data, status=status.HTTP_201_CREATED
        )


class TrainerAttendanceCheckOutView(APIView):
    """API for trainers to check out with a given check-out time"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        trainer = request.user
        if trainer.user_type != "trainer":
            return Response(
                {"error": "Only trainers are allowed to check-out"},
                status=status.HTTP_403_FORBIDDEN,
            )

        trainer_id = request.data.get("trainer_id")
        check_out_time = request.data.get("check_out_time")

        if not trainer_id or not check_out_time:
            return Response(
                {"error": "Trainer ID and check-out time are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            trainer_user = User.objects.get(id=trainer_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Trainer not found"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            # Validate check-out time format (HH:MM:SS)
            check_out_time_obj = datetime.strptime(check_out_time, "%H:%M:%S").time()
        except ValueError:
            return Response(
                {"error": "Invalid check-out time format. Use HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = datetime.today().date()

        try:
            attendance_record = Attendance.objects.get(
                user=trainer_user, created_at__date=today
            )
        except Attendance.DoesNotExist:
            return Response(
                {"error": "No check-in record found for today"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if attendance_record.check_out_time:
            return Response(
                {"error": "Trainer has already checked out today"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        attendance_record.check_out_time = check_out_time_obj
        attendance_record.save()

        return Response(
            AttendanceSerializer(attendance_record).data, status=status.HTTP_200_OK
        )


class TrainerAttendanceListView(APIView):
    """API for trainers to view their own check-in and check-out history"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        trainer = request.user
        if trainer.user_type != "trainer":  # Ensure only trainers can access
            return Response(
                {"error": "Only trainers can view their attendance records"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Fetch attendance records where the logged-in user is a trainer
        attendance_records = Attendance.objects.filter(user=trainer).order_by(
            "-created_at"
        )

        if not attendance_records.exists():
            return Response(
                {"error": "No attendance records found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            AttendanceSerializer(attendance_records, many=True).data,
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
def get_trainer_by_id(request, trainer_id):
    if not request.user.is_authenticated:
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Create a unique cache key
    cache_key = f"trainer_detail_{trainer_id}"

    # Try to get cached data
    cached_data = cache.get(cache_key)
    if cached_data is not None:
        return Response(cached_data, status=status.HTTP_200_OK)

    try:
        # Fetch the trainer (ensure user_type is 'trainer')
        trainer = get_object_or_404(
            User.objects.select_related("trainer_profile"),
            id=trainer_id,
            user_type="trainer",
        )

        # Serialize the trainer
        serializer = LightweightUserSerializer(trainer)

        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error fetching trainer: {e}")
        return Response(
            {"detail": "An error occurred while fetching the trainer."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class TrainerDetailView(APIView):
    """Retrieve a specific trainer by ID along with their attendance records"""

    permission_classes = [IsAuthenticated]

    def get(self, request, trainer_id):
        trainer = get_object_or_404(User, id=trainer_id, user_type="trainer")
        trainer_data = UserSerializer(trainer).data

        # Fetch attendance records for this trainer
        attendance_records = Attendance.objects.filter(user=trainer)
        attendance_data = AttendanceSerializer(attendance_records, many=True).data

        return Response(
            {
                "trainer": trainer_data,
                "attendance": attendance_data,
            },
            status=status.HTTP_200_OK,
        )


class ChatMessageListView(generics.ListAPIView):
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        trainer_id = self.kwargs["trainer_id"]
        return ChatMessage.objects.filter(
            sender_id__in=[user_id, trainer_id], receiver_id__in=[user_id, trainer_id]
        ).order_by("timestamp")


class SendMessageView(APIView):
    def post(self, request, *args, **kwargs):
        sender_id = request.data.get("sender_id")
        receiver_id = request.data.get("receiver_id")
        message_text = request.data.get("message")

        # Check if users exist
        try:
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Save message to DB
        chat_message = ChatMessage.objects.create(
            sender=sender, receiver=receiver, message=message_text
        )

        return Response(
            {"message": "Message sent successfully!"}, status=status.HTTP_201_CREATED
        )


class TrainerMessagesView(generics.ListAPIView):
    """API view to list messages received and sent by a trainer"""

    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        trainer_id = self.kwargs["trainer_id"]
        return ChatMessage.objects.filter(
            sender_id=trainer_id  # Messages sent by the trainer
        ) | ChatMessage.objects.filter(
            receiver_id=trainer_id  # Messages received by the trainer
        ).order_by(
            "timestamp"
        )


class GetUserBySenderIDView(generics.RetrieveAPIView):
    """API view to retrieve user details by sender_id"""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        sender_id = self.kwargs["sender_id"]
        return User.objects.get(id=sender_id)


class TrainerSendRecievedMessageListView(generics.ListAPIView):
    """API to get messages sent and received by a trainer from a specific user"""

    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        trainer_id = self.kwargs["trainer_id"]
        user_id = self.kwargs["user_id"]

        return ChatMessage.objects.filter(
            sender_id__in=[trainer_id, user_id], receiver_id__in=[trainer_id, user_id]
        ).order_by("timestamp")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_subscriptions_for_user(request):
    # Authenticate user from token
    auth = JWTAuthentication()
    user_auth_tuple = auth.authenticate(request)

    if user_auth_tuple is None:
        return Response(
            {"detail": "Invalid or missing access token."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user, _ = user_auth_tuple  # Extract the authenticated user

    # Fetch subscriptions from UserSubscription model
    user_subscriptions = UserSubscription.objects.filter(user=user).select_related(
        "subscription"
    )

    # Serialize subscriptions
    subscriptions_data = [
        {
            "id": us.subscription.id,
            "name": us.subscription.name,
            "duration": us.subscription.duration,
            "price": us.subscription.price,
            "start_date": us.start_date,
            "end_date": us.end_date,
            "status": us.status,
        }
        for us in user_subscriptions
    ]

    return Response(subscriptions_data, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_user_attendance(request):

    if not request.user.is_authenticated:
        return Response(
            {"message": "You are not logged in!"}, status=status.HTTP_401_UNAUTHORIZED
        )

    attendance_data = Attendance.objects.filter(user=request.user, status="present").order_by('-check_in_time')

    if not attendance_data:
        return Response(
            {"message": "No attendance data found!"}, status=status.HTTP_404_NOT_FOUND
        )

    serializer = AttendanceSerializer(attendance_data, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


class GetAssignedTrainerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        if isinstance(user, AnonymousUser):
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        
        try:
            assignment = TrainerAssignment.objects.select_related("trainer__trainer_profile").get(user=user)
            trainer_profile = assignment.trainer.trainer_profile
            data = {
                "trainer_id": assignment.trainer.id,
                "trainer_name": assignment.trainer.name,
                "experience": trainer_profile.experience_years,
                "specialization": trainer_profile.specialization,
                "availability": trainer_profile.availability,
            }
            return Response(data, status=status.HTTP_200_OK)
        except TrainerAssignment.DoesNotExist:
            return Response(
                {"detail": "No trainer assigned to this user."},
                status=status.HTTP_404_NOT_FOUND, 
            )



class UserSendReceivedMessageListView(generics.ListAPIView):
    """API to get messages sent and received by a user from a specific trainer"""
    
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.request.user.id  # Get user ID from access token
        trainer_id = self.kwargs["trainer_id"]
        
        return ChatMessage.objects.filter(
            sender_id__in=[user_id, trainer_id],
            receiver_id__in=[user_id, trainer_id]
        ).order_by("timestamp")


 
