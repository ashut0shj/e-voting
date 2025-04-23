#!/bin/bash

if command -v gnome-terminal &> /dev/null; then
    TERMINAL="gnome-terminal -- bash -c"
elif command -v konsole &> /dev/null; then
    TERMINAL="konsole -e bash -c"
elif command -v xfce4-terminal &> /dev/null; then
    TERMINAL="xfce4-terminal --command bash -c"
elif command -v xterm &> /dev/null; then
    TERMINAL="xterm -e bash -c"
elif command -v kitty &> /dev/null; then
    TERMINAL="kitty bash -c"
elif command -v terminator &> /dev/null; then
    TERMINAL="terminator -e bash -c"
else
    echo "No supported terminal found. Please install gnome-terminal, konsole, xfce4-terminal, xterm, kitty, or terminator."
    exit 1
fi

$TERMINAL "cd backend && npx hardhat node; exec bash" &
sleep 3

$TERMINAL "cd backend && npx hardhat run scripts/deploy.js --network localhost; exec bash" &
sleep 5

$TERMINAL "cd backend && npm run dev; exec bash" &
sleep 2

$TERMINAL "cd frontend && npm start; exec bash" &

echo "Project is now running!"