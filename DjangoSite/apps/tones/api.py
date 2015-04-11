import logging

from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from .models import ChineseMetadata, ChineseWord
from .serializers import ChineseWordsSerializer


LOG = logging.getLogger(__name__)


class RecordWords(GenericAPIView):
  serializer_class = ChineseWordsSerializer

  def post(self, request, format=None):
    metadata = ChineseMetadata(**{
      'native': request.POST.get('native') == 'true',
      'gender': request.POST.get('gender')
    })
    metadata.save()

    for word in request.FILES:
      # import ipdb
      # ipdb.set_trace()
      _word = ChineseWord(word=word, wave=request.FILES.get(word).read(), metadata=metadata)
      _word.save()

    return Response(status=204)
record_words = RecordWords.as_view()
