@echo off
REM One-time GitHub setup for PropertyFinder-MERN.
REM Run this from inside the mern folder (double-click or run in a terminal).
REM Delete this file after it succeeds.

cd /d "%~dp0"

git init -b main
git config user.name "Ali-Omar"
git config user.email "aliyomar630@gmail.com"

git add .
git commit -m "PropertyFinder migrated from PHP/MySQL to MERN (Express + Mongoose API, React/Vite client, MySQL->MongoDB migration script)"

git remote add origin https://github.com/aliomar139/PropertyFinder-MERN.git
git push -u origin main

echo.
echo Done. Check https://github.com/aliomar139/PropertyFinder-MERN
pause
