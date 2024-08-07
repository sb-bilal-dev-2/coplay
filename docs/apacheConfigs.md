# Main https config edit
`sudo nano /etc/apache2/sites-available/000-default-le-ssl.conf`

# http config edit

`sudo nano /etc/apache2/sites-available/000-default.conf`

# Get https certificate
@see https://eff-certbot.readthedocs.io/en/latest/using.html#getting-certificates-and-choosing-plugins

### Install certbot
sudo apt update
sudo apt install certbot

### Use python-certbot to get https certificate and autoinstall

certbot certonly -d example.com -d www.example.com
certbot certonly -d app.example.com -d api.example.com

This should ask you to choose plugins e.g. (apache/nginx)

(add --standalone param for not using plugins/autoinstall)