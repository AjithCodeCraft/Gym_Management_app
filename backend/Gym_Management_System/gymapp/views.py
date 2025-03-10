import random
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from rest_framework.views import APIView

from .models import OTPVerification, Payment, Subscription, TrainerProfile, User, UserSubscription, NutritionGoal, DefaultUserMetrics
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.contrib.auth.hashers import make_password, check_password
from firebase_admin import auth
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from django.conf import settings
from django.core.mail import send_mail
from .serializers import LightweightUserSerializer, SubscriptionSerializer, UserSerializer, NutritionGoalSerializer, DefaultUserMetricsSerializer
from datetime import datetime


# Create your views here.


@api_view(['POST'])
def send_otp(request):
    email = request.data.get('email')

    # Validate required fields
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if email already exists in MongoDB
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    # Generate a 6-digit OTP
    otp = random.randint(100000, 999999)

    # Store OTP in MongoDB (Temporary Storage)
    OTPVerification.objects.update_or_create(
        email=email,
        defaults={"otp": otp, "created_at": timezone.now()}  # Use timezone-aware timestamp
    )

    # Send OTP via email
    try:
        send_mail(
            subject="Your OTP for Registration",
            message=f"Your OTP is: {otp}. It is valid for 5 minutes.",
            from_email="alameena068@gmail.com",
            recipient_list=[email],
        )

        return Response({'message': 'OTP sent. Verify OTP to complete registration.'}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f'Error sending OTP email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')

    if not email or not otp:
        return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if OTP is valid
    try:
        otp_entry = OTPVerification.objects.get(email=email)
        otp_created_time = otp_entry.created_at  # Already timezone-aware
        current_time = timezone.now()  # Ensure timezone awareness

        # Check OTP expiry (valid for 5 minutes)
        if (current_time - otp_created_time).total_seconds() > 300:
            return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

        # Check OTP correctness
        if otp_entry.otp != int(otp):
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'OTP verified successfully'}, status=status.HTTP_200_OK)

    except OTPVerification.DoesNotExist:
        return Response({'error': 'OTP not found or already used'}, status=status.HTTP_400_BAD_REQUEST)


VALID_USER_TYPES = ['user', 'trainer', 'admin']


