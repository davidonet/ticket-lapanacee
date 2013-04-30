#!/bin/sh

../node_modules/phantomjs/bin/phantomjs print.js $1
convert /tmp/ticket.png -black-threshold 0% /tmp/ticket_th.png
lpr -P CUSTOM-Engineering-VK80 /tmp/ticket_th.png 
