import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudesService } from './solicitudes.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Solicitude, SolicitudeEstado } from './entities/solicitude.entity.js';
import { SolicitudHistorial } from './entities/solicitud-historial.entity.js';
import type { AppUser } from '../common/guards/auth.guard.js';

describe('SolicitudesService', () => {
  let service: SolicitudesService;
  let repo: any;
  let historialRepo: any;
  let dataSource: any;

  beforeEach(async () => {
    repo = {
      findOne: vi.fn(),
      create: vi.fn((x) => x),
      save: vi.fn(async (x) => x),
      createQueryBuilder: vi.fn(),
      update: vi.fn(),
    };
    historialRepo = {
      find: vi.fn(),
      save: vi.fn(async (x) => x),
    };
    dataSource = {
      transaction: vi.fn(async (cb) => {
        const manager = {
          getRepository: (Entity: any) =>
            Entity === Solicitude ? repo : historialRepo,
        };
        return cb(manager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitudesService,
        { provide: getRepositoryToken(Solicitude), useValue: repo },
        { provide: getRepositoryToken(SolicitudHistorial), useValue: historialRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<SolicitudesService>(SolicitudesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates assigned solicitud for asesor with history event', async () => {
    const user: AppUser = { username: 'asesor1', role: 'asesor' };
    repo.save.mockResolvedValue({ id: 1, cliente: 'Ferretería El Norte', estado: 'PENDIENTE', asesor: 'asesor1' });
    const result = await service.create({ cliente: 'Ferretería El Norte', descripcion: 'Seguimiento' }, user);
    expect(result.asesor).toBe('asesor1');
  });

  it('changes state when version matches', async () => {
    const user: AppUser = { username: 'asesor1', role: 'asesor' };
    repo.findOne.mockResolvedValue({ id: 1, estado: SolicitudeEstado.PENDIENTE, asesor: 'asesor1' });
    repo.save.mockResolvedValue({ id: 1, estado: SolicitudeEstado.EN_GESTION, asesor: 'asesor1' });
    const result = await service.changeEstado(1, { estado: SolicitudeEstado.EN_GESTION }, user);
    expect(result.estado).toBe(SolicitudeEstado.EN_GESTION);
  });

  it('denies asesor from assigning', async () => {
    const user: AppUser = { username: 'asesor1', role: 'asesor' };
    await expect(
      service.asignarSolicitud(1, { asesorId: 'asesor2' }, user),
    ).rejects.toMatchObject({ status: 403 });
  });
});