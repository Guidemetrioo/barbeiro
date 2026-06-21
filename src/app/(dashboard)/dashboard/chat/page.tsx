"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Send, Smartphone, User, MessageSquare, Check, CheckCheck, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface Message {
  id: number;
  chat_jid: string;
  contact_name: string;
  body: string;
  from_me: boolean;
  status: "pending" | "sent" | "failed" | "received";
  created_at: string;
}

interface ChatListItem {
  chat_jid: string;
  contact_name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatList, setChatList] = useState<ChatListItem[]>([]);
  const [selectedJid, setSelectedJid] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [botConnected, setBotConnected] = useState<boolean | null>(null);
  const [dbError, setDbError] = useState(false);
  const [sending, setSending] = useState(false);

  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch system status (check if Bot is connected)
  const checkBotStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_config")
        .select("status")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        if (error.message.includes("does not exist")) {
          setDbError(true);
        }
        return;
      }
      setBotConnected(data?.status === "connected");
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Fetch all messages from Supabase
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        if (error.message.includes("does not exist")) {
          setDbError(true);
        }
        return;
      }

      if (data) {
        setDbError(false);
        setMessages(data);
        
        // Group and build unique chats list dynamically
        const chatMap: Record<string, ChatListItem> = {};
        
        data.forEach((msg: Message) => {
          const formattedTime = new Date(msg.created_at).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
          });
          
          chatMap[msg.chat_jid] = {
            chat_jid: msg.chat_jid,
            contact_name: msg.contact_name || "Cliente WhatsApp",
            lastMessage: msg.body,
            lastMessageTime: formattedTime
          };
        });

        const sortedChats = Object.values(chatMap).reverse(); // latest first
        setChatList(sortedChats);

        // Auto select first chat if nothing is selected and list has items
        if (!selectedJid && sortedChats.length > 0) {
          setSelectedJid(sortedChats[0].chat_jid);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
    }
  };

  useEffect(() => {
    checkBotStatus();
    fetchMessages();

    // Poll for status and messages periodically (keep it real-time)
    const interval = setInterval(() => {
      checkBotStatus();
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedJid]);

  // Scroll to bottom when messages or selected chat changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedJid]);

  // Send message action
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedJid) return;

    setSending(true);
    const activeChat = chatList.find(c => c.chat_jid === selectedJid);
    const contactName = activeChat?.contact_name || "Cliente WhatsApp";
    const bodyToSend = inputText;
    setInputText("");

    try {
      const { error } = await supabase
        .from("whatsapp_messages")
        .insert({
          chat_jid: selectedJid,
          contact_name: contactName,
          body: bodyToSend,
          from_me: true,
          status: "pending",
          created_at: new Date().toISOString()
        });

      if (error) {
        alert("Erro ao enviar mensagem: " + error.message);
      } else {
        // Quick update feed local UI
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "pending":
        return <span className="text-[10px] text-salon-text-secondary">⏳</span>;
      case "sent":
        return <Check className="w-3.5 h-3.5 text-salon-text-secondary" />;
      case "received":
        return null;
      case "failed":
        return (
          <span title="Falha ao entregar">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          </span>
        );
      default: // sent or read
        return <CheckCheck className="w-3.5 h-3.5 text-primary" />;
    }
  };

  // Filter chat list by search input
  const filteredChats = chatList.filter(chat => 
    chat.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    chat.chat_jid.replace(/\D/g, "").includes(searchQuery)
  );

  const activeChat = chatList.find(c => c.chat_jid === selectedJid);
  const activeMessages = messages.filter(msg => msg.chat_jid === selectedJid);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-in fade-in-50 duration-500 max-w-6xl mx-auto">
      
      {/* Header Info */}
      <div className="flex justify-between items-center bg-salon-surface border border-salon-border rounded-salon px-6 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Atendimento Centralizado (WhatsApp)</h2>
            <p className="text-[10px] text-salon-text-secondary">Conectado ao robô de automação da barbearia</p>
          </div>
        </div>

        {/* Connection status banner */}
        <div className="flex items-center gap-2">
          {botConnected === true ? (
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Robô Ativo
            </span>
          ) : botConnected === false ? (
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Robô Desconectado
              </span>
              <Link 
                href="/dashboard/configuracoes?tab=whatsapp"
                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 hover:border-primary/50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                Configurar
              </Link>
            </div>
          ) : (
            <span className="bg-salon-border/40 text-salon-text-secondary border border-salon-border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Carregando Status
            </span>
          )}
        </div>
      </div>

      {dbError ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-salon p-6 text-center space-y-3 flex-1 flex flex-col items-center justify-center text-salon-text-primary">
          <AlertCircle className="w-12 h-12 text-rose-400" />
          <h3 className="text-sm font-bold">Banco de Dados não Configurado</h3>
          <p className="text-xs text-rose-200/80 max-w-md leading-relaxed">
            A tabela de histórico de conversas <code className="bg-rose-500/25 px-1.5 py-0.5 rounded font-mono">whatsapp_messages</code> não foi encontrada no Supabase. 
            Por favor, execute o script SQL contido na página de configurações ou no Walkthrough para criar a estrutura e liberar esta funcionalidade.
          </p>
        </div>
      ) : chatList.length === 0 ? (
        <div className="bg-salon-surface border border-salon-border rounded-salon p-12 text-center space-y-4 flex-1 flex flex-col items-center justify-center text-salon-text-primary">
          <Smartphone className="w-16 h-16 text-salon-text-secondary/40" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold">Nenhuma conversa encontrada</h3>
            <p className="text-xs text-salon-text-secondary max-w-sm leading-relaxed">
              O histórico de mensagens do WhatsApp está limpo. Assim que o robô receber a primeira mensagem de um cliente, ela será exibida aqui automaticamente.
            </p>
          </div>
        </div>
      ) : (
        /* Main Chat Panel Workspace */
        <div className="flex-1 min-h-0 bg-salon-surface border border-salon-border rounded-salon flex overflow-hidden text-salon-text-primary">
          
          {/* Chat List Sidebar (Left) */}
          <div className="w-80 border-r border-salon-border/80 flex flex-col bg-salon-surface">
            {/* Search inputs */}
            <div className="p-4 border-b border-salon-border/50 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-salon-text-secondary absolute left-3 top-3" />
                <input 
                  type="text"
                  placeholder="Pesquisar conversa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-salon-bg border border-salon-border rounded-salon text-xs focus:outline-none focus:border-primary transition-all text-salon-text-primary"
                />
              </div>
            </div>

            {/* List timeline */}
            <div className="flex-1 overflow-y-auto divide-y divide-salon-border/30">
              {filteredChats.map((chat) => {
                const isSelected = selectedJid === chat.chat_jid;
                const cleanPhone = chat.chat_jid.split("@")[0].replace(/^55/, "");
                const formattedPhone = cleanPhone.length >= 10 
                  ? `(${cleanPhone.slice(0,2)}) ${cleanPhone.slice(2,7)}-${cleanPhone.slice(7)}`
                  : cleanPhone;

                return (
                  <button
                    key={chat.chat_jid}
                    onClick={() => setSelectedJid(chat.chat_jid)}
                    className={`w-full p-4 flex gap-3 text-left transition-all ${
                      isSelected ? "bg-salon-bg border-l-2 border-primary" : "hover:bg-salon-bg/40"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 font-bold text-xs uppercase border border-primary/20">
                      {chat.contact_name.slice(0, 2)}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-xs font-bold truncate">{chat.contact_name}</h4>
                        <span className="text-[9px] text-salon-text-secondary">{chat.lastMessageTime}</span>
                      </div>
                      
                      <p className="text-[10px] text-salon-text-secondary truncate">{chat.lastMessage}</p>
                      <p className="text-[9px] text-salon-text-secondary font-mono leading-none">{formattedPhone}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation Timelines (Right) */}
          <div className="flex-1 flex flex-col bg-salon-bg/30">
            {activeChat ? (
              <>
                {/* Active Chat Header */}
                <div className="px-6 py-4 border-b border-salon-border/50 shrink-0 bg-salon-surface flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/25">
                      {activeChat.contact_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold">{activeChat.contact_name}</h3>
                      <p className="text-[9px] text-salon-text-secondary font-mono">{activeChat.chat_jid.split("@")[0]}</p>
                    </div>
                  </div>
                </div>

                {/* Messages Viewport */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {activeMessages.map((msg) => {
                    const formattedTime = new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    });

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${msg.from_me ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-salon px-4 py-3 text-xs leading-relaxed space-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.05)] ${
                            msg.from_me
                              ? "bg-primary text-salon-bg font-medium rounded-tr-none"
                              : "bg-salon-surface text-salon-text-primary rounded-tl-none border border-salon-border/80"
                          }`}
                        >
                          <p className="break-words">{msg.body}</p>
                          <div className={`flex justify-end items-center gap-1 text-[9px] ${
                            msg.from_me ? "text-salon-bg/75" : "text-salon-text-secondary"
                          }`}>
                            <span>{formattedTime}</span>
                            {msg.from_me && getStatusIcon(msg.status)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input bar */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-salon-border/50 shrink-0 bg-salon-surface flex gap-3 items-center"
                >
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={sending || botConnected !== true}
                    placeholder={botConnected === true ? "Digite sua mensagem..." : "O robô precisa estar Conectado para enviar mensagens."}
                    className="flex-1 px-4 py-3 bg-salon-bg border border-salon-border rounded-salon text-xs focus:outline-none focus:border-primary transition-all text-salon-text-primary disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputText.trim() || botConnected !== true}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-salon-bg p-3 rounded-salon transition-all flex items-center justify-center"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-salon-text-secondary space-y-2 p-6">
                <MessageSquare className="w-12 h-12 text-salon-text-secondary/30" />
                <p className="text-xs">Selecione uma conversa ao lado para começar.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
