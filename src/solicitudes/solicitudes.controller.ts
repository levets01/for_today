import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service.js';
import { CreateSolicitudeDto } from './dto/create-solicitude.dto.js';
import { ChangeEstadoDto } from './dto/change-estado.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AppUser } from '../common/guards/auth.guard.js';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('solicitudes')
@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  @ApiBody({
    type: CreateSolicitudeDto,
    description: 'Registro de una solicitud comercial',
    examples: {
      ejemplo: {
        summary: 'Solicitud válida',
        value: {
          cliente: 'Empresa ABC',
          descripcion: 'Solicitud de seguimiento comercial',
        },
      },
    },
  })
  @ApiResponse({ status: 201 })
  create(@Body() createSolicitudeDto: CreateSolicitudeDto, @CurrentUser() user: AppUser) {
    return this.solicitudesService.create(createSolicitudeDto, user);
  }

  @Get()
  @ApiResponse({ status: 200 })
  findAll(@CurrentUser() user: AppUser) {
    return this.solicitudesService.findAll(user);
  }

  @Get(':id')
  @ApiResponse({ status: 200 })
  findOne(@Param('id') id: string, @CurrentUser() user: AppUser) {
    return this.solicitudesService.findOne(+id, user);
  }

  @Patch(':id/estado')
  @ApiBody({ type: ChangeEstadoDto, description: 'Cambio de estado permitido' })
  @ApiResponse({ status: 200 })
  changeEstado(@Param('id') id: string, @Body() dto: ChangeEstadoDto, @CurrentUser() user: AppUser) {
    return this.solicitudesService.changeEstado(+id, dto, user);
  }
}
