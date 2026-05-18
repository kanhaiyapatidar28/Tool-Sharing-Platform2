import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import User, Tool, Booking
from django.utils import timezone
from datetime import timedelta

def run():
    print("Clearing existing data...")
    User.objects.all().delete()
    Tool.objects.all().delete()
    Booking.objects.all().delete()

    print("Creating users...")
    u1 = User.objects.create_user(username='John Doe', email='john@example.com', password='password123')
    u2 = User.objects.create_user(username='Jane Smith', email='jane@example.com', password='password123')

    print("Creating tools...")
    t1 = Tool.objects.create(
        owner=u1,
        title='Bosch Power Drill',
        description='A powerful drill for your home projects.',
        category='POWER_TOOLS',
        condition='LIKE_NEW',
        rate_per_day=500.00,
        deposit=1500.00,
        image='https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&q=80',
        is_available=True
    )

    t2 = Tool.objects.create(
        owner=u2,
        title='Lawn Mower',
        description='Gas powered lawn mower. Very reliable.',
        category='GARDEN',
        condition='GOOD',
        rate_per_day=800.00,
        deposit=2000.00,
        image='https://images.unsplash.com/photo-1592424005698-1e4e428c2e6f?w=500&q=80',
        is_available=True
    )

    print("Creating bookings...")
    # John rents Jane's mower
    Booking.objects.create(
        tool=t2,
        renter=u1,
        start_date=timezone.now().date(),
        end_date=timezone.now().date() + timedelta(days=3),
        status='RENTED',
        total_price=2400.00,
        initial_msg='Need this for the weekend!',
        is_signed=True,
        actualStartTime=timezone.now() - timedelta(hours=2)
    )

    print("Seeding complete.")

if __name__ == '__main__':
    run()
