import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Solicitude } from './solicitude.entity.js';

export enum TipoEventoSolicitud {
  CREACION = 'CREACION',
  ESTADO = 'ESTADO',
  ASIGNACION = 'ASIGNACION',
}

@Entity({ name: 'solicitud_historial' })
export class SolicitudHistorial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  solicitudId: number;

  @ManyToOne('Solicitude', (solicitud: any) => solicitud.historial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'solicitudId' })
  solicitud: Solicitude;

  @Column({ type: 'varchar' })
  tipoEvento: TipoEventoSolicitud;

  @Column({ type: 'varchar', nullable: true })
  valorAnterior: string | null;

  @Column({ type: 'varchar', nullable: true })
  valorNuevo: string | null;

  @Column({ type: 'varchar' })
  usuarioActor: string;

  @CreateDateColumn({ type: 'datetime' })
  fechaEvento: Date;
}
