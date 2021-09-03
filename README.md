# Binchicken Introduction

Binchook is a GUI Nginx configuration tool that makes deploying new services on the VPS a snap.

The SHL VPS uses Nginx as a reverse proxy which receives traffic on ports 80 and 443 and forwards it to the correct local ports depending on the URL the request was sent to. For example, a request to binchicken.systemhealthlab.com on port 443 is forwarded by Nginx to port 9002, where Binchicken is listening. The headers of the request are transformed and transmitted such that the original request information is maintained.

See <https://docs.systemhealthlab.com/Web%20Apps/nginx_and_binchicken/> for more information.
