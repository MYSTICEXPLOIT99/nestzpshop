@echo off
chcp 65001 >nul
title ARX STORE - Local Server
echo ========================================================
echo     ARX STORE - กำลังเริ่มเซิร์ฟเวอร์บนเครื่องของคุณ...
echo ========================================================
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "E:\xampp\htdocs\arxstore"

echo เปิดหน้าเว็บไซต์ในเบราว์เซอร์ที่: http://localhost:3000
start "" "http://localhost:3000"

echo เซิร์ฟเวอร์กำลังทำงาน... (อย่าปิดหน้าต่างนี้หากต้องการใช้งานเว็บ)
"C:\Program Files\nodejs\node.exe" server.js
pause
