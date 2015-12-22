@echo off
SET ELITECH=C:/elitech-datareader-0.9.1/build/scripts-2.7
ECHO COM PORT: %2
python %ELITECH%/elitech-device.py --command simple-set --interval=10 %2
ECHO Location: %1
ECHO Hold play button on thermometer for 5 seconds. Press any key to continue.
PAUSE > NIL
set LAST_NUM=0
:LOOP
python %ELITECH%/elitech-device.py --command get --last_num %LAST_NUM% --location %1 %2 > LAST_NUM
set /p LAST_NUM= < LAST_NUM
timeout 10 > NUL
goto :LOOP