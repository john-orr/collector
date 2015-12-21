@echo off
py C:/elitech-datareader-0.9.1/build/scripts-2.7/elitech-device.py --command simple-set --interval=10 COM11
ECHO Location: %1
ECHO Hold play button on thermometer for 5 seconds. Press any key to continue.
PAUSE > NIL
START cmd.exe @cmd /k "node index.js %1"
:LOOP
py elitech-device.py --command get COM11 > Output.txt
timeout 10 > NUL
goto :LOOP