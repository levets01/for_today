import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import type { SolicitudHistorial } from './solicitud-historial.entity.js';

export enum SolicitudeEstado {
  PENDIENTE = 'PENDIENTE',
  EN_GESTION = 'EN_GESTION',
  RESUELTA = 'RESUELTA',
}

@Entity({ name: 'solicitudes' })
export class Solicitude {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  cliente: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  asesor: string | null;

  @Index()
  @Column({ type: 'varchar', default: SolicitudeEstado.PENDIENTE })
  estado: SolicitudeEstado;

  

  @Index()
  @CreateDateColumn({ type: 'datetime' })
  creadaEn: Date;

  @UpdateDateColumn({ type: 'datetime' })
  actualizadaEn: Date;

  @OneToMany('SolicitudHistorial', (historial: any) => historial.solicitud)
  historial: SolicitudHistorial[];
}

