import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudesController } from './solicitudes.controller.js';
import { SolicitudesService } from './solicitudes.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Solicitude } from './entities/solicitude.entity.js';

describe('SolicitudesController', () => {
  let controller: SolicitudesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudesController],
      providers: [
        SolicitudesService,
        { provide: getRepositoryToken(Solicitude), useValue: {} },
      ],
    }).compile();

    controller = module.get<SolicitudesController>(SolicitudesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
