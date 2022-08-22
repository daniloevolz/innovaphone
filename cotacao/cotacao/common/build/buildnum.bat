if not exist build.txt echo 100 > build.txt
set /P NBUILD= < build.txt
set /A NBUILD= NBUILD + 1
echo %NBUILD% > build.txt
set BUILD=13B%NBUILD%
set DEVELOPER=
if exist ..\..\developer.txt set /P DEVELOPER= < ..\..\developer.txt
set RELEASESTATE=dvl%DEVELOPER%
make -j 5 -f %1 %2 %3 %4 %5
