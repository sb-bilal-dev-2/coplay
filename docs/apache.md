
# Apache Configs at nodejs

navigate `/etc/apache2/sites-available/`
edit: `sudo nano /etc/apache2/sites-available/000-default.conf`
stop apache server `sudo systemctl stop apache2`
restart: `sudo systemctl restart apache2`

stop nginx server `sudo systemctl stop nginx`
restart nginx server `sudo systemctl restart nginx`

# PM | Permanent server

Start `pm2 start server.js`
Stop `pm2 stop 0`
Restart `pm2 restart 0`