@api_view(['POST'])
def register_user(request):
    email = request.data.get('email')
    name = request.data.get('name')
    phone = request.data.get('phone_number')
    user_type = request.data.get('user_type', 'user')

    # Set password based on user type
    if user_type == 'admin':
        password = request.data.get('password')
    else:
        email_prefix = email.split('@')[0]
        password = f"{email_prefix}@fortifit"

    # Trainer-specific fields
    specialization = request.data.get('specialization')
    experience_years = request.data.get('experience_years')
    qualifications = request.data.get('qualifications')
    availability = request.data.get('availability')
    salary = request.data.get('salary')

    # Subscription (for normal users)
    subscription_plan_id = request.data.get('subscription_plan_id')

    # Validate user type
    if user_type not in VALID_USER_TYPES:
        return Response({'error': 'Invalid user type'}, status=status.HTTP_400_BAD_REQUEST)

    if not email or not phone:
        return Response({'error': 'Email and phone are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        auth.get_user_by_email(email)
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    except auth.UserNotFoundError:
        pass  # Email does not exist, continue checking phone number

    # Check if phone number exists in Firebase
    try:
        auth.get_user_by_phone_number(phone)
        return Response({'error': 'Phone number already exists'}, status=status.HTTP_400_BAD_REQUEST)
    except auth.UserNotFoundError:
        pass

    # Check if email exists in Django
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists '}, status=status.HTTP_400_BAD_REQUEST)

    # Check if phone number exists in Django User model
    if User.objects.filter(phone_number=phone).exists():
        return Response({'error': 'Phone number already exists '}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create user in Firebase
        new_user = auth.create_user(
            email=email,
            password=password,
            email_verified=True
        )

        # Update Firebase user profile
        auth.update_user(
            new_user.uid,
            phone_number=phone
        )

        # Save user in Django
        user = User.objects.create(
            user_id=new_user.uid,
            email=email,
            phone_number=phone,
            name=name,
            user_type=user_type,
            password=make_password(password)  # Store hashed password
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

        if user_type == 'user':
            # Validate Subscription Plan
            try:
                subscription_plan = Subscription.objects.get(id=subscription_plan_id)
            except Subscription.DoesNotExist:
                return Response({'error': 'Subscription plan not found'}, status=status.HTTP_404_NOT_FOUND)

            # Create Payment record
            payment = Payment.objects.create(
                user=user,
                amount=subscription_plan.price,
                payment_date=timezone.now(),
                status='completed',
                payment_method='offline'
            )

            # Create Subscription record
            start_date = timezone.now().date()
            end_date = start_date + relativedelta(months=subscription_plan.duration)
            UserSubscription.objects.create(
                user=user,
                subscription=subscription_plan,
                start_date=start_date,
                end_date=end_date,
                status='active'
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

        elif user_type == 'trainer':
            # Validate Trainer fields
            if not (specialization and experience_years and qualifications and availability and salary):
                return Response({'error': 'All trainer fields are required'}, status=status.HTTP_400_BAD_REQUEST)

            # Create Trainer Profile
            TrainerProfile.objects.create(
                user=user,
                specialization=specialization,
                experience_years=experience_years,
                qualifications=qualifications,
                availability=availability,
                salary=salary
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

        return Response({
            "message": "User created successfully",
            "user_id": new_user.uid,
            "user_type": user_type
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def send_password_reset_email(request):
    email = request.data.get('email')

    if not email:
        return Response({'error': 'Email is required'}, status=400)

    try:
        # Send password reset email using Firebase
        link = auth.generate_password_reset_link(email)
        send_mail(
            subject="Reset Your Password",
            message=f"Click the link below to reset your password:\n{link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({'message': 'Password reset email sent'}, status=200)

    except Exception as e:
        return Response({'error': f'Failed to send email: {str(e)}'}, status=500)


@api_view(['POST'])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Verify user with Firebase Authentication
        firebase_user = auth.get_user_by_email(email)

        # Firebase does not store passwords, so we need to sign in using Firebase REST API

        firebase_api_key = "AIzaSyB6M8BgWoTQq2RCFkAMMC82wSnER1E8z0g"  # Replace with your Firebase API Key
        firebase_auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={firebase_api_key}"

        payload = {
            "email": email,
            "password": password,
            "returnSecureToken": True
        }

        response = requests.post(firebase_auth_url, json=payload)
        firebase_data = response.json()

        if "error" in firebase_data:
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

        # Check if the user exists in the Django database
        user = User.objects.get(email=email)

        # If the stored password is different, update it
        if not check_password(password, user.password):
            user.password = make_password(password)
            user.save()

        # Generate JWT token
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_id': user.user_id,
            'email': user.email,
            'name': user.name,
            'user_type': user.user_type
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def list_subscriptions(request):
    if not request.user.is_authenticated or getattr(request.user, "user_type", "") != "admin":
        return Response({"detail": "You do not have permission to perform this action."},
                        status=status.HTTP_403_FORBIDDEN)

    # Check if the data is in the cache
    cache_key = 'subscriptions_list'
    cached_data = cache.get(cache_key)
    if cached_data:
        return Response(cached_data, status=status.HTTP_200_OK)

    # Fetch data from the database
    subscriptions = Subscription.objects.all()  # Remove select_related if not needed
    serializer = SubscriptionSerializer(subscriptions, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def add_subscription(request):
    if not request.user.is_authenticated or getattr(request.user, "user_type", "") != "admin":
        return Response({"detail": "You do not have permission to perform this action."},
                        status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()
    if data.get("personal_training"):
        data["price"] = float(data.get("price", 0)) + 5000

    serializer = SubscriptionSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def update_subscription(request, subscription_id):
    if not request.user.is_authenticated or getattr(request.user, "user_type", "") != "admin":
        return Response({"detail": "You do not have permission to perform this action."},
                        status=status.HTTP_403_FORBIDDEN)

    try:
        subscription = Subscription.objects.get(id=subscription_id)
    except Subscription.DoesNotExist:
        return Response({"detail": "Subscription not found."}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()

    if "personal_training" in data:
        new_personal_training = data.get("personal_training")
        if bool(new_personal_training) != subscription.personal_training:
            if new_personal_training:
                data["price"] = float(data.get("price", subscription.price)) + 5000
            else:
                data["price"] = max(float(data.get("price", subscription.price)) - 5000, 0)

    serializer = SubscriptionSerializer(subscription, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_subscription(request, subscription_id):
    if not request.user.is_authenticated or getattr(request.user, "user_type", "") != "admin":
        return Response({"detail": "You do not have permission to perform this action."},
                        status=status.HTTP_403_FORBIDDEN)

    try:
        subscription = Subscription.objects.get(id=subscription_id)
    except Subscription.DoesNotExist:
        return Response({"detail": "Subscription not found."}, status=status.HTTP_404_NOT_FOUND)

    subscription.delete()
    return Response({"detail": "Subscription deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def list_users(request):
    if not request.user.is_authenticated or getattr(request.user, "user_type", "") != "admin":
        return Response({"detail": "You do not have permission to perform this action."},
                        status=status.HTTP_403_FORBIDDEN)

    users = User.objects.filter(user_type="user")
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def list_trainers(request):
    if not request.user.is_authenticated or getattr(request.user, "user_type", "") != "admin":
        return Response({"detail": "You do not have permission to perform this action."},
                        status=status.HTTP_403_FORBIDDEN)

    trainers = User.objects.filter(user_type="trainer")
    serializer = UserSerializer(trainers, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def delete_all(request):
    User.objects.all().delete()
    return Response({"message": "All users deleted."}, status=status.HTTP_200_OK)


@api_view(['GET'])
def list_users_and_trainers(request):
    if not request.user.is_authenticated or getattr(request.user, "user_type", "") != "admin":
        return Response({"detail": "You do not have permission to perform this action."},
                        status=status.HTTP_403_FORBIDDEN)

    user_type = request.query_params.get("type")
    if user_type not in ["user", "trainer"]:
        return Response(
            {"detail": "Invalid type parameter. Use 'user' or 'trainer'."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create a unique cache key
    cache_key = f"users_list_{user_type}_{request.user.id}"

    # Try to get cached data
    cached_data = cache.get(cache_key)
    if cached_data is not None:
        return Response(cached_data, status=status.HTTP_200_OK)

    try:
        # Optimized queryset with select_related and prefetch_related
        users = User.objects.select_related(
            'trainer_profile'
        ).prefetch_related(
            'subscriptions__subscription'
        ).filter(
            user_type=user_type
            # Only active users
        ).order_by('-created_at')  # Most recent first

        # Serialize the data
        serializer = LightweightUserSerializer(users, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        # Log the error (replace with your logging mechanism)
        print(f"Error fetching users: {e}")
        return Response(
            {"detail": "An error occurred while fetching users."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Additional utility function for cache invalidation
def invalidate_users_cache(user_type, user_id):
    """
    Invalidate cache for a specific user type and user
    """
    cache_key = f"users_list_{user_type}_{user_id}"
    cache.delete(cache_key)


@api_view(['PUT'])
def update_user_details(request):
    if not request.user.is_authenticated or getattr(request.user, "user_type", "") != "admin":
        return Response({"detail": "You do not have permission to perform this action."},
                        status=status.HTTP_403_FORBIDDEN)

    email = request.data.get('email')
    action = request.data.get('action')  # 'cancel', 'upgrade', or None for only updating phone number
    new_plan_id = request.data.get('new_plan_id')  # Required for upgrade
    is_active = request.data.get('is_active')  # Enable or disable user
    phone_number = request.data.get('phone_number')  # Update phone number

    try:
        user = User.objects.get(email=email)
        subscription = UserSubscription.objects.filter(user=user, status='active').first()

        # Update user details if needed (phone number and activation status)
        if is_active is not None:
            user.is_active = is_active
        if phone_number:
            user.phone_number = phone_number
        user.save()

        # If no subscription action is provided, return success after updating phone number
        if not action:
            return Response({'message': 'User details updated successfully'}, status=status.HTTP_200_OK)

        if action == 'cancel':
            if not subscription:
                return Response({'error': 'No active subscription found'}, status=status.HTTP_404_NOT_FOUND)

            subscription.status = 'cancelled'
            subscription.end_date = timezone.now().date()
            subscription.save()
            return Response({'message': 'Subscription cancelled successfully'}, status=status.HTTP_200_OK)

        elif action == 'upgrade':
            try:
                new_plan = Subscription.objects.get(id=new_plan_id)
            except Subscription.DoesNotExist:
                return Response({'error': 'New subscription plan not found'}, status=status.HTTP_404_NOT_FOUND)

            # Check if user has a cancelled subscription
            cancelled_subscription = UserSubscription.objects.filter(user=user, status='cancelled').first()
            if cancelled_subscription:
                # Reactivate the cancelled subscription instead of creating a new one
                cancelled_subscription.subscription = new_plan
                cancelled_subscription.status = 'active'
                cancelled_subscription.start_date = timezone.now().date()
                cancelled_subscription.end_date = cancelled_subscription.start_date + relativedelta(
                    months=new_plan.duration)
                cancelled_subscription.save()
                return Response({'message': 'Cancelled subscription reactivated with new plan'},
                                status=status.HTTP_200_OK)

            # If no cancelled subscription, upgrade the active one
            if subscription:
                subscription.subscription = new_plan
                subscription.start_date = timezone.now().date()
                subscription.end_date = subscription.start_date + relativedelta(months=new_plan.duration)
                subscription.save()
                return Response({'message': 'Subscription upgraded successfully'}, status=status.HTTP_200_OK)

            # If no active or cancelled subscription, create a new one
            new_subscription = UserSubscription.objects.create(
                user=user,
                subscription=new_plan,
                start_date=timezone.now().date(),
                end_date=timezone.now().date() + relativedelta(months=new_plan.duration),
                status='active'
            )
            return Response({'message': 'New subscription added successfully'}, status=status.HTTP_201_CREATED)

        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
def update_trainer_details(request):
    if not request.user.is_authenticated or getattr(request.user, "user_type", "") != "admin":
        return Response({"detail": "You do not have permission to perform this action."},
                        status=status.HTTP_403_FORBIDDEN)

    email = request.data.get('email')
    specialization = request.data.get('specialization')
    experience_years = request.data.get('experience_years')
    qualifications = request.data.get('qualifications')
    availability = request.data.get('availability')
    salary = request.data.get('salary')
    is_active = request.data.get('is_active')  # Enable or disable trainer
    phone_number = request.data.get('phone_number')  # Update phone number

    try:
        user = User.objects.get(email=email, user_type='trainer')
        trainer_profile = TrainerProfile.objects.get(user=user)

        if is_active is not None:
            user.is_active = is_active
        if phone_number:
            user.phone_number = phone_number
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

        return Response({'message': 'Trainer details updated successfully'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'Trainer not found'}, status=status.HTTP_404_NOT_FOUND)
    except TrainerProfile.DoesNotExist:
        return Response({'error': 'Trainer profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NutritionGoalView(APIView):

    def get(self, request, date_str):
        if not request.user.is_authenticated:
            return Response({"message": "You are not logged in"}, status=status.HTTP_401_UNAUTHORIZED)
        
        date = datetime.strptime(date_str, "%Y-%m-%d").date()
        
        goals = NutritionGoal.objects.filter(user=request.user, created_at=date).first()
        data = NutritionGoalSerializer(goals).data
        if not goals:
            goals = NutritionGoal.objects.filter(user=request.user).order_by('-created_at').first()
            if goals:
                data = dict(NutritionGoalSerializer(goals).data)
                for item in ['breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner']:
                    data[item] = []
        return Response(data, status=status.HTTP_200_OK)
        return Response({'error': 'No nutrition goal found for current user'}, status=status.HTTP_404_NOT_FOUND)

    # Will handle both Create and Update
    def put(self, request, date_str):
        if not request.user.is_authenticated:
            return Response({"message": "You are not logged in"}, status=status.HTTP_401_UNAUTHORIZED)
        
        date = datetime.strptime(date_str, "%Y-%m-%d").date()
        
        serializer = NutritionGoalSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            goal, created = NutritionGoal.objects.update_or_create(user=request.user, created_at=date, defaults=validated_data)
            return Response(NutritionGoalSerializer(goal).data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
