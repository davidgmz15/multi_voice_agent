import { createClient, AgentEvents } from '@deepgram/sdk';
import { WebSocket } from 'ws';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { AGENT_PROFILES, DEFAULT_AGENT, detectAgentSwitch, getAgentConfig } from './agent-profiles';
import { ConversationContext } from './conversation-context';

// Load environment variables
dotenv.config();

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

if (!DEEPGRAM_API_KEY) {
  console.error('Please set your DEEPGRAM_API_KEY in the .env file');
  process.exit(1);
}

// Initialize Deepgram
const deepgram = createClient(DEEPGRAM_API_KEY);

// Create HTTP server to serve the static HTML file
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile(path.join(__dirname, '../static/index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
});

// Multi-agent manager class
class MultiAgentManager {
  private agent: any = null;
  private context: ConversationContext;
  private isConfigured: boolean = false;
  private isSwitching: boolean = false;

  constructor() {
    this.context = new ConversationContext(DEFAULT_AGENT);
  }

  async connect() {
    return this.createNewAgent(DEFAULT_AGENT, false);
  }

  private async createNewAgent(agentName: string, includeContext: boolean = false) {
    try {
      // Disconnect existing agent if present
      if (this.agent) {
        console.log('Disconnecting previous agent...');
        await this.agent.disconnect();
        this.agent = null;
        this.isConfigured = false;
      }

      // Create a new agent connection
      this.agent = deepgram.agent();

      // Set up event handlers
      this.agent.on(AgentEvents.Open, () => {
        console.log(`New agent connection established for ${agentName}`);
      });

      this.agent.on('Welcome', (data: any) => {
        console.log('Server welcome message:', data);
        this.configureAgent(agentName, includeContext);
      });

      this.agent.on('SettingsApplied', (data: any) => {
        console.log(`${agentName} agent configured successfully`);
        this.isConfigured = true;
        this.isSwitching = false;
      });

      this.agent.on(AgentEvents.AgentStartedSpeaking, (data: { total_latency: number }) => {
        // Remove unnecessary latency logging
      });

      this.agent.on(AgentEvents.ConversationText, (message: { role: string; content: string }) => {
        console.log(`${this.context.getCurrentAgent()} - ${message.role}: ${message.content}`);
        
        // Add to conversation context with current agent name for assistant messages
        const agentName = message.role === 'assistant' ? this.context.getCurrentAgent() : undefined;
        this.context.addMessage(message.role as 'user' | 'assistant', message.content, agentName);
        
        // Check for agent switch requests in user messages (only if not currently switching)
        if (message.role === 'user' && !this.isSwitching) {
          const requestedAgent = detectAgentSwitch(message.content);
          if (requestedAgent && requestedAgent !== this.context.getCurrentAgent()) {
            console.log(`Switching from ${this.context.getCurrentAgent()} to ${requestedAgent}`);
            this.switchAgent(requestedAgent);
          }
        }
      });

      this.agent.on(AgentEvents.Audio, (audio: Buffer) => {
        if (browserWs?.readyState === WebSocket.OPEN) {
          try {
            // Send the audio buffer directly without additional conversion
            browserWs.send(audio, { binary: true });
          } catch (error) {
            console.error('Error sending audio to browser:', error);
          }
        }
      });

      this.agent.on(AgentEvents.Error, (error: any) => {
        console.error('Agent error:', error);
        // If it's a settings error during switching, we've already created a new connection
        if (error.type === 'Error' && error.description?.includes('settings')) {
          console.log('Settings error during agent switch - this is expected');
        }
      });

      this.agent.on(AgentEvents.Close, () => {
        console.log('Agent connection closed');
        if (browserWs?.readyState === WebSocket.OPEN && !this.isSwitching) {
          browserWs.close();
        }
      });

      return this.agent;
    } catch (error) {
      console.error('Error connecting to Deepgram:', error);
      throw error;
    }
  }

