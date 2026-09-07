// Tipos mínimos compatibles con el esquema MVP.
// Regenera con: npm run db:types  (supabase gen types typescript --schema public)
export type Rol = 'Admin' | 'Empleado' | 'Instructor';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          nombre_completo: string | null;
          rol: Rol;
          activo: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          nombre_completo?: string | null;
          rol?: Rol;
          activo?: boolean;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      tipos_membresia: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          precio: number;
          duracion_dias: number;
          estado: string;
          created_at: string;
        };
        Insert: {
          nombre: string;
          descripcion?: string | null;
          precio: number;
          duracion_dias: number;
          estado?: string;
        };
        Update: Partial<Database['public']['Tables']['tipos_membresia']['Insert']>;
      };
      miembros: {
        Row: {
          id: string;
          dni: string;
          nombres: string;
          apellidos: string;
          fecha_nacimiento: string | null;
          genero: string | null;
          telefono: string | null;
          email: string | null;
          direccion: string | null;
          fecha_registro: string;
          peso_inicial_kg: number | null;
          estatura_cm: number | null;
          foto_url: string | null;
          enfermedades: string | null;
          seguro: string | null;
          contacto_emergencia_nombre: string | null;
          contacto_emergencia_telefono: string | null;
          estado: string;
          id_tipo_membresia: string | null;
          fecha_inicio_membresia: string | null;
          fecha_fin_membresia: string | null;
          notas: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['miembros']['Row'],
          'id' | 'created_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['miembros']['Insert']>;
      };
      pagos: {
        Row: {
          id: string;
          id_miembro: string;
          id_tipo_membresia: string | null;
          concepto: string;
          monto: number;
          fecha_pago: string;
          fecha_vencimiento: string | null;
          metodo_pago: string;
          referencia: string | null;
          notas: string | null;
          registrado_por: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pagos']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['pagos']['Insert']>;
      };
      asistencias: {
        Row: {
          id: string;
          id_miembro: string;
          fecha_hora_ingreso: string;
          fecha_hora_salida: string | null;
          tipo_visita: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['asistencias']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['asistencias']['Insert']>;
      };
    };
  };
}

export type Miembro = Database['public']['Tables']['miembros']['Row'];
export type Pago = Database['public']['Tables']['pagos']['Row'];
export type Asistencia = Database['public']['Tables']['asistencias']['Row'];
export type TipoMembresia = Database['public']['Tables']['tipos_membresia']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
