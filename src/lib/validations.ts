import { z } from 'zod';

export const miembroSchema = z.object({
  dni: z.string().min(4, 'DNI muy corto').max(20),
  nombres: z.string().min(2, 'Requerido'),
  apellidos: z.string().min(2, 'Requerido'),
  fecha_nacimiento: z.string().optional().nullable(),
  genero: z.enum(['M', 'F', 'Otro']).optional().nullable(),
  telefono: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().or(z.literal('')).nullable(),
  direccion: z.string().optional().nullable(),
  peso_inicial_kg: z.coerce.number().positive().optional().nullable(),
  estatura_cm: z.coerce.number().positive().optional().nullable(),
  enfermedades: z.string().optional().nullable(),
  seguro: z.string().optional().nullable(),
  contacto_emergencia_nombre: z.string().optional().nullable(),
  contacto_emergencia_telefono: z.string().optional().nullable(),
  estado: z.enum(['Activo', 'Inactivo', 'Suspendido']).default('Activo'),
  id_tipo_membresia: z.string().uuid().optional().or(z.literal('')).nullable(),
  fecha_inicio_membresia: z.string().optional().nullable(),
  fecha_fin_membresia: z.string().optional().nullable(),
  notas: z.string().optional().nullable()
});

export type MiembroInput = z.infer<typeof miembroSchema>;

export const pagoSchema = z.object({
  id_miembro: z.string().uuid('Selecciona un miembro'),
  id_tipo_membresia: z.string().uuid().optional().or(z.literal('')).nullable(),
  concepto: z.string().min(3, 'Concepto requerido'),
  monto: z.coerce.number().positive('Monto debe ser > 0'),
  metodo_pago: z.enum(['Efectivo', 'Tarjeta', 'Transferencia', 'Otro']).default('Efectivo'),
  referencia: z.string().optional().nullable(),
  fecha_vencimiento: z.string().optional().nullable(),
  notas: z.string().optional().nullable()
});

export type PagoInput = z.infer<typeof pagoSchema>;

export const asistenciaSchema = z.object({
  id_miembro: z.string().uuid('Selecciona un miembro'),
  tipo_visita: z.string().default('Regular')
});

export type AsistenciaInput = z.infer<typeof asistenciaSchema>;
