from uuid import uuid4
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin




class Demo(models.Model):
    name = models.CharField(max_length=20)
    age = models.IntegerField()



class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('user_id', str(uuid4()))
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = [
        ('user', 'User'),
        ('trainer', 'Trainer'),
        ('admin', 'Admin')
    ]
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('others', 'Others')
    ]
    
    id = models.AutoField(primary_key=True)
    user_id = models.CharField(max_length=28, unique=True)  # Firebase UID
    email = models.EmailField(unique=True)
    password = models.TextField()  # Store hashed password
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
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'phone_number']


class OTPVerification(models.Model):
    email = models.EmailField(unique=True)
    otp = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email