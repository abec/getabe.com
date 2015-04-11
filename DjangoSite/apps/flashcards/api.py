import logging

from rest_framework.generics import GenericAPIView, ListCreateAPIView
from rest_framework.response import Response

from .models import FlashCard
from .serializers import FlashCardSerializer


LOG = logging.getLogger(__name__)


class ListAddFlashCards(ListCreateAPIView):
  model = FlashCard
  serializer_class = FlashCardSerializer

  def post(self, request):
    update_card_objs = []

    category = request.POST.get('category')
    cards = request.POST.get('cards')

    if not category:
      return Response(status=400)

    if not cards:
      return Response(status=400)

    for card in cards.split(","):
      card = card.strip()
      if card:
        update_card_objs.append(FlashCard.objects.get_or_create(english=card.strip())[0])

    for card in update_card_objs:
      card.category = category
      card.save()

    return Response(status=204)
list_add_flash_cards = ListAddFlashCards.as_view()


class VoiceAnswer(GenericAPIView):
  model = FlashCard
  lookup_url_kwarg = 'card'

  def post(self, request, card):
    # Remember wave file.
    # Need to delete these periodically.
    with open('/tmp/test.wav', 'wb') as f:
      f.write(request.FILES.get('blob').read())
    # request.FILES.get('blob').seek(0)
    # card.audio_answer(request.FILES.get('blob'))
    return Response(status=200)
voice_answer = VoiceAnswer.as_view()
