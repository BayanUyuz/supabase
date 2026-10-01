import { supabase } from '../lib/supabase';

export async function getTasks(boardId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createTask(boardId, title) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ board_id: boardId, title })
    .select();

  if (error) throw error;
  return data[0];
}

export async function updateTaskStatus(id, status) {
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteTask(id) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}