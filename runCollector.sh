#!/bin/sh 
ELITECH=C:/elitech-datareader-0.9.1/build/scripts-2.7
python $ELITECH/elitech-device.py --command simple-set --interval=10 $2
echo "Location: $1"
read -n1 -r -p "Hold play button on thermometer for 5 seconds. Press any key to continue."
node index.js %1
while true
do
    python $ELITECH/elitech-device.py --command get $2 > $ELITECH/Output.txt
    sleep 10
done