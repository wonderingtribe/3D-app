import express from 'express';
import { createServer as createHttpServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  app.use(express.json()); // Add JSON parsing middleware
  const httpServer = createHttpServer(app);

  // Architect AI Endpoint
  app.post('/api/architect/generate', async (req, res) => {
    try {
      const { prompt, currentEntities } = req.body;
      
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are the AetherOS Spatial Architect. 
        Current scene entities: ${JSON.stringify(currentEntities)}
        User request: ${prompt}
        
        Generate NEW entities to add to the scene based on this prompt. 
        Entities can be 'mesh' or 'light'.
        Mesh properties include: color, scale.
        Light properties include: color, intensity.
        
        Return ONLY a JSON array of NEW entities.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING, description: "mesh or light" },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                z: { type: Type.NUMBER },
                scale: { type: Type.NUMBER },
                properties: {
                  type: Type.OBJECT,
                  properties: {
                    color: { type: Type.STRING },
                    intensity: { type: Type.NUMBER },
                    emissive: { type: Type.BOOLEAN }
                  }
                }
              },
              required: ["name", "type", "x", "y", "z"]
            }
          }
        }
      });

      res.json(JSON.parse(response.text || '[]'));
    } catch (error: any) {
      console.error('Architect Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  // General Assistant Endpoint
  app.post('/api/assistant/chat', async (req, res) => {
    try {
      const { message, history, context } = req.body;
      
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const model = ai.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const systemPrompt = `You are the Spatial OS Intelligence Assistant.
      You have access to the current workspace state:
      - Pods: ${JSON.stringify(context.pods)}
      - Scenes: ${JSON.stringify(context.scenes)}
      - View Mode: ${context.viewMode}
      
      You can answer questions about the infrastructure or scenes.
      If the user wants to perform an action (like rebooting a pod or creating a scene), suggest the specific command.
      Be concise, technical, and helpful. Use markdown for formatting.`;

      const chat = model.startChat({
        history: history.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      const result = await chat.sendMessage([
        { text: systemPrompt },
        { text: message }
      ]);
      const responseText = result.response.text();

      res.json({ content: responseText });
    } catch (error: any) {
      console.error('Assistant Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('sync-spatial', (data) => {
      socket.broadcast.emit('spatial-update', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
