#!/bin/sh

PIDFILE=/var/run/getabe.pid

. /lib/lsb/init-functions

NAME=getabe.com
RUN_AS=`id -u root`
CMD="/var/www/getabe.com/start.sh"
OPTS=

do_start() {
    if [ ! -s $PIDFILE ];
    then
        $CMD $OPTS > $PIDFILE
    fi
}

do_stop() {
    if [ -e $PIDFILE ];
    then
        killproc -p $PIDFILE
    fi;
}

case "$1" in
start)
    log_success_msg "Starting $NAME"
    do_start
    ;;
stop)
    log_success_msg "Stopping $NAME"
    do_stop
    ;;
restart)
    log_success_msg "Restarting $NAME"
    do_stop
    do_start
    ;;
*)
    log_warning_msg "Usage: /etc/init.d/getabe {start|stop|restart}"
    exit 2
    ;;
esac
exit 0
