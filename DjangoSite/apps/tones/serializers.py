from rest_framework import serializers

from .models import ChineseMetadata


__all__ = ['ChineseWordsSerializer']


class ChineseWordsSerializer(serializers.ModelSerializer):
  class Meta:
    model = ChineseMetadata
    depth = 2
    fields = ('native', 'gender', 'words')
