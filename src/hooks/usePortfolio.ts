'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  fetchCertificates,
  fetchProjects,
  fetchTechStacks,
} from '@/lib/portfolioService'

export default function usePortfolio() {
  const [projects, setProjects] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [techStacks, setTechStacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadPortfolio = useCallback(async () => {
    setLoading(true)

    try {
      const [
        projectsData,
        certificatesData,
        techStacksData,
      ] = await Promise.all([
        fetchProjects(),
        fetchCertificates(),
        fetchTechStacks(),
      ])

      setProjects(projectsData || [])
      setCertificates(certificatesData || [])
      setTechStacks(techStacksData || [])
    } catch (error) {
      console.error('Error cargando portafolio:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPortfolio()

    const channel = supabase
      .channel('portfolio-public-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        () => {
          loadPortfolio()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'certificates',
        },
        () => {
          loadPortfolio()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tech_stack',
        },
        () => {
          loadPortfolio()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadPortfolio])

  return {
    projects,
    certificates,
    techStacks,
    loading,
    reloadPortfolio: loadPortfolio,
  }
}
