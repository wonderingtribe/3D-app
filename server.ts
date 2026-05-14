import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/files", async (req, res) => {
    try {
      const rootDir = process.cwd();
      const files = await getFilesRecursive(rootDir);
      res.json(files);
    } catch (err) {
      res.status(500).json({ error: "Failed to read files" });
    }
  });

  app.get("/api/file-content", async (req, res) => {
    const { filePath } = req.query;
    if (typeof filePath !== "string") return res.status(400).send("Invalid path");
    try {
      const content = await fs.readFile(path.resolve(process.cwd(), filePath), "utf-8");
      res.json({ content });
    } catch (err) {
      res.status(500).json({ error: "Failed to read file" });
    }
  });

  app.post("/api/save-file", async (req, res) => {
    const { filePath, content } = req.body;
    try {
      await fs.writeFile(path.resolve(process.cwd(), filePath), content, "utf-8");
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save file" });
    }
  });

  app.post("/api/generate-editor", async (req, res) => {
    const { config } = req.body;
    try {
      const folderName = `local-workspace`;
      const folderPath = path.join(process.cwd(), "generated-editors", folderName);
      await fs.mkdir(folderPath, { recursive: true });

      // Create a mock index.html for users to overwrite with their build
      await fs.writeFile(
        path.join(folderPath, "index.html"),
        `<html><body style="background:#08080c;color:#06b6d4;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <div>
            <h2>AETHER_LOCAL_WORKSPACE</h2>
            <p>Waiting for 'npm run build' output...</p>
          </div>
        </body></html>`
      );

      res.json({ 
        success: true, 
        folder: folderName,
        message: "Source-to-Viewport pipeline established."
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to generate editor workspace" });
    }
  });

  // Serve the generated editors as static sites
  app.use("/preview", express.static(path.join(process.cwd(), "generated-editors")));

  // Socket.IO for Terminal and Agent Logs
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("terminal-input", async (command) => {
      // Basic terminal execution simulation
      try {
        const { stdout, stderr } = await execAsync(command);
        socket.emit("terminal-output", stdout || stderr);
      } catch (err: any) {
        socket.emit("terminal-output", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`AetherOS Server running on http://localhost:${PORT}`);
  });
}

async function getFilesRecursive(dir: string, base: string = ""): Promise<any[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((e) => !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== "dist")
      .map(async (entry) => {
        const relPath = path.join(base, entry.name);
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          return {
            name: entry.name,
            path: relPath,
            type: "directory",
            children: await getFilesRecursive(fullPath, relPath),
          };
        }
        return {
          name: entry.name,
          path: relPath,
          type: "file",
        };
      })
  );
  return files;
}

startServer();
