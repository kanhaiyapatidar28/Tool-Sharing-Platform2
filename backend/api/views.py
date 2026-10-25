import json
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.db.models import Sum, Count, Q
from django.shortcuts import get_object_or_404
from .models import User, Tool, Booking, Message, Notification, Wishlist
from .serializers import (
    UserSerializer, ToolSerializer, BookingSerializer,
    MessageSerializer, NotificationSerializer
)

# Custom decorator to check auth based on session or X-User-Email
def get_user_from_request(request):
    if request.user.is_authenticated:
        return request.user
    email = request.headers.get('X-User-Email')
    if email:
        try:
            user = User.objects.get(email=email)
            # Log them in automatically for this session
            if not hasattr(user, 'backend'):
                user.backend = 'django.contrib.auth.backends.ModelBackend'
            django_login(request, user)
            return user
        except User.DoesNotExist:
            pass
    return None

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def auth_check(request):
    user = get_user_from_request(request)
    if user:
        return Response({
            'isLoggedIn': True,
            'user': UserSerializer(user).data
        })
    return Response({'isLoggedIn': False})

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    # Use standard authenticate, username is email since USERNAME_FIELD is email
    user = authenticate(request, username=email, password=password)
    if user is not None:
        django_login(request, user)
        return Response({
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    email = request.data.get('email')
    name = request.data.get('name')
    password = request.data.get('password')
    is_owner = request.data.get('isOwner', False)
    
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects.create_user(username=name, email=email, password=password, is_owner=is_owner)
    if not hasattr(user, 'backend'):
        user.backend = 'django.contrib.auth.backends.ModelBackend'
    django_login(request, user)
    return Response({
        'user': UserSerializer(user).data
    })

@api_view(['POST'])
def logout_view(request):
    django_logout(request)
    return Response({'success': True})

class ToolViewSet(viewsets.ModelViewSet):
    queryset = Tool.objects.all()
    serializer_class = ToolSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        user = get_user_from_request(self.request)
        serializer.save(owner=user)

    def list(self, request, *args, **kwargs):
        # Apply filters from query params
        queryset = self.queryset
        category = request.query_params.get('category')
        owner_id = request.query_params.get('owner_id')
        if category:
            queryset = queryset.filter(category=category)
        if owner_id:
            queryset = queryset.filter(owner_id=owner_id)
        
        # We wrap in a dict matching frontend expectations: { "tools": [...] }
        serializer = self.get_serializer(queryset, many=True)
        return Response({'tools': serializer.data})

@api_view(['GET'])
def tool_availability(request, pk):
    tool = get_object_or_404(Tool, pk=pk)
    # Return events for fullcalendar
    bookings = tool.bookings.filter(status__in=['CONFIRMED', 'RENTED'])
    events = []
    for b in bookings:
        events.append({
            'title': 'Booked',
            'start': b.start_date.isoformat(),
            'end': b.end_date.isoformat(),
            'color': '#dc3545'
        })
    return Response({'events': events})

@api_view(['POST'])
def tool_update(request, pk):
    tool = get_object_or_404(Tool, pk=pk)
    user = get_user_from_request(request)
    if tool.owner != user:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = ToolSerializer(tool, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def booking_list(request):
    user = get_user_from_request(request)
    if not user:
         return Response({'error': 'Unauthorized'}, status=401)
    
    # As an owner or as a renter
    bookings = Booking.objects.filter(Q(renter=user) | Q(tool__owner=user)).distinct()
    serializer = BookingSerializer(bookings, many=True)
    return Response({'bookings': serializer.data})

@api_view(['POST'])
def booking_create(request):
    user = get_user_from_request(request)
    if not user:
         return Response({'error': 'Unauthorized'}, status=401)
         
    data = request.data
    tool_id = data.get('tool_id') or data.get('toolId')
    startDate = data.get('startDate')
    endDate = data.get('endDate')
    initial_msg = data.get('initial_msg', '')
    
    tool = get_object_or_404(Tool, id=tool_id)
    booking = Booking.objects.create(
        tool=tool,
        renter=user,
        start_date=startDate,
        end_date=endDate,
        initial_msg=initial_msg
    )
    return Response(BookingSerializer(booking).data)

@api_view(['POST'])
def booking_status(request, pk):
    booking = get_object_or_404(Booking, pk=pk)
    user = get_user_from_request(request)
    if not user:
         return Response({'error': 'Unauthorized'}, status=401)
         
    status_val = request.data.get('status')
    if status_val:
        booking.status = status_val
        booking.save()
    return Response(BookingSerializer(booking).data)

@api_view(['POST'])
def booking_confirm_deposit(request, pk):
    booking = get_object_or_404(Booking, pk=pk)
    # in real life we verify payment intent here
    booking.status = 'CONFIRMED'
    booking.save()
    return Response(BookingSerializer(booking).data)

@api_view(['POST'])
def booking_verify_qr(request):
    user = get_user_from_request(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=401)
    # The frontend payload for QR verify doesn't pass pk in URL, just POST body with token.
    # We will simulate verifying the token and finding the booking.
    # In this mock we just grab the first CONFIRMED booking for the user to make it work.
    booking = Booking.objects.filter(renter=user, status='CONFIRMED').first()
    if not booking:
        return Response({'error': 'No confirmed booking found for this QR code.'}, status=404)
        
    from django.utils import timezone
    booking.status = 'RENTED'
    booking.actualStartTime = timezone.now()
    booking.save()
    return Response(BookingSerializer(booking).data)

@api_view(['POST'])
def booking_return(request, pk):
    booking = get_object_or_404(Booking, pk=pk)
    booking.status = 'RETURNED'
    booking.save()
    return Response(BookingSerializer(booking).data)

@api_view(['POST'])
def booking_pay_balance(request, pk):
    booking = get_object_or_404(Booking, pk=pk)
    booking.status = 'COMPLETED'
    booking.save()
    return Response(BookingSerializer(booking).data)

@api_view(['POST'])
def booking_sign_agreement(request, pk):
    booking = get_object_or_404(Booking, pk=pk)
    booking.is_signed = True
    booking.save()
    return Response(BookingSerializer(booking).data)

@api_view(['GET'])
def booking_contract(request, pk):
    booking = get_object_or_404(Booking, pk=pk)
    # Simply return the booking data for contract view
    return Response(BookingSerializer(booking).data)

@api_view(['GET', 'POST'])
def booking_messages(request, pk):
    booking = get_object_or_404(Booking, pk=pk)
    user = get_user_from_request(request)
    if not user:
         return Response({'error': 'Unauthorized'}, status=401)
         
    if request.method == 'GET':
        messages = booking.messages.all()
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response({'messages': serializer.data})
    elif request.method == 'POST':
        content = request.data.get('content')
        msg = Message.objects.create(booking=booking, sender=user, content=content)
        return Response(MessageSerializer(msg, context={'request': request}).data)

@api_view(['GET'])
def owner_stats(request):
    user = get_user_from_request(request)
    if not user:
         return Response({'error': 'Unauthorized'}, status=401)
         
    my_tools = Tool.objects.filter(owner=user)
    my_bookings = Booking.objects.filter(tool__in=my_tools)
    
    total_earnings = my_bookings.filter(status='COMPLETED').aggregate(Sum('total_price'))['total_price__sum'] or 0
    active_rentals = my_bookings.filter(status='ACTIVE').count()
    
    return Response({
        'totalEarnings': float(total_earnings),
        'activeRentals': active_rentals,
        'toolsListed': my_tools.count(),
        'pendingRequests': my_bookings.filter(status='PENDING').count()
    })

@api_view(['GET'])
def wishlist_view(request):
    user = get_user_from_request(request)
    if not user:
         return Response({'error': 'Unauthorized'}, status=401)
         
    wishlist, created = Wishlist.objects.get_or_create(user=user)
    serializer = ToolSerializer(wishlist.tools.all(), many=True)
    return Response({'tools': serializer.data})

@api_view(['POST'])
def wishlist_toggle(request, pk):
    user = get_user_from_request(request)
    if not user:
         return Response({'error': 'Unauthorized'}, status=401)
         
    tool = get_object_or_404(Tool, pk=pk)
    wishlist, created = Wishlist.objects.get_or_create(user=user)
    if tool in wishlist.tools.all():
        wishlist.tools.remove(tool)
        status_val = 'removed'
    else:
        wishlist.tools.add(tool)
        status_val = 'added'
    return Response({'status': status_val})

@api_view(['GET'])
def notifications_view(request):
    user = get_user_from_request(request)
    if not user:
         return Response({'error': 'Unauthorized'}, status=401)
         
    notifications = Notification.objects.filter(user=user)
    serializer = NotificationSerializer(notifications, many=True)
    return Response({'notifications': serializer.data})
