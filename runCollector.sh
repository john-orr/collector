#!/bin/sh 
ELITECH=C:/elitech-datareader-0.9.1/build/scripts-2.7
echo "COM PORT: $2"
python $ELITECH/elitech-device.py --command simple-set --interval=10 $2
echo "Location: $1"
read -n1 -r -p "Hold play button on thermometer for 5 seconds. Press any key to continue."
LAST_NUM=0
while true
do
    LAST_NUM=$(python $ELITECH/elitech-device.py --command get --last_num $LAST_NUM --location $1 $2)	
    sleep 10
done