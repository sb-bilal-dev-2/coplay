
# Apache Configs at nodejs

restart: `sudo systemctl restart apache2`

# Edit Apache

sites `/etc/apache2/sites-available/`
edit: `sudo nano /etc/apache2/sites-available/000-default.conf`
edit https: `sudo nano /etc/apache2/sites-available/000-default-le-ssl.conf`
stop apache server `sudo systemctl stop apache2`

# PM | Permanent server

Start `pm2 start server.js`
Stop `pm2 stop 0`
Restart `pm2 restart 0`

# PM list all running services

`pm2 list`