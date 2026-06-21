import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import fs from "fs";
import path from "path";
import { startReminderLoop } from "./reminder";
import { getSupabase } from "./db";

// 1. Load .env.local variables
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      
      const parts = trimmed.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let val = parts.slice(1).join("=").trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
    console.log("✅ Variáveis de ambiente de .env.local carregadas com sucesso.");
  } else {
    console.warn("⚠️ Arquivo .env.local não encontrado no diretório atual.");
  }
}

loadEnv();

// PID file management for background process control (written to node_modules to avoid tsx --watch infinite loops)
const pidPath = fs.existsSync(path.resolve(process.cwd(), "node_modules"))
  ? path.resolve(process.cwd(), "node_modules", "bot-whatsapp.pid")
  : path.resolve(process.cwd(), "bot-whatsapp.pid");

try {
  fs.writeFileSync(pidPath, process.pid.toString(), "utf8");
  console.log(`📌 PID do Bot (${process.pid}) gravado em ${pidPath}`);
} catch (err: any) {
  console.warn("⚠️ Não foi possível escrever o arquivo bot.pid:", err.message);
}

function cleanupPid() {
  if (fs.existsSync(pidPath)) {
    try {
      fs.unlinkSync(pidPath);
      console.log("🧹 Arquivo bot.pid removido.");
    } catch (err) {}
  }
}

process.on("exit", cleanupPid);
process.on("SIGINT", () => {
  cleanupPid();
  process.exit(0);
});
process.on("SIGTERM", () => {
  cleanupPid();
  process.exit(0);
});

// 2. Locate Chrome/Edge executable
function getChromeExecutablePath(): string | undefined {
  if (process.platform === "win32") {
    const possiblePaths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        console.log(`🔍 Navegador Chromium encontrado em: ${p}`);
        return p;
      }
    }
  } else {
    const possiblePaths = [
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/usr/bin/brave-browser",
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        console.log(`🔍 Navegador Chromium encontrado em: ${p}`);
        return p;
      }
    }
  }
  return undefined;
}

const executablePath = getChromeExecutablePath();

// Helper to update connection status
async function updateBotStatus(status: string, qrCode: string | null = null) {
  try {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from("whatsapp_config")
      .upsert({
        id: 1,
        status,
        qr_code: qrCode,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });

    if (error) {
      console.warn(`⚠️ [WhatsApp Bot] Não foi possível salvar status '${status}' no Supabase:`, error.message);
    } else {
      console.log(`🤖 [WhatsApp Bot] Status sincronizado no Supabase: ${status}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [WhatsApp Bot] Erro ao sincronizar status no Supabase:`, err.message || err);
  }
}

// 3. Initialize WhatsApp Client
console.log("⚡ Inicializando o cliente WhatsApp...");
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.resolve(process.cwd(), ".wwebjs_auth"),
  }),
  puppeteer: {
    executablePath: executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  },
});

// 4. Register Event Listeners
client.on("qr", (qr) => {
  console.log("\n=============================================================");
  console.log("📲 ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP:");
  console.log("=============================================================\n");
  qrcode.generate(qr, { small: true });
  console.log("\n=============================================================\n");
  updateBotStatus("qr_ready", qr);
});

client.on("authenticated", () => {
  console.log("✅ Conectado com sucesso ao WhatsApp!");
  updateBotStatus("connected");
});

client.on("auth_failure", (msg) => {
  console.error("❌ Falha na autenticação do WhatsApp:", msg);
  updateBotStatus("disconnected");
});

client.on("ready", () => {
  console.log("🚀 Robô do WhatsApp está pronto e aguardando mensagens!");
  updateBotStatus("connected");
  startReminderLoop(client);
  startChatSyncLoop(client);
});

client.on("disconnected", (reason) => {
  console.log(`⚠️ WhatsApp desconectado: ${reason}`);
  updateBotStatus("disconnected");
});

