import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const pidPath = fs.existsSync(path.resolve(process.cwd(), "node_modules"))
  ? path.resolve(process.cwd(), "node_modules", "bot-whatsapp.pid")
  : path.resolve(process.cwd(), "bot-whatsapp.pid");

// Helper to check if a process is running
function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e: any) {
    return e.code !== "ESRCH";
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(pidPath)) {
      return NextResponse.json({ running: false });
    }

    const pidContent = fs.readFileSync(pidPath, "utf8").trim();
    const pid = parseInt(pidContent, 10);

    if (isNaN(pid)) {
      try {
        fs.unlinkSync(pidPath);
      } catch (err) {}
      return NextResponse.json({ running: false });
    }

    if (isProcessRunning(pid)) {
      return NextResponse.json({ running: true, pid });
    } else {
      // Process is not running, clean up orphaned PID file
      try {
        fs.unlinkSync(pidPath);
      } catch (err) {}
      return NextResponse.json({ running: false });
    }
  } catch (err: any) {
    return NextResponse.json({ running: false, error: err.message });
  }
}

export async function POST(req: Request) {
  try {
    const { action } = await req.json();

    if (action === "start") {
      // Detect if running on Vercel / serverless environment
      if (process.env.VERCEL === "1" || process.env.NOW_REGION) {
        return NextResponse.json({
          success: false,
          message: "O robô de WhatsApp não pode ser iniciado a partir do servidor da Vercel, pois a Vercel usa funções Serverless temporárias que não permitem processos em segundo plano ou navegadores Chrome integrados. O robô deve ser executado no seu computador local (ou em uma VPS dedicada) rodando o comando 'npm run bot' no terminal."
        });
      }

      // Check if already running
      if (fs.existsSync(pidPath)) {
        const pid = parseInt(fs.readFileSync(pidPath, "utf8").trim(), 10);
        if (!isNaN(pid) && isProcessRunning(pid)) {
          return NextResponse.json({
            success: false,
            message: `O robô já está rodando sob o PID ${pid}.`,
          });
        }
      }

      console.log("🚀 Spawning WhatsApp Bot process in background...");

      // Spawn process in background (detached)
      const child = spawn("npm", ["run", "bot"], {
        cwd: process.cwd(),
        detached: true,
        stdio: "ignore",
        shell: true,
      });

      // Detach the child process so it survives parent exiting/request completing
      child.unref();

      return NextResponse.json({
        success: true,
        message: "Robô inicializado com sucesso em segundo plano.",
      });
    }

    if (action === "stop") {
      if (!fs.existsSync(pidPath)) {
        return NextResponse.json({
          success: false,
          message: "O robô não está ativo (sem arquivo PID).",
        });
      }

      const pid = parseInt(fs.readFileSync(pidPath, "utf8").trim(), 10);
      if (isNaN(pid)) {
        try {
          fs.unlinkSync(pidPath);
        } catch (err) {}
        return NextResponse.json({
          success: true,
          message: "Arquivo PID inválido removido.",
        });
      }

      if (isProcessRunning(pid)) {
        console.log(`🔌 Parando processo do bot (PID: ${pid})...`);
        try {
          process.kill(pid, "SIGTERM");
          // Give it a tiny bit to shutdown gracefully, otherwise force it
          setTimeout(() => {
            try {
              process.kill(pid, 0);
              process.kill(pid, "SIGKILL");
            } catch (e) {}
          }, 3000);
        } catch (killErr: any) {
          return NextResponse.json({
            success: false,
            message: `Erro ao finalizar processo: ${killErr.message}`,
          });
        }
      }

      try {
        fs.unlinkSync(pidPath);
      } catch (err) {}

      return NextResponse.json({
        success: true,
        message: "Processo do robô interrompido com sucesso.",
      });
    }

    return NextResponse.json({ success: false, message: "Ação desconhecida." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
