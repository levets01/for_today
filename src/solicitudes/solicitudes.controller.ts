import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service.js';
import { CreateSolicitudeDto } from './dto/create-solicitude.dto.js';
import { ChangeEstadoDto } from './dto/change-estado.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AppUser } from '../common/guards/auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ApiTags, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { QuerySolicitudesDto } from './dto/query-solicitudes.dto.js';
import { AsignarSolicitudDto } from './dto/asignar-solicitud.dto.js';

@ApiTags('solicitudes')
@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  @ApiBody({
    type: CreateSolicitudeDto,
    description: 'Registro de una solicitud comercial',
  })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  create(@Body() createSolicitudeDto: CreateSolicitudeDto, @CurrentUser() user: AppUser) {
    return this.solicitudesService.create(createSolicitudeDto, user);
  }

  @Get()
  @ApiQuery({ name: 'estado', required: false, enum: ['PENDIENTE', 'EN_GESTION', 'RESUELTA'] })
  @ApiQuery({ name: 'asesor', required: false, type: String })
  @ApiQuery({ name: 'cliente', required: false, type: String })
  @ApiQuery({ name: 'desde', required: false, type: String })
  @ApiQuery({ name: 'hasta', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  findAll(@CurrentUser() user: AppUser, @Query() filters: QuerySolicitudesDto) {
    return this.solicitudesService.findAll(user, filters);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  findOne(@Param('id') id: string, @CurrentUser() user: AppUser) {
    return this.solicitudesService.findOne(+id, user);
  }

  @Get(':id/historial')
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  findHistorial(@Param('id') id: string, @CurrentUser() user: AppUser) {
    return this.solicitudesService.findHistorial(+id, user);
  }

  @Patch(':id/asignacion')
  @Roles('admin', 'supervisor')
  @ApiBody({ type: AsignarSolicitudDto, description: 'Asignación o reasignación de la solicitud a un asesor' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  asignarSolicitud(@Param('id') id: string, @Body() dto: AsignarSolicitudDto, @CurrentUser() user: AppUser) {
    return this.solicitudesService.asignarSolicitud(+id, dto, user);
  }

  @Patch(':id/estado')
  @ApiBody({ type: ChangeEstadoDto, description: 'Cambio de estado permitido con versión esperada' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  changeEstado(@Param('id') id: string, @Body() dto: ChangeEstadoDto, @CurrentUser() user: AppUser) {
    return this.solicitudesService.changeEstado(+id, dto, user);
  }
}