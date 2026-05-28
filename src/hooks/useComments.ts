'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  fetchCommentsService,
  createCommentService,
  likeCommentService,
  uploadCommentImageService,
} from '@/lib/commentService'

export default function useComments() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchInitialComments = useCallback(async () => {
    try {
      const data = await fetchCommentsService()
      setComments(data || [])
    } catch (err) {
      console.error('Error cargando comentarios:', err)
    }
  }, [])

  useEffect(() => {
    fetchInitialComments()

    const channel = supabase
      .channel('comments-public-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
        },
        async () => {
          await fetchInitialComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchInitialComments])

  const addComment = async ({
    name,
    comment,
    image,
  }: {
    name: string
    comment: string
    image: File | null
  }) => {
    if (!name.trim()) return
    if (!comment.trim()) return

    setLoading(true)

    try {
      let imageUrl: string | null = null

      if (image) {
        imageUrl = await uploadCommentImageService(image)
      }

      const newComment = await createCommentService({
        name,
        comment,
        imageUrl,
      })

      if (newComment) {
        setComments((prev) => {
          const exists = prev.some(
            (item) => item.id === newComment.id
          )

          if (exists) return prev

          return [newComment, ...prev]
        })
      }
    } catch (err) {
      console.error('Error agregando comentario:', err)
    } finally {
      setLoading(false)
    }
  }

  const likeComment = async (
    id: number,
    currentLikes: number
  ) => {
    const liked = localStorage.getItem(`liked-${id}`)

    if (liked) return

    try {
      const newLikes = await likeCommentService(
        id,
        currentLikes || 0
      )

      localStorage.setItem(`liked-${id}`, 'true')

      setComments((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                likes: newLikes,
              }
            : item
        )
      )
    } catch (err) {
      console.error('Error dando corazón:', err)
    }
  }

  return {
    comments,
    loading,
    addComment,
    likeComment,
  }
}