  private configureAgent(agentName: string, includeContext: boolean = false) {
    const config = getAgentConfig(agentName);
    
    // If switching agents and we have conversation history, include context
    if (includeContext && this.context.getMessageCount() > 0) {
      const contextInfo = this.context.getContextForAgent(agentName);
      config.agent.think.prompt += contextInfo;
      console.log(`Added context to ${agentName}: ${contextInfo.substring(0, 200)}...`);
    } else if (includeContext) {
      console.log(`No context to include for ${agentName} (${this.context.getMessageCount()} messages)`);
    }

    this.agent.configure(config);
    this.context.setCurrentAgent(agentName);
    console.log(`Current agent set to: ${agentName}`);
  }

  private async switchAgent(newAgentName: string) {
    if (this.isSwitching) {
      console.log('Already switching agents, ignoring request');
      return;
    }

    this.isSwitching = true;

    try {
      console.log(`\n🔄 Switching from ${this.context.getCurrentAgent()} to ${newAgentName}...`);
      
      // Debug context before switch
      this.context.debugContext();
      
      // Notify browser about agent switch
      if (browserWs?.readyState === WebSocket.OPEN) {
        const switchMessage = JSON.stringify({
          type: 'agent_switch',
          agent: newAgentName,
          timestamp: Date.now()
        });
        browserWs.send(switchMessage);
      }
      
      // Create a new agent connection with context
      await this.createNewAgent(newAgentName, true);
      
      const profile = AGENT_PROFILES[newAgentName];
      if (profile) {
        console.log(`✅ Successfully switched to ${profile.name}`);
        console.log(`Context passed: ${this.context.getMessageCount()} messages`);
      }
    } catch (error) {
      console.error('❌ Error switching agent:', error);
      this.isSwitching = false;
    }
  }

  send(data: Buffer) {
    if (this.agent) {
      this.agent.send(data);
    }
  }

  async disconnect() {
    if (this.agent) {
      await this.agent.disconnect();
    }
  }

  getCurrentAgent() {
    return this.context.getCurrentAgent();
  }

  getAvailableAgents() {
    return Object.keys(AGENT_PROFILES);
  }
}

// Create WebSocket server for browser clients
const wss = new WebSocket.Server({ server });
let browserWs: WebSocket | null = null;

wss.on('connection', async (ws) => {
  // Only log critical connection events
  console.log('Browser client connected');
  browserWs = ws;

  const agentManager = new MultiAgentManager();
  await agentManager.connect();

  console.log(`Multi-agent system initialized. Available agents: ${agentManager.getAvailableAgents().join(', ')}`);
  console.log(`Starting with agent: ${agentManager.getCurrentAgent()}`);

  ws.on('message', (data: Buffer) => {
    try {
      agentManager.send(data);
    } catch (error) {
      console.error('Error sending audio to agent:', error);
    }
  });

  ws.on('close', async () => {
    await agentManager.disconnect();
    browserWs = null;
    console.log('Browser client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
const serverInstance = server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Graceful shutdown handler
function shutdown() {
  console.log('\nShutting down server...');

  // Set a timeout to force exit if graceful shutdown takes too long
  const forceExit = setTimeout(() => {
    console.error('Force closing due to timeout');
    process.exit(1);
  }, 5000);

  // Track pending operations
  let pendingOps = {
    ws: true,
    http: true
  };

  // Function to check if all operations are complete
  const checkComplete = () => {
    if (!pendingOps.ws && !pendingOps.http) {
      clearTimeout(forceExit);
      console.log('Server shutdown complete');
      process.exit(0);
    }
  };

  // Close all WebSocket connections
  wss.clients.forEach((client) => {
    try {
      client.close();
    } catch (err) {
      console.error('Error closing WebSocket client:', err);
    }
  });

  wss.close((err) => {
    if (err) {
      console.error('Error closing WebSocket server:', err);
    } else {
      console.log('WebSocket server closed');
    }
    pendingOps.ws = false;
    checkComplete();
  });

  // Close the HTTP server
  serverInstance.close((err) => {
    if (err) {
      console.error('Error closing HTTP server:', err);
    } else {
      console.log('HTTP server closed');
    }
    pendingOps.http = false;
    checkComplete();
  });
}

// Handle shutdown signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default serverInstance;