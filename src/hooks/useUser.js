import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
  
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

   
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return user;
}