// 5. Incoming message handler (inbound chat)
client.on("message", async (msg) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const contactName = chat.name || contact.pushname || contact.name || "Cliente WhatsApp";
    
    // Insert incoming message
    const { error } = await supabase
      .from("whatsapp_messages")
      .insert({
        chat_jid: msg.from,
        contact_name: contactName,
        body: msg.body,
        from_me: false,
        status: "received",
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.warn("⚠️ [Chat Inbox] Erro ao salvar mensagem no Supabase:", error.message);
    } else {
      console.log(`📥 [Chat Inbox] Mensagem de ${contactName} recebida e salva.`);
    }
  } catch (err: any) {
    console.warn("⚠️ [Chat Inbox] Falha ao processar mensagem recebida:", err.message || err);
  }
});

// 6. Outgoing message mirroring (sent from mobile)
client.on("message_create", async (msg) => {
  if (msg.fromMe) {
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      // Prevent duplicating messages sent by dashboard client
      const fifteenSecondsAgo = new Date(Date.now() - 15000).toISOString();
      const { data: duplicate } = await supabase
        .from("whatsapp_messages")
        .select("id")
        .eq("chat_jid", msg.to)
        .eq("body", msg.body)
        .eq("from_me", true)
        .gte("created_at", fifteenSecondsAgo)
        .maybeSingle();

      if (duplicate) {
        return; // Already logged, exit!
      }

      const chat = await msg.getChat();
      await supabase
        .from("whatsapp_messages")
        .insert({
          chat_jid: msg.to,
          contact_name: chat.name || "Cliente WhatsApp",
          body: msg.body,
          from_me: true,
          status: "sent",
          created_at: new Date().toISOString()
        });
      console.log(`📤 [Chat Sync] Resposta pelo celular sincronizada para ${msg.to}.`);
    } catch (err: any) {
      // Fail silently
    }
  }
});

// 7. Outbox synchronization (dashboard sending queue)
function startChatSyncLoop(client: Client) {
  console.log("⏳ [Chat Outbox] Loop de envio de mensagens ativado (checagem a cada 2.5 segundos).");
  
  setInterval(async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) return;
      
      const { data: pendingMsgs, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("from_me", true)
        .eq("status", "pending")
        .order("created_at", { ascending: true });
        
      if (error) return;
      
      if (pendingMsgs && pendingMsgs.length > 0) {
        console.log(`💬 [Chat Outbox] Encontrada(s) ${pendingMsgs.length} mensagem(ns) pendente(s) para enviar.`);
        for (const msg of pendingMsgs) {
          try {
            await client.sendMessage(msg.chat_jid, msg.body);
            await supabase
              .from("whatsapp_messages")
              .update({ status: "sent" })
              .eq("id", msg.id);
            console.log(`✅ [Chat Outbox] Mensagem id ${msg.id} enviada.`);
          } catch (sendErr: any) {
            console.error(`❌ [Chat Outbox] Falha ao enviar mensagem ${msg.id}:`, sendErr.message || sendErr);
            await supabase
              .from("whatsapp_messages")
              .update({ status: "failed" })
              .eq("id", msg.id);
          }
        }
      }
    } catch (err) {
      // Loop safety
    }
  }, 2500);
}

// 8. Disconnect listener (allows logout from panel)
function startDisconnectListener(client: Client) {
  setInterval(async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data, error } = await supabase
        .from("whatsapp_config")
        .select("status")
        .eq("id", 1)
        .maybeSingle();

      if (error) return;

      if (data && data.status === "disconnect_requested") {
        console.log("🔌 [WhatsApp Bot] Solicitação de desconexão recebida. Efetuando logout...");
        try {
          await client.logout();
        } catch (logoutErr) {
          console.warn("⚠️ Falha ao deslogar limpo, limpando diretório da sessão...");
          const authPath = path.resolve(process.cwd(), ".wwebjs_auth");
          if (fs.existsSync(authPath)) {
            fs.rmSync(authPath, { recursive: true, force: true });
          }
        }
        await updateBotStatus("disconnected");
        console.log("👋 Processo do bot encerrado após solicitação de desconexão.");
        process.exit(0);
      }
    } catch (err) {
      // safe check
    }
  }, 3000);
}

// Start Client Process
updateBotStatus("connecting");
startDisconnectListener(client);
client.initialize().catch((err) => {
  console.error("❌ Erro ao inicializar o cliente:", err);
  updateBotStatus("disconnected");
});
