from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    is_owner = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class Tool(models.Model):
    CATEGORY_CHOICES = [
        ('POWER_TOOLS', 'Power Tools'),
        ('HAND_TOOLS', 'Hand Tools'),
        ('GARDEN', 'Garden & Outdoor'),
        ('HEAVY_EQUIPMENT', 'Heavy Equipment'),
        ('WOODWORKING', 'Woodworking'),
        ('CLEANING', 'Cleaning'),
    ]

    CONDITION_CHOICES = [
        ('BRAND_NEW', 'Brand New'),
        ('LIKE_NEW', 'Like New'),
        ('GOOD', 'Good'),
        ('FAIR', 'Fair'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tools')
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    condition = models.CharField(max_length=50, choices=CONDITION_CHOICES)
    rate_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    image = models.URLField(max_length=500, blank=True, null=True) # Accepting URL for now as per frontend
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('RENTED', 'Rented'),
        ('RETURNED', 'Returned'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    tool = models.ForeignKey(Tool, on_delete=models.CASCADE, related_name='bookings')
    renter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rentals')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    initial_msg = models.TextField(blank=True, null=True)
    is_signed = models.BooleanField(default=False)
    actualStartTime = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking {self.id} for {self.tool.title}"

class Message(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

class Wishlist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wishlist')
    tools = models.ManyToManyField(Tool, related_name='wishlisted_by', blank=True)

    def __str__(self):
        return f"Wishlist of {self.user.email}"
