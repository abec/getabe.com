from django.conf.urls import url
from django_common.views.generic.base import TemplateView

from .api import record_words


gatherer = TemplateView.as_view(template_name='tones/gather.html')
game = TemplateView.as_view(template_name='tones/game.html')


urlpatterns = [
  url(r'^$', gatherer, name='tones'),
  url(r'^game/?$', game, name='game'),
  url(r'^api/record/?$', record_words, name='record_words')
]
