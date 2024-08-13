# Disk spaces of this machine
`df -h`
cosmoingiliz@nodejs-1-vm:~/cplay$ df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            3.9G     0  3.9G   0% /dev
tmpfs           796M  456K  796M   1% /run
/dev/sda1        20G   18G  1.5G  93% /
tmpfs           3.9G     0  3.9G   0% /dev/shm 
tmpfs           5.0M     0  5.0M   0% /run/lock
/dev/sda15      124M   11M  114M   9% /boot/efi
tmpfs           796M     0  796M   0% /run/user/1000


# Disk space usage in current directory
`du -sh -- *`


# Use mydisk as /tmp 

sudo chmod 1777 /mnt/disks/mydisk/tmp
export TMPDIR=/mnt/disks/mydisk/tmp

# Free up cache
`rm -rf ~/.cache/*`
Check cache space: `du -sh ~/.cache`