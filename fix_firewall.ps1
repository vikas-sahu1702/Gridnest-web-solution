$network = Get-NetConnectionProfile
$name = $network.Name
Set-NetConnectionProfile -Name $name -NetworkCategory Private
netsh advfirewall firewall add rule name="Vishal Web Server" dir=in action=allow protocol=TCP localport=5000
Write-Host "Firewall rule added & network set to Private"
Write-Host "Server URL: http://192.168.31.16:5000/templates.html"
Pause
