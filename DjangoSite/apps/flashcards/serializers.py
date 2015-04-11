from rest_framework import serializers

from .models import FlashCard


__all__ = ['FlashCardSerializer']


class FlashCardSerializer(serializers.ModelSerializer):
  class Meta:
    model = FlashCard
