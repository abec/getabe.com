"""
Django settings for argg project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

import os
import sys
BASE_DIR = os.path.dirname(__file__)
sys.path.append(os.path.join(BASE_DIR, "apps"))

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ALLOWED_HOSTS = ['*']

DATABASES = {
  'default': {
    'ENGINE': 'django.db.backends.sqlite3',
    'NAME': '/tmp/db.sqlite3'
  }
}

CACHES = {
  'default': {
    # 'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
    'LOCATION': '/tmp/cache/website'
  }
}

MEDIA_ROOT = BASE_DIR + '/media'

MEDIA_URL = '/media/'

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATIC_URL = "/static/"

STATIC_ROOT = os.path.join(BASE_DIR, 'static/prod')

STATICFILES_DIRS = (
  os.path.join(BASE_DIR, 'static/src'),
)

STATICFILES_FINDERS = (
  'django.contrib.staticfiles.finders.FileSystemFinder',
  'django.contrib.staticfiles.finders.AppDirectoriesFinder'
)

SECRET_KEY = 'ho8=*+^l$ewimncv=hhxry2yzhk(@uakm@_&amp;&amp;d-^)*b_hq#k94'

TEMPLATE_LOADERS = (
  'django.template.loaders.filesystem.Loader',
  'django.template.loaders.app_directories.Loader'
)

MIDDLEWARE_CLASSES = (
  'django.contrib.sessions.middleware.SessionMiddleware',
  'django.middleware.common.CommonMiddleware',
  'django.middleware.csrf.CsrfViewMiddleware',
  'django.contrib.messages.middleware.MessageMiddleware',
  'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'urls'

WSGI_APPLICATION = 'wsgi.application'

TEMPLATE_DIRS = (
  BASE_DIR + '/templates',
)

INSTALLED_APPS = (
  'django.contrib.contenttypes',
  'django.contrib.sessions',
  'django.contrib.sites',
  'django.contrib.messages',
  'django.contrib.staticfiles',
  'django_common.contrib.st',
  'django_common',
  'apps.flashcards',
  'apps.tones'
)

LOGGING = {
  'version': 1,
  'disable_existing_loggers': True,
  'filters': {
    'require_debug_false': {
      '()': 'django.utils.log.RequireDebugFalse'
    }
  },
  'formatters': {
    'standard': {
      'format' : "(%(asctime)s) %(levelname)s [%(thread)s:%(name)s:%(lineno)s] %(message)s",
      'datefmt' : "%d/%b/%Y %H:%M:%S"
    },
    'debug': {
      'format' : "(%(asctime)s) %(levelname)s [%(thread)s:%(name)s:%(lineno)s] %(message)s \n%(exc_info)s",
      'datefmt' : "%d/%b/%Y %H:%M:%S"
    }
  },
  'handlers': {
    'null': {
      'level': 'DEBUG',
      'class': 'django.utils.log.NullHandler',
    },
    'console': {
      'level': 'DEBUG',
      'class': 'logging.StreamHandler',
      'formatter': 'standard',
    }
  },
  'loggers': {
    '': {
      'handlers': ['console'],
      'propagate': True,
      'level': 'DEBUG'
    },
    'django': {
      'handlers': ['console'],
      'propagate': True,
      'level': 'DEBUG'
    },
    'django.request': {
      'handlers': ['console'],
      'propagate': True,
      'level': 'DEBUG'
    },
    'django.db.backends': {
      'handlers': ['console'],
      'propagate': True,
      'level': 'DEBUG'
    },
    'django.security.*': {
      'handlers': ['console'],
      'propagate': True,
      'level': 'DEBUG'
    }
  }
}

ANONYMOUS_USER_ID = -1
