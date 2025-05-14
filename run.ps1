Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npx hardhat node"
Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npx hardhat run scripts/deploy.js --network localhost"
Start-Sleep -Seconds 5

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host "Project is now running!"