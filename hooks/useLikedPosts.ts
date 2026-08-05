'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { useSession } from 'next-auth/react'
import { likedPostIdsState } from '@/app/store/likedPostAtom'
import { getLikedPostIds, likePost } from '@/lib/actions/LikePost'

/**
 * Shared like state for the feed.
 *
 * The old implementation gave every PostComponent its own `useState` seeded
 * from an atom that was never populated, then fired a `GET /api/posts/:id/like`
 * per card on mount. On a 20-post feed that was 20 round-trips and the hearts
 * visibly popped in one by one. Here the ids are fetched once and cached in
 * Recoil, so a like on one card is instantly consistent everywhere the post
 * appears.
 */
export function useLikedPosts() {
  const { status } = useSession()
  const [likedIds, setLikedIds] = useRecoilState(likedPostIdsState)
  const [pendingIds, setPendingIds] = useState<number[]>([])
  const hasFetched = useRef(false)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      hasFetched.current = false
      setLikedIds([])
      return
    }

    if (hasFetched.current) return
    hasFetched.current = true

    let cancelled = false
    getLikedPostIds()
      .then((ids) => {
        if (!cancelled) setLikedIds(ids)
      })
      .catch((error) => {
        console.error('Failed to load liked posts:', error)
        hasFetched.current = false
        if (!cancelled) setLikedIds([])
      })

    return () => {
      cancelled = true
    }
  }, [status, setLikedIds])

  const isLiked = useCallback(
    (postId: number) => (likedIds ?? []).includes(postId),
    [likedIds]
  )

  /**
   * Optimistically flips the heart, then reconciles with the server.
   * Returns the outcome so the caller can prompt for sign-in.
   */
  const toggleLike = useCallback(
    async (postId: number) => {
      if (pendingIds.includes(postId)) return { handled: true as const }

      const wasLiked = (likedIds ?? []).includes(postId)
      const optimistic = wasLiked
        ? (likedIds ?? []).filter((id) => id !== postId)
        : [...(likedIds ?? []), postId]

      setLikedIds(optimistic)
      setPendingIds((ids) => [...ids, postId])

      try {
        const result = await likePost(postId)

        if (!result.success) {
          // Roll back to the pre-click value rather than flipping again — a
          // second click landing mid-flight used to leave the heart inverted.
          setLikedIds((current) => {
            const list = current ?? []
            return wasLiked
              ? Array.from(new Set([...list, postId]))
              : list.filter((id) => id !== postId)
          })
          return { handled: false as const, reason: result.reason }
        }

        setLikedIds((current) => {
          const list = current ?? []
          return result.liked
            ? Array.from(new Set([...list, postId]))
            : list.filter((id) => id !== postId)
        })
        return { handled: true as const }
      } finally {
        setPendingIds((ids) => ids.filter((id) => id !== postId))
      }
    },
    [likedIds, pendingIds, setLikedIds]
  )

  return {
    isLiked,
    toggleLike,
    isPending: (postId: number) => pendingIds.includes(postId),
    /** False until the first fetch resolves, so hearts can stay neutral. */
    isReady: likedIds !== null,
  }
}
