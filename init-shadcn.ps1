$responses = @(
    "1",  # Radix
    "1",  # Nova preset
    "2",  # Zinc theme
    "1",  # New York style
    "Y"   # Confirm
)

$process = Start-Process -FilePath "npx" -ArgumentList "shadcn@latest", "init" -NoNewWindow -PassThru -RedirectStandardInput "responses.txt"

foreach ($response in $responses) {
    $response | Out-File -FilePath "responses.txt" -Append -Encoding utf8
    Start-Sleep -Milliseconds 500
}

Get-Content "responses.txt" | & npx shadcn@latest init
