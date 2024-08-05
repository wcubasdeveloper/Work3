echo "holaPMALT"
C:\Users\autoseguro\AppData\Roaming\npm\
@IF EXIST "C:\Users\Administrator\AppData\Roaming\npm\node.exe" (
  "C:\Users\Administrator\AppData\Roaming\npm\node.exe"  "C:\Users\Administrator\AppData\Roaming\npm\node_modules\pm2\bin\pm2" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "C:\Users\Administrator\AppData\Roaming\npm\node_modules\pm2\bin\pm2" %*
)