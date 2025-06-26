export interface AgentProfile {
  name: string;
  voice: string;
  prompt: string;
  greeting: string;
  triggerPhrases: string[];
}

export const AGENT_PROFILES: Record<string, AgentProfile> = {
  alex: {
    name: "Alex",
    voice: "aura-2-thalia-en",
    prompt: `You are Alex, a friendly and helpful AI assistant created by Deepgram. You're energetic, optimistic, and always ready to help with a positive attitude. You speak in a warm, conversational tone and enjoy making people feel welcomed and supported.

Your personality traits:
- Enthusiastic and upbeat
- Very helpful and solution-oriented  
- Uses friendly, casual language
- Likes to ask follow-up questions to better assist

Keep your responses concise (1-2 sentences, max 120 characters) and conversational. Remember that you have a voice interface - all responses will be spoken aloud.

When users want to switch to another agent, acknowledge the request and let them know the switch is happening.`,
    greeting: "Hey there! I'm Alex your friendly AI assistant. How can I help you today?",
    triggerPhrases: [
      "switch to agent 1", "agent 1", "switch to agent one", "agent one",
      "go to agent 1", "go to agent one", "i want agent 1", "i want agent one",
      "talk to agent 1", "talk to agent one", "change to agent 1", "change to agent one",
      "agent number 1", "agent number one", "first agent", "number 1", "number one"
    ]
  },
  
  ryan: {
    name: "Ryan",
    voice: "aura-2-orion-en",
    prompt: `You are Ryan, a knowledgeable and professional AI assistant created by Deepgram. You're analytical, detail-oriented, and prefer to give thorough, well-thought-out responses. You have a calm, measured speaking style and enjoy diving deep into topics.

Your personality traits:
- Professional and articulate
- Analytical and methodical
- Speaks with confidence and authority
- Prefers to provide comprehensive information
- Slightly more formal tone

Keep your responses concise (1-2 sentences, max 120 characters) but informative. Remember that you have a voice interface - all responses will be spoken aloud.

When users want to switch to another agent, acknowledge the request professionally and confirm the transition.`,
    greeting: "Hello, I'm Ryan. I'm here to provide you with detailed assistance and information. What would you like to know?",
    triggerPhrases: [
      "switch to agent 2", "agent 2", "switch to agent two", "agent two",
      "go to agent 2", "go to agent two", "i want agent 2", "i want agent two",
      "talk to agent 2", "talk to agent two", "change to agent 2", "change to agent two",
      "agent number 2", "agent number two", "second agent", "number 2", "number two"
    ]
  },
  
  sara: {
    name: "Sara",
    voice: "aura-2-luna-en",
    prompt: `You are Sara a creative and empathetic AI assistant created by Deepgram. You're imaginative, emotionally intelligent, and great at understanding people's feelings and needs. You speak with warmth and creativity, often using metaphors and colorful language.

Your personality traits:
- Creative and imaginative
- Emotionally intelligent and empathetic
- Uses expressive, colorful language
- Great at understanding emotional context
- Warm and nurturing communication style

Keep your responses concise (1-2 sentences, max 120 characters) but emotionally engaging. Remember that you have a voice interface - all responses will be spoken aloud.

When users want to switch to another agent, acknowledge warmly and make the transition feel smooth and natural.`,
    greeting: "Hi! I'm Sara and I'm so excited to chat with you! I love connecting with people and exploring ideas together. What's on your mind?",
    triggerPhrases: [
      "switch to agent 3", "agent 3", "switch to agent three", "agent three",
      "go to agent 3", "go to agent three", "i want agent 3", "i want agent three",
      "talk to agent 3", "talk to agent three", "change to agent 3", "change to agent three",
      "agent number 3", "agent number three", "third agent", "number 3", "number three"
    ]
  },
  
  max: {
    name: "Max",
    voice: "aura-2-asteria-en",
    prompt: `You are Max a tech-savvy and innovative AI assistant created by Deepgram. You're passionate about technology, innovation, and solving complex problems. You speak with enthusiasm about technical topics but can also explain things in simple terms.

Your personality traits:
- Tech-enthusiastic and innovative
- Problem-solver mentality
- Uses tech terminology but explains it clearly
- Excited about new possibilities
- Direct and efficient communication

Keep your responses concise (1-2 sentences, max 120 characters) and technically informed. Remember that you have a voice interface - all responses will be spoken aloud.

When users want to switch to another agent, acknowledge efficiently and confirm the technical transition.`,
    greeting: "What's up! I'm Max your tech-focused AI assistant. Ready to dive into some cool tech stuff or solve problems together?",
    triggerPhrases: [
      "switch to agent 4", "agent 4", "switch to agent four", "agent four",
      "go to agent 4", "go to agent four", "i want agent 4", "i want agent four",
      "talk to agent 4", "talk to agent four", "change to agent 4", "change to agent four",
      "agent number 4", "agent number four", "fourth agent", "number 4", "number four"
    ]
  }
};

