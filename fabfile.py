from cuisine import dir_ensure, file_link
from fabric.api import cd, env, run, task
from fabtools import require
import fabtools
import os

LOG_DIR = "/var/log/getabe.com"
LIB_DIR = "/var/lib/getabe.com"
WWW_DIR = "/var/www/getabe.com"
VIRTUAL_ENV = "/var/www/getabe.com/ENV"

@task
def prod():
  env.hosts = ["198.199.104.234"]

@task
def symlinks():
  with fabtools.python.virtualenv(VIRTUAL_ENV):
    with cd(os.path.join(WWW_DIR, "DjangoSite")):
      file_link("settings.prod.py", "settings.py")

@task
def locales():
  with fabtools.python.virtualenv(VIRTUAL_ENV):
    with cd(os.path.join(WWW_DIR, "DjangoSite")):
      run("python manage.py makemessages -l en")
      run("python manage.py makemessages -l en-us")
      run("python manage.py compilemessages")

@task
def static():
  with fabtools.python.virtualenv(VIRTUAL_ENV):
    with cd(os.path.join(WWW_DIR, "DjangoSite")):
      run("python manage.py collectstatic")

@task
def migrate():
  with fabtools.python.virtualenv(VIRTUAL_ENV):
    with cd(os.path.join(WWW_DIR, "DjangoSite")):
      run("python manage.py migrate")

@task
def dirs():
  dir_ensure(LOG_DIR, recursive=True, mode=0755, owner="root", group="root")
  dir_ensure(LIB_DIR, recursive=True, mode=0755, owner="root", group="root")
  dir_ensure(os.path.join(LIB_DIR, "static"), recursive=True, mode=0755, owner="root", group="root")
  dir_ensure(os.path.join(LIB_DIR, "locales"), recursive=True, mode=0755, owner="root", group="root")

@task
def packages():
  with fabtools.python.virtualenv(VIRTUAL_ENV):
    require.python.package("git+git://github.com/abec/django-common#egg=django-common")
    require.python.package("tornado")
    require.python.package("django")
    require.python.package("python-magic")
    require.python.package("djangorestframework")
    require.python.package("goslate")

@task
def django():
  with fabtools.python.virtualenv(VIRTUAL_ENV):
    with cd(os.path.join(WWW_DIR, "DjangoSite")):
      run("python manage.py collectstatic")
      run("python manage.py makemessages -l en")
      run("python manage.py makemessages -l en-us")
      run("python manage.py compilemessages")
      run("python manage.py migrate")

@task
def setup():
  if not fabtools.python.virtualenv_exists(VIRTUAL_ENV):
    fabtools.python.create_virtualenv(VIRTUAL_ENV)
  dirs()
  packages()
  django()
  symlinks()

@task
def start():
  with cd(os.path.join(WWW_DIR, "DjangoSite")):
    fabtools.utils.run_as_root("find . -name '*.pyc' -exec rm {} \;")
  fabtools.service.start("getabe")

@task
def stop():
  fabtools.service.stop("getabe")
