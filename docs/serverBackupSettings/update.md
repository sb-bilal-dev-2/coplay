
sudo cp ./docs/serverBackupSettings/000-default-le-ssl.conf /etc/apache2/sites-available/000-default-le-ssl.conf
sudo cp ./docs/serverBackupSettings/000-default.conf /etc/apache2/sites-available/000-default.conf
sudo systemctl restart apache2