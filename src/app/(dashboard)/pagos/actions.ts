'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { pagoSchema } from '@/lib/validations';

export async function crearPago(formData: FormData) {
  const supabase = createClient();
  const parsed = pagoSchema.safeParse({
    id_miembro: String(formData.get('id_miembro') ?? ''),
    id_tipo_membresia: String(formData.get('id_tipo_membresia') ?? '') || null,
    concepto: String(formData.get('concepto') ?? '').trim(),
    monto: String(formData.get('monto') ?? ''),
    metodo_pago: String(formData.get('metodo_pago') ?? 'Efectivo'),
    referencia: String(formData.get('referencia') ?? '') || null,
    fecha_vencimiento: String(formData.get('fecha_vencimiento') ?? '') || null,
    notas: String(formData.get('notas') ?? '') || null
  });

  if (!parsed.success) {
    redirect('/pagos?error=' + encodeURIComponent(parsed.error.errors[0]?.message ?? 'Datos inválidos'));
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: tipo } = parsed.data.id_tipo_membresia
    ? await supabase
        .from('tipos_membresia')
        .select('duracion_dias')
        .eq('id', parsed.data.id_tipo_membresia)
        .single()
    : { data: null };

  // Si hay membresía, calcula vencimiento = hoy + duracion_dias (si no se dio manual)
  let venc = parsed.data.fecha_vencimiento || null;
  if (!venc && tipo?.duracion_dias) {
    const d = new Date();
    d.setDate(d.getDate() + tipo.duracion_dias);
    venc = d.toISOString().slice(0, 10);
  }

  const { error } = await supabase.from('pagos').insert({
    id_miembro: parsed.data.id_miembro,
    id_tipo_membresia: parsed.data.id_tipo_membresia || null,
    concepto: parsed.data.concepto,
    monto: parsed.data.monto,
    metodo_pago: parsed.data.metodo_pago,
    referencia: parsed.data.referencia,
    fecha_vencimiento: venc,
    notas: parsed.data.notas,
    registrado_por: user?.id ?? null
  });

  if (error) {
    redirect('/pagos?error=' + encodeURIComponent(error.message));
  }

  // Extiende la membresía del miembro si el pago trae vencimiento
  if (venc) {
    await supabase
      .from('miembros')
      .update({
        id_tipo_membresia: parsed.data.id_tipo_membresia || undefined,
        fecha_inicio_membresia: new Date().toISOString().slice(0, 10),
        fecha_fin_membresia: venc
      })
      .eq('id', parsed.data.id_miembro);
  }

  revalidatePath('/pagos');
  redirect('/pagos?ok=' + encodeURIComponent('Pago registrado'));
}
