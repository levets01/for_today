import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @Column({ type: 'varchar', nullable: true })
  asesor: string | null;

  @Column({ type: 'varchar', default: SolicitudeEstado.PENDIENTE })
  estado: SolicitudeEstado;

  @CreateDateColumn({ type: 'datetime' })
  creadaEn: Date;

  @UpdateDateColumn({ type: 'datetime' })
  actualizadaEn: Date;
}

