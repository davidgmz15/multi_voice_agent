# Multi-Voice Agent Demo with Deepgram

This project demonstrates a multi-voice agent system using Deepgram's Voice Agent API. You can switch between different AI personalities during a conversation while maintaining context and conversation history.

## 🎭 Available Agents

- **Agent 1 - Alex** - Friendly & energetic assistant (default)
  - Voice: `aura-2-thalia-en`
  - Personality: Enthusiastic, upbeat, solution-oriented

- **Agent 2 - Ryan** - Professional & analytical expert  
  - Voice: `aura-2-orion-en`
  - Personality: Professional, methodical, authoritative

- **Agent 3 - Sara** - Creative & empathetic companion
  - Voice: `aura-2-luna-en`
  - Personality: Creative, emotionally intelligent, warm

- **Agent 4 - Max** - Tech-savvy & innovative problem-solver
  - Voice: `aura-2-atlas-en`
  - Personality: Tech-enthusiastic, innovative, direct

## 🚀 Key Features

- **Seamless Agent Switching**: Switch between agents mid-conversation with simple voice commands
- **Context Preservation**: Conversation history is maintained across agent switches
- **Real-time Voice Processing**: Continuous audio streaming with low latency
- **Simple Voice Commands**: Just say "Switch to Agent 1/2/3/4" to change agents
- **Multiple Voice Models**: Each agent has a distinct voice for better differentiation

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- A Deepgram API key (get one at [console.deepgram.com](https://console.deepgram.com))

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp sample.env .env
```

Then edit `.env` and add your Deepgram API key:

```
DEEPGRAM_API_KEY=your_actual_deepgram_api_key_here
```

### 3. Build the Project

```bash
npm run build
```

### 4. Start the Server

```bash
npm start
```

The server will start at `http://localhost:3000`

## 🎯 How to Use

1. **Open your browser** and navigate to `http://localhost:3000`
2. **Allow microphone access** when prompted
3. **Start talking** - you'll begin with Alex (Agent 1) by default
4. **Switch agents** using simple voice commands:
   - "Switch to Agent 1" (Alex - friendly)
   - "Switch to Agent 2" (Ryan - professional)
   - "Switch to Agent 3" (Sara - creative)
   - "Switch to Agent 4" (Max - tech-savvy)

## 🔧 How It Works

### Agent Switching Architecture

The system uses a **single WebSocket connection** to maintain context while switching between agents. Here's how:

1. **Connection Persistence**: The WebSocket connection to Deepgram remains open
2. **Dynamic Reconfiguration**: Agent configuration (prompt, voice model) is updated via `agent.configure()`
3. **Context Injection**: Previous conversation history is included when switching agents
4. **Voice Command Detection**: Real-time transcript analysis detects switch requests

### Context Preservation

- Conversation history is stored in memory
- When switching agents, the last 10 messages are included in the new agent's prompt
- Each agent acknowledges the context and continues naturally
- Message history is limited to prevent token overflow

### Voice Command Recognition

The system listens for these simple trigger phrases:
- "Switch to Agent 1/2/3/4" or "Agent 1/2/3/4" 
- Case-insensitive matching
- Real-time detection during conversation

## 🏗️ Project Structure

```
├── src/
│   ├── index.ts                 # Main server with multi-agent manager
│   ├── agent-profiles.ts        # Agent configurations and personalities
│   └── conversation-context.ts  # Context management and history tracking
├── static/
│   └── index.html              # Frontend with enhanced UI
├── package.json
├── tsconfig.json
└── README.md
```

## 🎨 Technical Implementation

### MultiAgentManager Class

- Manages single Deepgram connection
- Handles agent switching logic
- Preserves conversation context
- Detects voice commands in real-time

### Agent Profiles

Each agent has:
- Unique personality prompt
- Specific voice model
- Custom greeting message
- Trigger phrases for activation

### Context Management

- Tracks all conversation messages
- Provides context to new agents
- Maintains conversation flow
- Prevents memory overflow

## 🧪 Testing Agent Switching

Try these conversation flows:

1. **Basic Switch**:
   - Start: "Hello!" (Alex/Agent 1 responds)
   - Command: "Switch to Agent 2"
   - Result: Ryan takes over with context

2. **Multiple Switches**:
   - Chain switches: Agent 1 → Agent 3 → Agent 4 → Agent 2
   - Context is preserved throughout

3. **Contextual Continuation**:
   - Ask Agent 1 (Alex) about a topic
   - Switch to Agent 2 (Ryan)
   - Ryan continues the same topic with his analytical style

## 🚨 Troubleshooting

### Common Issues

1. **"Please set your DEEPGRAM_API_KEY"**
   - Solution: Ensure `.env` file exists with valid API key

2. **Agent not switching**
   - Solution: Use exact trigger phrases listed above
   - Check browser console for switch detection logs

3. **Audio issues**
   - Solution: Ensure microphone permissions are granted
   - Try refreshing the page

4. **TypeScript errors**
   - Solution: Run `npm run build` to check for compilation issues

## 🔮 Future Enhancements

Potential improvements:
- Visual agent indicators in UI
- Custom voice models per agent
- Agent personality training
- Multi-language support
- Agent memory persistence
- Voice cloning capabilities

## 📚 API References

- [Deepgram Voice Agent API](https://developers.deepgram.com/reference/voice-agent-api/agent)
- [Deepgram SDK Documentation](https://developers.deepgram.com/docs/js-sdk)

## 🤝 Contributing

This is a demo project showcasing multi-agent voice capabilities. Feel free to extend it with additional agents, personalities, or features!

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Deepgram's Voice Agent API**