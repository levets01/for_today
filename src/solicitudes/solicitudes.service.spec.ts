import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudesService } from './solicitudes.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Solicitude } from './entities/solicitude.entity.js';

describe('SolicitudesService', () => {
  let service: SolicitudesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitudesService,
        { provide: getRepositoryToken(Solicitude), useValue: {} },
      ],
    }).compile();

    service = module.get<SolicitudesService>(SolicitudesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
