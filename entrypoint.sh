#!/bin/bash

# TODO: these don't actually boot up when the container is started.
systemctl enable postgrest
systemctl start postgrest

# For reloading the service
# systemctl restart postgrest

systemctl enable leapchat
systemctl start leapchat