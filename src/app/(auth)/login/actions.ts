'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const supabase = createClient();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect('/login?error=' + encodeURIComponent('Credenciales inválidas o usuario inactivo'));
  }

  // Verifica que el profile esté activo
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('activo')
      .eq('id', user.id)
      .single();
    if (profile && profile.activo === false) {
      await supabase.auth.signOut();
      redirect('/login?error=' + encodeURIComponent('Usuario inactivo. Contacta al administrador.'));
    }
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = createClient();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const nombre_completo = String(formData.get('nombre_completo') ?? email);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre_completo } }
  });

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message));
  }
  redirect('/login?ok=' + encodeURIComponent('Cuenta creada. Pide al Admin que active tu rol.'));
}
