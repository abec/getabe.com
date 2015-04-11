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

DEBUG = False
TEMPLATE_DEBUG = DEBUG

ALLOWED_HOSTS = ['*']

DATABASES = {
  'default': {
    'ENGINE': 'django.db.backends.sqlite3',
    'NAME': '/var/lib/getabe.com/db.sqlite3'
  }
}

CACHES = {
  'default': {
    'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
    'LOCATION': '/tmp/cache/website'
  }
}

MEDIA_ROOT = BASE_DIR + '/media'

MEDIA_URL = '/media/'

LANGUAGE_CODE = 'en-us'

LANGUAGES = (
  ('en-us', 'English'),
)

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATIC_URL = "/static/"

STATIC_ROOT = "/var/lib/getabe.com/static"

STATICFILES_DIRS = (
  os.path.join(BASE_DIR, 'static/src'),
)

STATICFILES_FINDERS = (
  'django.contrib.staticfiles.finders.FileSystemFinder',
  'django.contrib.staticfiles.finders.AppDirectoriesFinder'
)

LOCALE_PATHS = (
  "/var/lib/getabe.com/locales",
)

SECRET_KEY = 'ho8=*+^l$ewimncv=hhxry2yzhk(@uakm@_&amp;&amp;d-^)*b_hq#k94'

TEMPLATE_LOADERS = (
  'django.template.loaders.filesystem.Loader',
  'django.template.loaders.app_directories.Loader'
)

MIDDLEWARE_CLASSES = (
  'django.contrib.sessions.middleware.SessionMiddleware',
  'django.middleware.common.CommonMiddleware',
  'django.middleware.locale.LocaleMiddleware',
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
    },
    'file': {
      'level': 'DEBUG',
      'class': 'logging.handlers.RotatingFileHandler',
      'filename': '/var/log/getabe.com/service.log',
      'maxBytes': 1024*1024*10,
      'backupCount': 5,
      'formatter': 'standard'
    }
  },
  'loggers': {
    '': {
      'handlers': ['file'],
      'propagate': True,
      'level': 'DEBUG'
    },
    'django': {
      'handlers': ['file'],
      'propagate': True,
      'level': 'DEBUG'
    },
    'django.request': {
      'handlers': ['file'],
      'propagate': True,
      'level': 'DEBUG'
    },
    'django.db.backends': {
      'handlers': ['file'],
      'propagate': True,
      'level': 'DEBUG'
    },
    'django.security.*': {
      'handlers': ['file'],
      'propagate': True,
      'level': 'DEBUG'
    }
  }
}

ANONYMOUS_USER_ID = -1
