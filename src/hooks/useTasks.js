import { useState, useEffect, useCallback } from 'react';
import { getTasks } from '../services/tasks';
import { supabase } from '../lib/supabase';

export function useTasks(boardId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!boardId) return;
    try {
      const data = await getTasks(boardId);
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [boardId]);

  useEffect(() => {
    if (!boardId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);

    async function load() {
      try {
        const data = await getTasks(boardId);
        if (!ignore) {
          setTasks(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    
    const channel = supabase
      .channel(`tasks-board-${boardId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `board_id=eq.${boardId}` },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [boardId]);

  return { tasks, loading, error, reload };
}