import { supabase } from '../lib/supabase';

export async function getBoards() {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createBoard(title) {
  const { data, error } = await supabase
    .from('boards')
    .insert({ title })
    .select();

  if (error) throw error;
  return data[0];
}

export async function deleteBoard(id) {
  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', id);

  if (error) throw error;
}