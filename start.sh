#!/bin/sh

WDIR=/var/www/getabe.com/DjangoSite
VIRTUALENV_DIR=/var/www/getabe.com/ENV

source $VIRTUALENV_DIR/bin/activate

cd $WDIR
python manage.py runtornado 1>/dev/null 2>/dev/null &
if [ $? == 0 ]
then
  echo $!
fi
