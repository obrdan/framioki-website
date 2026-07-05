@echo off
set /p commitText=Commit Text eingeben:

git add .
git commit -m "%commitText%"
git push

pause