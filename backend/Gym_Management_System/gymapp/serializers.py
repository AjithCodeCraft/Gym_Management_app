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


class LightweightUserSerializer(serializers.ModelSerializer):
    subscriptions = serializers.SerializerMethodField()
    trainer_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'user_type', 
            'gender', 'phone_number', 
            'is_active', 'created_at', 
            'subscriptions', 'trainer_profile'
        ]

    def get_subscriptions(self, obj):
        # Lightweight subscription information
        active_subs = obj.subscriptions.filter(status='active').first()
        if active_subs:
            return {
                'name': active_subs.subscription.name,
                'price': str(active_subs.subscription.price),
                'end_date': active_subs.end_date
            }
        return None

    def get_trainer_profile(self, obj):
        # Lightweight trainer profile
        if hasattr(obj, 'trainer_profile'):
            return {
                'specialization': obj.trainer_profile.specialization
            }
        return None