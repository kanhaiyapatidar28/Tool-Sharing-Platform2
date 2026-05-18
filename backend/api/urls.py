from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tools', views.ToolViewSet, basename='tool')

urlpatterns = [
    path('auth/check/', views.auth_check, name='auth_check'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/logout/', views.logout_view, name='logout'),
    
    path('tools/create/', views.ToolViewSet.as_view({'post': 'create'}), name='tool_create'),
    path('tools/<int:pk>/update/', views.tool_update, name='tool_update'),
    path('tools/<int:pk>/availability/', views.tool_availability, name='tool_availability'),
    
    path('bookings/', views.booking_list, name='booking_list'),
    path('bookings/create/', views.booking_create, name='booking_create'),
    path('bookings/verify-qr/', views.booking_verify_qr, name='booking_verify_qr'),
    path('bookings/<int:pk>/status/', views.booking_status, name='booking_status'),
    path('bookings/<int:pk>/confirm-deposit/', views.booking_confirm_deposit, name='booking_confirm_deposit'),
    path('bookings/<int:pk>/return/', views.booking_return, name='booking_return'),
    path('bookings/<int:pk>/pay-balance/', views.booking_pay_balance, name='booking_pay_balance'),
    path('bookings/<int:pk>/sign-agreement/', views.booking_sign_agreement, name='booking_sign_agreement'),
    path('bookings/<int:pk>/contract/', views.booking_contract, name='booking_contract'),
    path('bookings/<int:pk>/messages/', views.booking_messages, name='booking_messages'),
    
    path('owner-stats/', views.owner_stats, name='owner_stats'),
    
    path('wishlist/', views.wishlist_view, name='wishlist'),
    path('wishlist/toggle/<int:pk>/', views.wishlist_toggle, name='wishlist_toggle'),
    
    path('notifications/', views.notifications_view, name='notifications'),
    
    path('', include(router.urls)),
]
