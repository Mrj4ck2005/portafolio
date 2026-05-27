"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/admin/Sidebar";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import {
  Trash2,
  Pin,
  Heart,
  MessageSquare,
  RefreshCcw,
  Send,
} from "lucide-react";

type Reply = {
  username: string;
  message: string;
  created_at: string;
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [sendingReply, setSendingReply] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel("comments-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchComments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error) {
      setComments(data || []);
    } else {
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los comentarios.",
        icon: "error",
        background: "#0f0f0f",
        color: "#fff",
      });
    }

    setLoading(false);
  };

  const deleteComment = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar comentario?",
      text: "Esta acción no se puede deshacer.",
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
      .from("comments")
      .delete()
      .eq("id", id);

    if (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el comentario. Revisa los permisos RLS.",
        icon: "error",
        background: "#0f0f0f",
        color: "#fff",
      });
      return;
    }

    setComments((prev) => prev.filter((item) => item.id !== id));

    Swal.fire({
      title: "Eliminado",
      text: "El comentario fue eliminado correctamente.",
      icon: "success",
      timer: 1600,
      showConfirmButton: false,
      background: "#0f0f0f",
      color: "#fff",
    });
  };

  const togglePin = async (id: number, current: boolean) => {
    const newValue = !current;

    const { error } = await supabase
      .from("comments")
      .update({
        is_pinned: newValue,
      })
      .eq("id", id);

    if (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el comentario fijado.",
        icon: "error",
        background: "#0f0f0f",
        color: "#fff",
      });
      return;
    }

    setComments((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              is_pinned: newValue,
            }
          : item
      )
    );
  };

  const toggleAdminLike = async (
    id: number,
    likes: number,
    likedByAdmin: boolean
  ) => {
    const newLiked = !likedByAdmin;

    const newLikes = newLiked
      ? (likes || 0) + 1
      : Math.max((likes || 0) - 1, 0);

    const { error } = await supabase
      .from("comments")
      .update({
        likes: newLikes,
        liked_by_admin: newLiked,
      })
      .eq("id", id);

    if (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el corazón del comentario.",
        icon: "error",
        background: "#0f0f0f",
        color: "#fff",
      });
      return;
    }

    setComments((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              likes: newLikes,
              liked_by_admin: newLiked,
            }
          : item
      )
    );
  };

  const sendReply = async (commentId: number) => {
    const text = replyText[commentId];

    if (!text?.trim()) return;

    const target = comments.find((item) => item.id === commentId);

    if (!target) return;

    const oldReplies: Reply[] = Array.isArray(target.replies)
      ? target.replies
      : [];

    const newReply: Reply = {
      username: "Administrador",
      message: text.trim(),
      created_at: new Date().toISOString(),
    };

    const updatedReplies = [...oldReplies, newReply];

    setSendingReply((prev) => ({
      ...prev,
      [commentId]: true,
    }));

    const { error } = await supabase
      .from("comments")
      .update({
        replies: updatedReplies,
      })
      .eq("id", commentId);

    setSendingReply((prev) => ({
      ...prev,
      [commentId]: false,
    }));

    if (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo enviar la respuesta. Revisa si existe la columna replies y los permisos RLS.",
        icon: "error",
        background: "#0f0f0f",
        color: "#fff",
      });
      return;
    }

    setComments((prev) =>
      prev.map((item) =>
        item.id === commentId
          ? {
              ...item,
              replies: updatedReplies,
            }
          : item
      )
    );

    setReplyText((prev) => ({
      ...prev,
      [commentId]: "",
    }));
  };

  const formatDate = (date?: string) => {
    if (!date) return "Sin fecha";

    return new Date(date).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date?: string) => {
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
                Comentarios
              </h1>

              <p className="text-sm text-white/40 mt-1">
                Administra los comentarios de tu portafolio
              </p>
            </div>

            <button
              onClick={fetchComments}
              className="h-11 px-5 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition flex items-center justify-center gap-2 text-sm w-full sm:w-fit"
            >
              <RefreshCcw size={14} />
              Actualizar
            </button>
          </div>

          {/* CONTENT */}
          <div className="space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] py-20 text-center text-white/40">
                Cargando comentarios...
              </div>
            ) : comments.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] py-20 flex flex-col items-center gap-3 text-white/40">
                <MessageSquare size={28} />
                Aún no hay comentarios
              </div>
            ) : (
              comments.map((comment) => {
                const replies: Reply[] = Array.isArray(comment.replies)
                  ? comment.replies
                  : [];

                return (
                  <div
                    key={comment.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 hover:border-white/20 transition"
                  >
                    <div className="flex flex-col gap-5">
                      {/* TOP */}
                      <div className="flex flex-col xl:flex-row gap-5">
                        {/* LEFT */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <p className="font-medium text-[14px] break-all">
                              {comment.name || comment.username || "Usuario"}
                            </p>

                            {comment.is_pinned && (
                              <span className="text-[9px] px-2 py-[3px] rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/20">
                                FIJADO
                              </span>
                            )}

                            {comment.liked_by_admin && (
                              <span className="text-[9px] px-2 py-[3px] rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/20">
                                CON ME GUSTA
                              </span>
                            )}
                          </div>

                          <p className="text-[13px] text-white/60 leading-6 mb-3 break-words">
                            {comment.comment}
                          </p>

                          {comment.image_url && (
                            <img
                              src={comment.image_url}
                              alt="Imagen del comentario"
                              className="rounded-2xl border border-white/10 w-full max-w-full sm:max-w-[260px] object-cover mb-4"
                            />
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/35">
                            <span>{comment.likes || 0} corazones</span>

                            <span>{formatDate(comment.created_at)}</span>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex xl:flex-col flex-row gap-2 shrink-0">
                          <button
                            onClick={() =>
                              toggleAdminLike(
                                comment.id,
                                comment.likes || 0,
                                Boolean(comment.liked_by_admin)
                              )
                            }
                            title="Dar o quitar corazón como administrador"
                            className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition ${
                              comment.liked_by_admin
                                ? "bg-pink-500/20 border-pink-500/30 text-pink-300"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            <Heart
                              size={15}
                              fill={
                                comment.liked_by_admin
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>

                          <button
                            onClick={() =>
                              togglePin(
                                comment.id,
                                Boolean(comment.is_pinned)
                              )
                            }
                            title="Fijar o desfijar comentario"
                            className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition ${
                              comment.is_pinned
                                ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-300"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            <Pin size={15} />
                          </button>

                          <button
                            onClick={() => deleteComment(comment.id)}
                            title="Eliminar comentario"
                            className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition flex items-center justify-center text-red-300"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* REPLIES */}
                      {replies.length > 0 && (
                        <div className="border-t border-white/5 pt-4">
                          <p className="text-[12px] text-white/35 mb-3">
                            Respuestas del administrador
                          </p>

                          <div className="space-y-3">
                            {replies.map((reply, index) => (
                              <div
                                key={index}
                                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                  <p className="text-[12px] font-medium text-white/80">
                                    {reply.username || "Administrador"}
                                  </p>

                                  <span className="text-[10px] text-white/30">
                                    {formatDateTime(reply.created_at)}
                                  </span>
                                </div>

                                <p className="text-[12px] text-white/55 leading-5 break-words">
                                  {reply.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* REPLY INPUT */}
                      <div className="border-t border-white/5 pt-4">
                        <div className="flex items-center gap-2">
                          <input
                            value={replyText[comment.id] || ""}
                            onChange={(e) =>
                              setReplyText((prev) => ({
                                ...prev,
                                [comment.id]: e.target.value,
                              }))
                            }
                            placeholder="Escribe una respuesta..."
                            className="flex-1 h-11 px-4 rounded-2xl bg-black/20 border border-white/10 outline-none text-sm text-white placeholder:text-white/30"
                          />

                          <button
                            onClick={() => sendReply(comment.id)}
                            disabled={Boolean(sendingReply[comment.id])}
                            className="h-11 min-w-[54px] px-4 rounded-2xl bg-white text-black hover:opacity-90 transition flex items-center justify-center disabled:opacity-60"
                          >
                            {sendingReply[comment.id] ? (
                              <span className="text-xs">...</span>
                            ) : (
                              <Send size={15} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