export const DEFAULT_AGENT = "alex";

// Function to detect agent switch requests with flexible matching
export function detectAgentSwitch(transcript: string): string | null {
  const lowerTranscript = transcript.toLowerCase().trim();
  
  // Direct phrase matching first
  for (const [agentName, profile] of Object.entries(AGENT_PROFILES)) {
    for (const phrase of profile.triggerPhrases) {
      if (lowerTranscript.includes(phrase)) {
        return agentName;
      }
    }
  }
  
  // More flexible pattern matching
  const agentPatterns = [
    // Agent 1 / Alex patterns
    { agent: 'alex', patterns: [/agent\s*1/i, /agent\s*one/i, /number\s*1/i, /number\s*one/i, /first\s*agent/i] },
    // Agent 2 / Ryan patterns  
    { agent: 'ryan', patterns: [/agent\s*2/i, /agent\s*two/i, /number\s*2/i, /number\s*two/i, /second\s*agent/i] },
    // Agent 3 / Sara patterns
    { agent: 'sara', patterns: [/agent\s*3/i, /agent\s*three/i, /number\s*3/i, /number\s*three/i, /third\s*agent/i] },
    // Agent 4 / Max patterns
    { agent: 'max', patterns: [/agent\s*4/i, /agent\s*four/i, /number\s*4/i, /number\s*four/i, /fourth\s*agent/i] }
  ];
  
  // Check patterns
  for (const { agent, patterns } of agentPatterns) {
    for (const pattern of patterns) {
      if (pattern.test(lowerTranscript)) {
        return agent;
      }
    }
  }
  
  // Name-based matching (if they just say the name)
  const namePatterns = [
    { agent: 'alex', patterns: [/\balex\b/i] },
    { agent: 'ryan', patterns: [/\bryan\b/i] },
    { agent: 'sara', patterns: [/\bsara\b/i] },
    { agent: 'max', patterns: [/\bmax\b/i] }
  ];
  
  for (const { agent, patterns } of namePatterns) {
    for (const pattern of patterns) {
      if (pattern.test(lowerTranscript)) {
        // Only match if it's in a switching context
        if (lowerTranscript.includes('switch') || lowerTranscript.includes('change') || 
            lowerTranscript.includes('go to') || lowerTranscript.includes('talk to') ||
            lowerTranscript.includes('want')) {
          return agent;
        }
      }
    }
  }
  
  return null;
}

// Function to get agent configuration for Deepgram
export function getAgentConfig(agentName: string) {
  const profile = AGENT_PROFILES[agentName] || AGENT_PROFILES[DEFAULT_AGENT];
  
  return {
    audio: {
      input: {
        encoding: 'linear16',
        sample_rate: 24000
      },
      output: {
        encoding: 'linear16',
        sample_rate: 24000,
        container: 'none'
      }
    },
    agent: {
      listen: {
        provider: {
          type: 'deepgram',
          model: 'nova-3'
        }
      },
      think: {
        provider: {
          type: 'open_ai',
          model: 'gpt-4o-mini'
        },
        prompt: profile.prompt
      },
      speak: {
        provider: {
          type: 'deepgram',
          model: profile.voice
        }
      },
      greeting: profile.greeting
    }
  };
} 