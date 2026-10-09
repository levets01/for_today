import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSolicitudeDto } from './dto/create-solicitude.dto.js';
import { UpdateSolicitudeDto } from './dto/update-solicitude.dto.js';
import { Solicitude, SolicitudeEstado } from './entities/solicitude.entity.js';
import { AppUser } from '../common/guards/auth.guard.js';
import { ChangeEstadoDto } from './dto/change-estado.dto.js';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Solicitude)
    private readonly repo: Repository<Solicitude>,
  ) {}

  async create(createDto: CreateSolicitudeDto, user: AppUser) {
    const s = this.repo.create({
      cliente: createDto.cliente,
      descripcion: createDto.descripcion,
      estado: SolicitudeEstado.PENDIENTE,
      asesor: user.role === 'asesor' ? user.username : null,
    });
    return this.repo.save(s);
  }

  async findAll(user: AppUser) {
    if (user.role === 'admin' || user.role === 'supervisor') {
      return this.repo.find();
    }
    // asesor
    return this.repo.find({ where: { asesor: user.username } });
  }

  async findOne(id: number, user: AppUser) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Solicitude not found');
    if (user.role === 'asesor' && s.asesor !== user.username) {
      throw new ForbiddenException('access denied');
    }
    return s;
  }

  async changeEstado(id: number, dto: ChangeEstadoDto, user: AppUser) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Solicitude not found');

    // permission: if asesor, must be assigned to them
    if (user.role === 'asesor' && s.asesor !== user.username) {
      throw new ForbiddenException('cannot modify others solicitudes');
    }

    // validate state transitions
    const from = s.estado;
    const to = dto.estado;
    const valid = (from === SolicitudeEstado.PENDIENTE && to === SolicitudeEstado.EN_GESTION) ||
                  (from === SolicitudeEstado.EN_GESTION && to === SolicitudeEstado.RESUELTA);
    if (!valid) throw new ForbiddenException('invalid state transition');

    s.estado = to;
    if (user.role === 'asesor') s.asesor = user.username;
    return this.repo.save(s);
  }

  // keep compatibility methods
  async update(id: number, updateDto: UpdateSolicitudeDto) {
    throw new Error('update not implemented');
  }

  async remove(id: number) {
    throw new Error('remove not implemented');
  }
}

