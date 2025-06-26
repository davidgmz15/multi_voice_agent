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

    // Create a context summary for the new agent
    const contextMessages = this.messages
      .slice(-10) // Last 10 messages for context
      .map(msg => {
        const speaker = msg.role === 'user' ? 'User' : (msg.agentName || 'Assistant');
        return `${speaker}: ${msg.content}`;
      })
      .join('\n');

    return `\n\nPrevious conversation context:\n${contextMessages}\n\nYou are now taking over the conversation. Acknowledge the context and continue naturally.`;
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
} 