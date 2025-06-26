# Quick Setup Guide

## 1. Get Your Deepgram API Key

Visit [console.deepgram.com](https://console.deepgram.com) and:
1. Sign up for a free account
2. Create a new project 
3. Generate an API key
4. Copy the API key

## 2. Set Up the Project

```bash
# Create environment file
cp sample.env .env

# Edit the .env file and add your API key
# Replace "your_deepgram_api_key_here" with your actual API key
```

## 3. Install and Run

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## 4. Test the Demo

1. Open http://localhost:3000 in your browser
2. Allow microphone access
3. Say "Hello!" to start with Alex (Agent 1) 
4. Try switching agents:
   - "Switch to Agent 1" (Alex - friendly)
   - "Switch to Agent 2" (Ryan - professional)
   - "Switch to Agent 3" (Sara - creative)
   - "Switch to Agent 4" (Max - tech-savvy)

## Voice Commands That Work

- "Switch to Agent 1/2/3/4"
- "Agent 1/2/3/4"

Where:
- Agent 1 = Alex (friendly)
- Agent 2 = Ryan (professional) 
- Agent 3 = Sara (creative)
- Agent 4 = Max (tech-savvy)

## Expected Behavior

✅ **What should happen:**
- Each agent has a different voice and personality
- Context is preserved when switching agents
- Agents acknowledge the switch and continue the conversation naturally

✅ **How you'll know it's working:**
- You'll hear different voices for each agent
- Console shows "Switching from [current] to [new]" messages
- Agents reference previous conversation when they take over

## Troubleshooting

❌ **If agents don't switch:**
- Make sure you're using the exact trigger phrases
- Check the browser console for error messages
- Ensure your API key is valid and has credits

❌ **If audio doesn't work:**
- Grant microphone permissions
- Try refreshing the page
- Check if other audio applications are using your microphone

❌ **If the server won't start:**
- Make sure you created the .env file
- Verify your API key is correct
- Run `npm run build` first to check for errors 