from django.conf.urls import url
from django_common.views.generic.base import TemplateView

from .api import list_add_flash_cards, voice_answer


flashcards = TemplateView.as_view(template_name='flashcards/flashcards.html')


urlpatterns = [
  url(r'^$', flashcards, name='flashcards'),
  url(r'^api/cards/?$', list_add_flash_cards, name='cards'),
  url(r'^api/cards/(?P<card>[0-9]+)/voice/?$', voice_answer, name='cards')
]
