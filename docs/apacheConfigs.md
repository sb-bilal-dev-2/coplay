# Main https config edit
`sudo nano /etc/apache2/sites-available/000-default-le-ssl.conf`

# http config edit

`sudo nano /etc/apache2/sites-available/000-default.conf`

# Get https certificate
@see https://eff-certbot.readthedocs.io/en/latest/using.html#getting-certificates-and-choosing-plugins

### Install certbot
sudo apt update
sudo apt install certbot
sudo apt install python3-certbot-apache
sudo certbot --apache

PS: It will ask you to add AAAA DNS record on your provider (e.g. Namecheap). You can add A/A + Dynamic Rocords
![alt text](/docs/namecheap_example.png)