from rest_framework import serializers
from .models import Subscription, User, UserSubscription



class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['id', 'name', 'description', 'duration', 'personal_training', 'price']



class UserSubscriptionSerializer(serializers.ModelSerializer):
    subscription = SubscriptionSerializer(read_only=True)

    class Meta:
        model = UserSubscription
        fields = ['id', 'subscription', 'start_date', 'end_date', 'status']
        

class UserSerializer(serializers.ModelSerializer):
    subscriptions = UserSubscriptionSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'user_id', 'email', 'name', 'user_type', 'date_of_birth', 'gender', 
                  'phone_number', 'profile_picture_url', 'is_active', 'created_at', 'updated_at', 'subscriptions']
