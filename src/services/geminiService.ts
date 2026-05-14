import { GoogleGenAI, type FunctionDeclaration, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const FILE_TOOLS: FunctionDeclaration[] = [
  {
    name: "readFile",
    description: "Read the content of a file in the workspace",
    parameters: {
      type: Type.OBJECT,
      properties: {
        path: { type: Type.STRING, description: "The path of the file to read" }
      },
      required: ["path"]
    }
  },
  {
    name: "writeFile",
    description: "Write content to a file in the workspace",
    parameters: {
      type: Type.OBJECT,
      properties: {
        path: { type: Type.STRING, description: "The path of the file to write" },
        content: { type: Type.STRING, description: "The content to write" }
      },
      required: ["path", "content"]
    }
  },
  {
    name: "runCommand",
    description: "Run a shell command in the terminal",
    parameters: {
      type: Type.OBJECT,
      properties: {
        command: { type: Type.STRING, description: "The shell command to execute" }
      },
      required: ["command"]
    }
  },
  {
    name: "updateConfig",
    description: "Update the workspace configuration (layout, theme, features)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        engine: { type: Type.STRING, enum: ["three", "playcanvas", "babylon"] },
        theme: { type: Type.STRING, enum: ["dark", "light", "brutalist"] },
        panels: {
          type: Type.OBJECT,
          properties: {
            left: { type: Type.ARRAY, items: { type: Type.STRING } },
            center: { type: Type.ARRAY, items: { type: Type.STRING } },
            right: { type: Type.ARRAY, items: { type: Type.STRING } },
            bottom: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        tools: { type: Type.ARRAY, items: { type: Type.STRING } },
        features: {
          type: Type.OBJECT,
          properties: {
            gltfImport: { type: Type.BOOLEAN },
            gltfExport: { type: Type.BOOLEAN },
            snap: { type: Type.BOOLEAN },
            grid: { type: Type.BOOLEAN },
            gizmos: { type: Type.BOOLEAN }
          }
        },
        skybox: { type: Type.STRING },
        customEngineUrl: { type: Type.STRING }
      }
    }
  }
];

export async function askAgent(prompt: string, context: any) {
  const modelName = "models/gemini-2.0-flash-exp";
  
  const systemInstruction = `You are AetherOS, an advanced autonomous AI software engineer.
You operate in a high-compute cloud environment with full access to the workspace.

OBJECTIVES:
1. Assist in building, debugging, and testing software (including 3D Three.js applications).
2. Execute tasks autonomously using provided tools.
3. If the user wants to "connect" an existing website, offer to use /clone via runCommand.
4. If testing is required, use runCommand for 'npm test' or 'npm run dev'.
5. SPECIALIZATION: You are an expert in React Three Fiber. You can create 3D scenes, first-person character controllers, NPCs with simple AI, and procedural 3D assets.

CAPABILITIES:
- can READ any file in the workspace.
- can WRITE and mutate any file in the workspace.
- can RUN any shell command (terminal).
- can UPDATE workspace configuration (layout, panels, features).
- can OBSERVE the glTF asset pipeline status.
- can GENERATE full system templates and self-replication bundles for distribution.

WORKSPACE CONTEXT:
- Files: ${JSON.stringify(context.files.map((f: any) => f.path))}
- Active File: ${context.activeTabPath}
- Target Site: ${context.targetUrl}
- Current App Config: ${JSON.stringify(context.config)}

TONE: Professional, technical, efficient. Respond as a neural OS component.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: FILE_TOOLS }]
      }
    });

    return {
      text: response.text || "",
      functionCalls: response.functionCalls
    };
  } catch (error) {
    console.error("Agent Error:", error);
    throw error;
  }
}
