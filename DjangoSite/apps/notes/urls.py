from django.conf.urls import url
from django_common.views.generic.base import AuthenticatedTemplateView
from .api import record_words


game = AuthenticatedTemplateView.as_view(template_name='notes/notes.html')


urlpatterns = [
  url(r'^$', gatherer, name='gatherer'),
  url(r'^game/?$', game, name='game'),
  url(r'^api/record/?$', record_words, name='record_words')
]
