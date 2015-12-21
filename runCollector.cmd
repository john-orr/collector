@echo off
SET ELITECH=C:/elitech-datareader-0.9.1/build/scripts-2.7
ECHO COM PORT: %2
py %ELITECH%/elitech-device.py --command simple-set --interval=10 %2
ECHO Location: %1
ECHO Hold play button on thermometer for 5 seconds. Press any key to continue.
PAUSE > NIL
START cmd.exe @cmd /k "node index.js %1"
:LOOP
py %ELITECH%/elitech-device.py --command get %2 > %ELITECH%/Output.txt
timeout 10 > NUL
goto :LOOP