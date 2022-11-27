rmdir /s .\dist
cmd /c npm run build
xcopy /ey .\dist \\ENAS\Data\n8n\custom
ssh etdofresh@enas /usr/local/bin/docker container restart n8n