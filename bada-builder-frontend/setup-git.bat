@echo off
REM Git Configuration Setup Script for Windows
REM Run this script to configure Git user identity

echo Configuring Git user identity...

git config --global user.name "Nakul Agrawal"
git config --global user.email "nakul@example.com"

echo Git configuration complete!
echo.
echo Current Git configuration:
git config --global user.name
git config --global user.email

pause
