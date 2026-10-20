from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db import models


# Create your models here.
class SessionSlot(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    start_time = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)

    class Meta:
        ordering = ["start_time"]
        constraints = [
            models.UniqueConstraint(
                fields=["start_time"],
                name="unique_session_start_time",
            ),
        ]

    def clean(self):
        super().clean()

        if self.start_time and self.start_time <= timezone.now():
            raise ValidationError({
                "start_time": "The session must start in the future."
            })

        if self.duration_minutes <= 0:
            raise ValidationError({
                "duration_minutes": "Duration must be greater than zero."
            })

    def __str__(self):
        return timezone.localtime(self.start_time).strftime(
            "%d %b %Y, %H:%M"
        )


class Booking(models.Model):
    slot = models.OneToOneField(
        SessionSlot,
        on_delete=models.PROTECT,
        related_name="booking"
    )
    name = models.CharField(max_length=100)
    email = models.EmailField()
    booked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.slot}"

