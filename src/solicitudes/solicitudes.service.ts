import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateSolicitudeDto } from './dto/create-solicitude.dto.js';

import { Solicitude, SolicitudeEstado } from './entities/solicitude.entity.js';
import { AppUser, USERS } from '../common/guards/auth.guard.js';
import { ChangeEstadoDto } from './dto/change-estado.dto.js';
import { AsignarSolicitudDto } from './dto/asignar-solicitud.dto.js';
import { QuerySolicitudesDto } from './dto/query-solicitudes.dto.js';
import { SolicitudHistorial, TipoEventoSolicitud } from './entities/solicitud-historial.entity.js';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Solicitude)
    private readonly repo: Repository<Solicitude>,
    @InjectRepository(SolicitudHistorial)
    private readonly historialRepo: Repository<SolicitudHistorial>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private normalizeText(value: string | undefined, field: 'cliente' | 'descripcion') {
    if (typeof value !== 'string') {
      throw new BadRequestException(`${field} debe ser texto válido`);
    }

    const normalized = value.replace(/\s+/g, ' ').trim();
    if (!normalized) {
      throw new BadRequestException(`${field} no puede quedar vacío`);
    }

    return normalized;
  }

  private isValidTransition(from: SolicitudeEstado, to: SolicitudeEstado) {
    return (
      (from === SolicitudeEstado.PENDIENTE && to === SolicitudeEstado.EN_GESTION) ||
      (from === SolicitudeEstado.EN_GESTION && to === SolicitudeEstado.RESUELTA)
    );
  }

  private async ensureSolicitudAccess(id: number, user: AppUser) {
    const solicitud = await this.repo.findOne({ where: { id } });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (user.role === 'asesor' && solicitud.asesor !== user.username) {
      throw new ForbiddenException('No tienes acceso a esta solicitud');
    }

    return solicitud;
  }

  async create(createDto: CreateSolicitudeDto, user: AppUser) {
    const cliente = this.normalizeText(createDto.cliente, 'cliente');
    const descripcion = this.normalizeText(createDto.descripcion, 'descripcion');

    return this.dataSource.transaction(async (manager) => {
      const solicitudRepo = manager.getRepository(Solicitude);
      const historialRepo = manager.getRepository(SolicitudHistorial);

      const solicitud = solicitudRepo.create({
        cliente,
        descripcion,
        estado: SolicitudeEstado.PENDIENTE,
        asesor: user.role === 'asesor' ? user.username : null,
      });

      const saved = await solicitudRepo.save(solicitud);

      await historialRepo.save({
        solicitudId: saved.id,
        tipoEvento: TipoEventoSolicitud.CREACION,
        valorAnterior: null,
        valorNuevo: SolicitudeEstado.PENDIENTE,
        usuarioActor: user.username,
      });

      return saved;
    });
  }

  async findAll(user: AppUser, filters?: QuerySolicitudesDto) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const query = this.repo.createQueryBuilder('solicitud');

    if (user.role === 'asesor') {
      query.where('solicitud.asesor = :username', { username: user.username });
    }

    if (filters?.estado) {
      query.andWhere('solicitud.estado = :estado', { estado: filters.estado });
    }

    if (filters?.asesor && user.role !== 'asesor') {
      query.andWhere('solicitud.asesor = :asesor', { asesor: filters.asesor });
    }

    if (filters?.cliente) {
      query.andWhere('LOWER(solicitud.cliente) LIKE LOWER(:cliente)', {
        cliente: `%${filters.cliente.trim()}%`,
      });
    }

    if (filters?.desde || filters?.hasta) {
      if (filters.desde && filters.hasta && new Date(filters.desde) > new Date(filters.hasta)) {
        throw new BadRequestException('La fecha desde no puede ser posterior a hasta');
      }

      if (filters.desde) {
        query.andWhere('solicitud.creadaEn >= :desde', { desde: new Date(filters.desde) });
      }

      if (filters.hasta) {
        query.andWhere('solicitud.creadaEn <= :hasta', { hasta: new Date(filters.hasta) });
      }
    }

    const total = await query.getCount();
    const items = await query
      .orderBy('solicitud.creadaEn', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: number, user: AppUser) {
    return this.ensureSolicitudAccess(id, user);
  }

  async findHistorial(id: number, user: AppUser) {
    const solicitud = await this.ensureSolicitudAccess(id, user);
    const historial = await this.historialRepo.find({
      where: { solicitudId: solicitud.id },
      order: { fechaEvento: 'DESC' },
    });

    return historial;
  }

  async changeEstado(id: number, dto: ChangeEstadoDto, user: AppUser) {
    if (dto.estado === undefined) {
      throw new BadRequestException('Debe enviar el nuevo estado');
    }

    return this.dataSource.transaction(async (manager) => {
      const solicitudRepo = manager.getRepository(Solicitude);
      const historialRepo = manager.getRepository(SolicitudHistorial);
      const solicitud = await solicitudRepo.findOne({ where: { id } });

      if (!solicitud) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      if (user.role === 'asesor' && solicitud.asesor !== user.username) {
        throw new ForbiddenException('No tienes permiso para modificar esta solicitud');
      }

      if (!this.isValidTransition(solicitud.estado, dto.estado)) {
        throw new BadRequestException('Transición de estado inválida');
      }

      const anterior = solicitud.estado;
      solicitud.estado = dto.estado;
      const saved = await solicitudRepo.save(solicitud);

      await historialRepo.save({
        solicitudId: saved.id,
        tipoEvento: TipoEventoSolicitud.ESTADO,
        valorAnterior: anterior,
        valorNuevo: dto.estado,
        usuarioActor: user.username,
      });

      return saved;
    });
  }

  async asignarSolicitud(id: number, dto: AsignarSolicitudDto, user: AppUser) {
    if (user.role !== 'admin' && user.role !== 'supervisor') {
      throw new ForbiddenException('Solo admin y supervisor pueden asignar solicitudes');
    }

    const asesor = USERS.find((item) => item.username === dto.asesorId);
    if (!asesor) {
      throw new NotFoundException('Asesor no encontrado');
    }
    if (asesor.role !== 'asesor') {
      throw new BadRequestException('El usuario asignado debe tener rol asesor');
    }

    return this.dataSource.transaction(async (manager) => {
      const solicitudRepo = manager.getRepository(Solicitude);
      const historialRepo = manager.getRepository(SolicitudHistorial);
      const solicitud = await solicitudRepo.findOne({ where: { id } });

      if (!solicitud) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      if (solicitud.estado === SolicitudeEstado.RESUELTA) {
        throw new ConflictException('Una solicitud resuelta no puede reasignarse');
      }

      const anterior = solicitud.asesor;
      solicitud.asesor = dto.asesorId;
      const saved = await solicitudRepo.save(solicitud);

      await historialRepo.save({
        solicitudId: saved.id,
        tipoEvento: TipoEventoSolicitud.ASIGNACION,
        valorAnterior: anterior,
        valorNuevo: dto.asesorId,
        usuarioActor: user.username,
      });

      return saved;
    });
  }

}

