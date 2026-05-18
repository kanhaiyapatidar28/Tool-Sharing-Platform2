from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tool, Booking, Message, Notification, Wishlist

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='username') # mapping to frontend expectations
    isOwner = serializers.BooleanField(source='is_owner', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'isOwner')

class ToolSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    photos = serializers.SerializerMethodField()
    price = serializers.DecimalField(source='rate_per_day', max_digits=10, decimal_places=2, read_only=True)
    pricePerDay = serializers.DecimalField(source='rate_per_day', max_digits=10, decimal_places=2)
    
    class Meta:
        model = Tool
        fields = '__all__'
        extra_kwargs = {
            'owner': {'read_only': True},
            'rate_per_day': {'required': False}
        }

    def get_photos(self, obj):
        return [obj.image] if obj.image else []

    def create(self, validated_data):
        if 'photos' in self.initial_data and isinstance(self.initial_data['photos'], list) and len(self.initial_data['photos']) > 0:
            validated_data['image'] = self.initial_data['photos'][0]
        return super().create(validated_data)
        
    def update(self, instance, validated_data):
        if 'photos' in self.initial_data and isinstance(self.initial_data['photos'], list) and len(self.initial_data['photos']) > 0:
            instance.image = self.initial_data['photos'][0]
        return super().update(instance, validated_data)

class BookingSerializer(serializers.ModelSerializer):
    tool = ToolSerializer(read_only=True)
    tool_id = serializers.PrimaryKeyRelatedField(
        queryset=Tool.objects.all(), source='tool', write_only=True
    )
    renter_name = serializers.CharField(source='renter.username', read_only=True)
    borrowerId = serializers.IntegerField(source='renter.id', read_only=True)
    toolTitle = serializers.CharField(source='tool.title', read_only=True)
    toolPhoto = serializers.CharField(source='tool.image', read_only=True)
    ownerName = serializers.CharField(source='tool.owner.username', read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'
        extra_kwargs = {
            'renter': {'read_only': True}
        }

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = '__all__'
        extra_kwargs = {
            'sender': {'read_only': True},
            'booking': {'read_only': True}
        }

    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.sender == request.user
        return False

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}
        }
