// microservicios/puestos/src/puestos/interfaces/puesto.interface.ts
export enum PuestoStatus {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

export interface IPuesto {
  id: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  emprendedorId: string;
  estado: PuestoStatus;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
