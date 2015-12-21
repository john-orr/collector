@echo off
SET ELITECH=C:/elitech-datareader-0.9.1/build/scripts-2.7
py %ELITECH%/elitech-device.py --command simple-set --interval=10 COM11
ECHO Location: %1
ECHO Hold play button on thermometer for 5 seconds. Press any key to continue.
PAUSE > NIL
START cmd.exe @cmd /k "node index.js %1"
:LOOP
py %ELITECH%/elitech-device.py --command get COM11 > %ELITECH%/Output.txt
timeout 10 > NUL
goto :LOOP