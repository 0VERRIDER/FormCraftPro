#!/bin/sh
# wait-for-it.sh: Wait for a service to be ready

TIMEOUT=15
QUIET=0

usage() {
  echo "Usage: $0 <host:port> [--timeout=<seconds>] [--quiet]"
  exit 1
}

while [ $# -gt 0 ]
do
  case "$1" in
    *:* )
    HOST=$(printf "%s\n" "$1"| cut -d : -f 1)
    PORT=$(printf "%s\n" "$1"| cut -d : -f 2)
    shift 1
    ;;
    --timeout=*)
    TIMEOUT="${1#*=}"
    shift 1
    ;;
    --quiet)
    QUIET=1
    shift 1
    ;;
    --help)
    usage
    ;;
    *)
    echo "Unknown argument: $1"
    usage
    ;;
  esac
done

if [ "$HOST" = "" ] || [ "$PORT" = "" ]; then
  usage
fi

wait_for() {
  if [ $QUIET -eq 1 ]; then
    nc -z "$HOST" "$PORT" > /dev/null 2>&1
  else
    echo "Waiting for $HOST:$PORT..."
    nc -z "$HOST" "$PORT"
  fi

  RESULT=$?
  return $RESULT
}

wait_for_service() {
  START_TS=$(date +%s)
  while :
  do
    wait_for
    RESULT=$?
    if [ $RESULT -eq 0 ]; then
      END_TS=$(date +%s)
      echo "$HOST:$PORT is available after $((END_TS - START_TS)) seconds"
      return 0
    fi
    
    if [ $TIMEOUT -eq 0 ] || [ $(($(date +%s) - START_TS)) -gt $TIMEOUT ]; then
      echo "Timeout reached. $HOST:$PORT is still not available"
      return 1
    fi
    
    sleep 1
  done
}

wait_for_service
RESULT=$?

exit $RESULT