
from django.conf import settings
from django.conf.urls import include, patterns, url

from django_common.views.generic.base import TemplateView


home = TemplateView.as_view(template_name='home.html')

urlpatterns = patterns('', url(r'^$', home, name="home"),
                           url(r'^flashcards/', include('apps.flashcards.urls')),
                           url(r'^tones/', include('apps.tones.urls')))


if settings.DEBUG:
  urlpatterns += patterns('django.contrib.staticfiles.views',
                          url(r'^static/(?P<path>.*)$', 'serve'),)
