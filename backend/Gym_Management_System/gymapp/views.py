import random
from django.utils import timezone
from django.shortcuts import render
from .models import OTPVerification, User
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import make_password, check_password
from firebase_admin import auth
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

import jwt
from django.conf import settings
from django.core.mail import send_mail
# Create your views here.


@api_view(['POST'])
def send_otp(request):
    email = request.data.get('email')

    # Validate required fields
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if email already exists in MongoDB
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists in MongoDB'}, status=status.HTTP_400_BAD_REQUEST)

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


@api_view(['POST'])
def register_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    name = request.data.get('name')
    phone = request.data.get('phone_number')
    user_type = request.data.get('user_type', 'user')  # Default to 'user'

    VALID_USER_TYPES = ['user', 'trainer', 'admin']
    if user_type not in VALID_USER_TYPES:
        return Response({'error': 'Invalid user type'}, status=status.HTTP_400_BAD_REQUEST)

    if not email or not password or not phone:
        return Response({'error': 'Email, password, and phone are required'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if email already exists in Firebase
    try:
        auth.get_user_by_email(email)
        return Response({'error': 'Email already exists in Firebase'}, status=status.HTTP_400_BAD_REQUEST)
    except auth.UserNotFoundError:
        pass

    # Check if email already exists in Django database
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists in the system'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create user in Firebase
        new_user = auth.create_user(
            email=email,
            password=password,
            email_verified=True
        )

        # Update user profile in Firebase
        auth.update_user(
            new_user.uid,
            phone_number=phone
        )

        # Store user details in Django database
        user = User.objects.create(
            user_id=new_user.uid,  # Store Firebase UID
            email=email,
            phone_number=phone,
            name=name,
            user_type=user_type,
            password=make_password(password)  # Store hashed password
        )

        # Send email to users & trainers (not admins)
        if user_type in ['user', 'trainer']:
            send_mail(
                subject="Welcome to Gym Management System",
                message=f"Hello {name},\n\nYour account has been successfully created!\n\nLogin Credentials:\nEmail: {email}\nPassword: {password}\n\nPlease keep your credentials secure.\n\nBest regards,\nGym Management Team",
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
        
        firebase_user = auth.get_user_by_email(email)
        user = User.objects.get(email=email)
        if not check_password(password, user.password): 
            user.password = make_password(password)  
            user.save()
           
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