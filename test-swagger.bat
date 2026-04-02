#Windows (test-swagger.bat):

@echo off
echo Testing Swagger Documentation...
echo.
echo 1. Testing health endpoint...
curl http://localhost:3000/health
echo.
echo.
echo 2. Testing Swagger UI endpoint...
curl http://localhost:3000/api-docs
echo.
echo.
echo 3. Open Swagger in browser...
start http://localhost:3000/api-docs