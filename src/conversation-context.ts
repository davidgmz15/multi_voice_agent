interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentName?: string;
}

export class ConversationContext {
  private messages: ConversationMessage[] = [];
  private currentAgent: string;
  private maxMessages: number = 20; // Keep last 20 messages for context

  constructor(initialAgent: string) {
    this.currentAgent = initialAgent;
  }

  addMessage(role: 'user' | 'assistant', content: string, agentName?: string) {
    const message: ConversationMessage = {
      role,
      content,
      timestamp: new Date(),
      agentName: agentName || this.currentAgent
    };

    this.messages.push(message);

    // Keep only the last N messages to prevent context from growing too large
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  getCurrentAgent(): string {
    return this.currentAgent;
  }

  setCurrentAgent(agentName: string) {
    this.currentAgent = agentName;
  }

  getContextForAgent(newAgentName: string): string {
    if (this.messages.length === 0) {
      return '';
    }

    // Get recent conversation history
    const recentMessages = this.messages.slice(-15); // Last 15 messages for better context
    
    // Create a context summary for the new agent
    const contextMessages = recentMessages
      .map(msg => {
        const speaker = msg.role === 'user' ? 'User' : (msg.agentName || 'Previous Agent');
        return `${speaker}: ${msg.content}`;
      })
      .join('\n');

    // Get the previous agent name for smoother transition
    const lastAssistantMessage = recentMessages
      .filter(msg => msg.role === 'assistant' && msg.agentName)
      .pop();
    
    const previousAgent = lastAssistantMessage?.agentName || 'the previous agent';

    return `\n\nPrevious conversation context (you are taking over from ${previousAgent}):\n${contextMessages}\n\nContinue the conversation naturally, acknowledging what has been discussed.`;
  }

  getRecentMessages(count: number = 5): ConversationMessage[] {
    return this.messages.slice(-count);
  }

  clear() {
    this.messages = [];
  }

  getMessageCount(): number {
    return this.messages.length;
  }

  // Debug method to see current context state
  debugContext(): void {
    console.log(`\n=== Context Debug ===`);
    console.log(`Current Agent: ${this.currentAgent}`);
    console.log(`Total Messages: ${this.messages.length}`);
    console.log(`Recent Messages:`);
    this.messages.slice(-5).forEach((msg, index) => {
      console.log(`  ${index + 1}. ${msg.role} (${msg.agentName || 'unknown'}): ${msg.content.substring(0, 50)}...`);
    });
    console.log(`==================\n`);
  }
} 