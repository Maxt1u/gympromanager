'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { miembroSchema } from '@/lib/validations';

function nullIfEmpty(v: FormDataEntryValue | null): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

export async function crearMiembro(formData: FormData) {
  const supabase = createClient();

  const parsed = miembroSchema.safeParse({
    dni: String(formData.get('dni') ?? '').trim(),
    nombres: String(formData.get('nombres') ?? '').trim(),
    apellidos: String(formData.get('apellidos') ?? '').trim(),
    fecha_nacimiento: nullIfEmpty(formData.get('fecha_nacimiento')),
    genero: nullIfEmpty(formData.get('genero')),
    telefono: nullIfEmpty(formData.get('telefono')),
    email: nullIfEmpty(formData.get('email')),
    direccion: nullIfEmpty(formData.get('direccion')),
    peso_inicial_kg: nullIfEmpty(formData.get('peso_inicial_kg')),
    estatura_cm: nullIfEmpty(formData.get('estatura_cm')),
    enfermedades: nullIfEmpty(formData.get('enfermedades')),
    seguro: nullIfEmpty(formData.get('seguro')),
    contacto_emergencia_nombre: nullIfEmpty(formData.get('contacto_emergencia_nombre')),
    contacto_emergencia_telefono: nullIfEmpty(formData.get('contacto_emergencia_telefono')),
    estado: String(formData.get('estado') ?? 'Activo'),
    id_tipo_membresia: nullIfEmpty(formData.get('id_tipo_membresia')),
    fecha_inicio_membresia: nullIfEmpty(formData.get('fecha_inicio_membresia')),
    fecha_fin_membresia: nullIfEmpty(formData.get('fecha_fin_membresia')),
    notas: nullIfEmpty(formData.get('notas'))
  });

  if (!parsed.success) {
    redirect('/miembros?error=' + encodeURIComponent(parsed.error.errors[0]?.message ?? 'Datos inválidos'));
  }

  const d = parsed.data;
  const { error } = await supabase.from('miembros').insert({
    dni: d.dni,
    nombres: d.nombres,
    apellidos: d.apellidos,
    fecha_nacimiento: d.fecha_nacimiento,
    genero: d.genero,
    telefono: d.telefono,
    email: d.email,
    direccion: d.direccion,
    peso_inicial_kg: d.peso_inicial_kg ?? null,
    estatura_cm: d.estatura_cm ?? null,
    enfermedades: d.enfermedades,
    seguro: d.seguro,
    contacto_emergencia_nombre: d.contacto_emergencia_nombre,
    contacto_emergencia_telefono: d.contacto_emergencia_telefono,
    estado: d.estado,
    id_tipo_membresia: d.id_tipo_membresia || null,
    fecha_inicio_membresia: d.fecha_inicio_membresia,
    fecha_fin_membresia: d.fecha_fin_membresia,
    notas: d.notas
  });

  if (error) {
    redirect('/miembros?error=' + encodeURIComponent(error.message));
  }
  revalidatePath('/miembros');
  redirect('/miembros?ok=' + encodeURIComponent('Miembro creado'));
}

export async function actualizarMiembro(id: string, formData: FormData) {
  const supabase = createClient();
  const parsed = miembroSchema.safeParse({
    dni: String(formData.get('dni') ?? '').trim(),
    nombres: String(formData.get('nombres') ?? '').trim(),
    apellidos: String(formData.get('apellidos') ?? '').trim(),
    fecha_nacimiento: nullIfEmpty(formData.get('fecha_nacimiento')),
    genero: nullIfEmpty(formData.get('genero')),
    telefono: nullIfEmpty(formData.get('telefono')),
    email: nullIfEmpty(formData.get('email')),
    direccion: nullIfEmpty(formData.get('direccion')),
    peso_inicial_kg: nullIfEmpty(formData.get('peso_inicial_kg')),
    estatura_cm: nullIfEmpty(formData.get('estatura_cm')),
    enfermedades: nullIfEmpty(formData.get('enfermedades')),
    seguro: nullIfEmpty(formData.get('seguro')),
    contacto_emergencia_nombre: nullIfEmpty(formData.get('contacto_emergencia_nombre')),
    contacto_emergencia_telefono: nullIfEmpty(formData.get('contacto_emergencia_telefono')),
    estado: String(formData.get('estado') ?? 'Activo'),
    id_tipo_membresia: nullIfEmpty(formData.get('id_tipo_membresia')),
    fecha_inicio_membresia: nullIfEmpty(formData.get('fecha_inicio_membresia')),
    fecha_fin_membresia: nullIfEmpty(formData.get('fecha_fin_membresia')),
    notas: nullIfEmpty(formData.get('notas'))
  });

  if (!parsed.success) {
    redirect(`/miembros/${id}?error=` + encodeURIComponent('Datos inválidos'));
  }

  const d = parsed.data;
  const { error } = await supabase
    .from('miembros')
    .update({
      dni: d.dni,
      nombres: d.nombres,
      apellidos: d.apellidos,
      fecha_nacimiento: d.fecha_nacimiento,
      genero: d.genero,
      telefono: d.telefono,
      email: d.email,
      direccion: d.direccion,
      peso_inicial_kg: d.peso_inicial_kg ?? null,
      estatura_cm: d.estatura_cm ?? null,
      enfermedades: d.enfermedades,
      seguro: d.seguro,
      contacto_emergencia_nombre: d.contacto_emergencia_nombre,
      contacto_emergencia_telefono: d.contacto_emergencia_telefono,
      estado: d.estado,
      id_tipo_membresia: d.id_tipo_membresia || null,
      fecha_inicio_membresia: d.fecha_inicio_membresia,
      fecha_fin_membresia: d.fecha_fin_membresia,
      notas: d.notas
    })
    .eq('id', id);

  if (error) {
    redirect(`/miembros/${id}?error=` + encodeURIComponent(error.message));
  }
  revalidatePath('/miembros');
  redirect(`/miembros/${id}?ok=` + encodeURIComponent('Miembro actualizado'));
}

export async function eliminarMiembro(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('miembros').delete().eq('id', id);
  if (error) {
    redirect('/miembros?error=' + encodeURIComponent(error.message));
  }
  revalidatePath('/miembros');
  redirect('/miembros?ok=' + encodeURIComponent('Miembro eliminado'));
}
