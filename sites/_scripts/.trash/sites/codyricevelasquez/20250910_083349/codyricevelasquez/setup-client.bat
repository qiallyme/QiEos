@echo off
REM Client Site Setup Script for Windows
REM Usage: setup-client.bat "Client Name" "client-email@example.com" "555-123-4567" "123 Main St, City, State"

if "%~4"=="" (
    echo Usage: %0 "Client Name" "client-email@example.com" "555-123-4567" "123 Main St, City, State"
    exit /b 1
)

set CLIENT_NAME=%~1
set CLIENT_EMAIL=%~2
set CLIENT_PHONE=%~3
set CLIENT_ADDRESS=%~4

REM Create URL-friendly slug (basic implementation)
set CLIENT_NAME_SLUG=%CLIENT_NAME%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG: =%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:A=a%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:B=b%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:C=c%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:D=d%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:E=e%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:F=f%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:G=g%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:H=h%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:I=i%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:J=j%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:K=k%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:L=l%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:M=m%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:N=n%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:O=o%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:P=p%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:Q=q%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:R=r%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:S=s%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:T=t%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:U=u%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:V=v%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:W=w%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:X=x%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:Y=y%
set CLIENT_NAME_SLUG=%CLIENT_NAME_SLUG:Z=z%

set CLIENT_URL=https://%CLIENT_NAME_SLUG%.com
set CLIENT_DESCRIPTION=Professional services by %CLIENT_NAME%
set CLIENT_KEYWORDS=%CLIENT_NAME%, professional services, business
set CLIENT_ABOUT_TEXT=We are a professional service provider dedicated to delivering exceptional results for our clients. With years of experience and a commitment to excellence, we help businesses achieve their goals.

REM Get current date
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "CURRENT_DATE=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%"

echo Setting up client site for: %CLIENT_NAME%
echo Slug: %CLIENT_NAME_SLUG%
echo URL: %CLIENT_URL%

REM Create backup and replace placeholders in index.html
copy index.html index.html.bak >nul
powershell -Command "(Get-Content index.html) -replace '{{CLIENT_NAME}}', '%CLIENT_NAME%' -replace '{{CLIENT_DESCRIPTION}}', '%CLIENT_DESCRIPTION%' -replace '{{CLIENT_KEYWORDS}}', '%CLIENT_KEYWORDS%' -replace '{{CLIENT_URL}}', '%CLIENT_URL%' -replace '{{CLIENT_ABOUT_TEXT}}', '%CLIENT_ABOUT_TEXT%' -replace '{{CLIENT_EMAIL}}', '%CLIENT_EMAIL%' -replace '{{CLIENT_PHONE}}', '%CLIENT_PHONE%' -replace '{{CLIENT_ADDRESS}}', '%CLIENT_ADDRESS%' | Set-Content index.html"

REM Create backup and replace placeholders in wrangler.toml
copy wrangler.toml wrangler.toml.bak >nul
powershell -Command "(Get-Content wrangler.toml) -replace '{{CLIENT_NAME_SLUG}}', '%CLIENT_NAME_SLUG%' | Set-Content wrangler.toml"

REM Create backup and replace placeholders in sitemap.xml
copy sitemap.xml sitemap.xml.bak >nul
powershell -Command "(Get-Content sitemap.xml) -replace '{{CLIENT_URL}}', '%CLIENT_URL%' -replace '{{CURRENT_DATE}}', '%CURRENT_DATE%' | Set-Content sitemap.xml"

REM Clean up backup files
del *.bak >nul 2>&1

echo.
echo ✅ Client site setup complete!
echo 📁 Files updated: index.html, wrangler.toml, sitemap.xml
echo 🚀 Ready for deployment to Cloudflare Pages
echo.
echo Next steps:
echo 1. Review and customize the content in index.html
echo 2. Add client logo and images
echo 3. Update services section with actual offerings
echo 4. Deploy to Cloudflare Pages
echo.
pause
