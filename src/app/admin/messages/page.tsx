"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/admin/Sidebar";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import {
  Mail,
  Trash2,
  RefreshCcw,
  MessageSquare,
  Reply,
  User,
  Calendar,
} from "lucide-react";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("contact-messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contact_messages",
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando mensajes:", error);

      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los mensajes de contacto.",
        icon: "error",
        background: "#0f0f0f",
        color: "#fff",
      });

      setLoading(false);
      return;
    }

    setMessages(data || []);
    setLoading(false);
  };

  const handleReply = (item: ContactMessage) => {
    const subject = encodeURIComponent(
      `Respuesta a tu mensaje - Portafolio Jack Anderson`
    );

    const body = encodeURIComponent(
      `Hola ${item.name},\n\nGracias por contactarme desde mi portafolio.\n\n`
    );

    window.location.href = `mailto:${item.email}?subject=${subject}&body=${body}`;
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Eliminar mensaje?",
      text: "Esta acción eliminará el mensaje de contacto.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#0f0f0f",
      color: "#fff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#27272a",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando mensaje:", error);

      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el mensaje. Revisa permisos RLS.",
        icon: "error",
        background: "#0f0f0f",
        color: "#fff",
      });

      return;
    }

    setMessages((prev) => prev.filter((item) => item.id !== id));

    Swal.fire({
      title: "Eliminado",
      text: "El mensaje fue eliminado correctamente.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
      background: "#0f0f0f",
      color: "#fff",
    });
  };

  const formatDate = (date?: string) => {
    if (!date) return "Sin fecha";

    return new Date(date).toLocaleString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />

      <main className="lg:ml-[250px] min-h-screen px-4 sm:px-6 lg:px-8 pt-[90px] lg:pt-8 pb-8">
        <div className="max-w-[1250px] mx-auto">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Mensajes
              </h1>

              <p className="text-sm text-white/40 mt-1">
                Revisa los mensajes enviados desde el formulario de contacto
              </p>
            </div>

            <button
              onClick={fetchMessages}
              className="h-11 px-5 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition flex items-center justify-center gap-2 text-sm w-full sm:w-fit"
            >
              <RefreshCcw size={14} />
              Actualizar
            </button>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] py-20 text-center text-white/40">
              Cargando mensajes...
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] py-20 flex flex-col items-center gap-3 text-white/40">
              <MessageSquare size={30} />
              Aún no hay mensajes de contacto
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 hover:border-white/20 transition"
                >
                  <div className="flex flex-col xl:flex-row gap-5">
                    {/* LEFT */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[12px] text-white/70">
                          <User size={13} />
                          {item.name || "Sin nombre"}
                        </span>

                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[12px] text-white/70 break-all">
                          <Mail size={13} />
                          {item.email || "Sin correo"}
                        </span>

                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[12px] text-white/45">
                          <Calendar size={13} />
                          {formatDate(item.created_at)}
                        </span>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                        <p className="text-[12px] text-white/35 mb-2">
                          Mensaje recibido
                        </p>

                        <p className="text-sm text-white/65 leading-7 whitespace-pre-wrap break-words">
                          {item.message}
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex xl:flex-col flex-row gap-2 shrink-0">
                      <button
                        onClick={() => handleReply(item)}
                        title="Responder por correo"
                        className="h-11 px-4 rounded-2xl bg-white text-black hover:opacity-90 transition flex items-center justify-center gap-2 text-sm"
                      >
                        <Reply size={15} />
                        Responder
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Eliminar mensaje"
                        className="h-11 px-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition flex items-center justify-center gap-2 text-red-300 text-sm"
                      >
                        <Trash2 size={15} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
