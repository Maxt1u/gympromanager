'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function registrarIngreso(formData: FormData) {
  const supabase = createClient();
  const id_miembro = String(formData.get('id_miembro') ?? '');
  const tipo_visita = String(formData.get('tipo_visita') ?? 'Regular');
  if (!id_miembro) redirect('/asistencias?error=' + encodeURIComponent('Selecciona un miembro'));

  const { error } = await supabase.from('asistencias').insert({ id_miembro, tipo_visita });
  if (error) redirect('/asistencias?error=' + encodeURIComponent(error.message));
  revalidatePath('/asistencias');
  redirect('/asistencias?ok=' + encodeURIComponent('Ingreso registrado'));
}

export async function registrarSalida(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('asistencias')
    .update({ fecha_hora_salida: new Date().toISOString() })
    .eq('id', id)
    .is('fecha_hora_salida', null);
  if (error) redirect('/asistencias?error=' + encodeURIComponent(error.message));
  revalidatePath('/asistencias');
  redirect('/asistencias?ok=' + encodeURIComponent('Salida registrada'));
}
