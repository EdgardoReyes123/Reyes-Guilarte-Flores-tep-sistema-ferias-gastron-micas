import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Puesto } from '../../entities/puesto.entity';
import { Repository } from 'typeorm';
import { PuestoStatus } from '../../interfaces/puesto.interface';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';

@Injectable()
export class puestosService {
  private readonly logger = new Logger(puestosService.name);

  constructor(
    @InjectRepository(Puesto)
    private puestosRepository: Repository<Puesto>,
  ) {}

  async create(
    createPuestoDto: CreatePuestoDto,
    ownerId: string,
  ): Promise<Puesto> {
    this.logger.log(`Creando puesto para owner: ${ownerId}`);

    const puesto = this.puestosRepository.create({
      ...createPuestoDto,
      ownerId,
      status: PuestoStatus.PENDIENTE,
    });

    const saved = await this.puestosRepository.save(puesto);
    this.logger.log(`Puesto creado con ID: ${saved.id}`);
    return saved;
  }

  async findAll(filters?: any): Promise<Puesto[]> {
    const query = this.puestosRepository.createQueryBuilder('puesto');

    if (filters?.status) {
      query.andWhere('puesto.status = :status', { status: filters.status });
    }

    if (filters?.ownerId) {
      query.andWhere('puesto.owner_id = :ownerId', {
        ownerId: filters.ownerId,
      });
    }

    if (filters?.search) {
      query.andWhere('puesto.name ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    if (filters?.onlyActive) {
      query.andWhere('puesto.status = :status', {
        status: PuestoStatus.ACTIVO,
      });
    }

    query.orderBy('puesto.created_at', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Puesto> {
    const puesto = await this.puestosRepository.findOne({ where: { id } });

    if (!puesto) {
      throw new NotFoundException(`Puesto con ID ${id} no encontrado`);
    }

    return puesto;
  }

  async findByOwner(ownerId: string): Promise<Puesto[]> {
    return await this.puestosRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updatePuestoDto: UpdatePuestoDto,
    ownerId: string,
    userRole?: string,
  ): Promise<Puesto> {
    const puesto = await this.findOne(id);

    // Validar propiedad (solo dueño puede editar)
    if (puesto.ownerId !== ownerId && userRole !== 'organizador') {
      throw new ForbiddenException('No eres el dueño de este puesto');
    }

    // Si es emprendedor, validar qué puede editar
    if (userRole === 'emprendedor') {
      this.validarEdicionEmprendedor(puesto, updatePuestoDto);
    }

    // Si es organizador, puede cambiar estado
    if (userRole === 'organizador') {
      this.validarEdicionOrganizador(puesto, updatePuestoDto);
    }

    // Campos que el emprendedor puede actualizar
    const camposPermitidos = ['name', 'description'];
    Object.keys(updatePuestoDto).forEach((key) => {
      if (camposPermitidos.includes(key)) {
        puesto[key] = updatePuestoDto[key];
      }
    });

    // Si organizador cambia status, aplicar directamente
    if (userRole === 'organizador' && updatePuestoDto.status) {
      puesto.status = updatePuestoDto.status;
    }

    const updated = await this.puestosRepository.save(puesto);
    this.logger.log(`Puesto ${id} actualizado`);

    return updated;
  }

  private validarEdicionEmprendedor(
    puesto: Puesto,
    updateDto: UpdatePuestoDto,
  ): void {
    // Emprendedor NO puede cambiar status
    if (updateDto.status !== undefined && updateDto.status !== puesto.status) {
      throw new ForbiddenException('No puedes cambiar el status del puesto');
    }

    // Solo puede editar si está pendiente o aprobado
    if (!puesto.puedeSerEditadoPorEmprendedor()) {
      throw new ForbiddenException(
        'No puedes editar un puesto activo o inactivo',
      );
    }
  }

  private validarEdicionOrganizador(
    puesto: Puesto,
    updateDto: UpdatePuestoDto,
  ): void {
    // Validaciones de transiciones de status
    if (
      updateDto.status === PuestoStatus.APROBADO &&
      !puesto.puedeSerAprobado()
    ) {
      throw new BadRequestException(
        'Solo puestos pendientes pueden ser aprobados',
      );
    }

    if (
      updateDto.status === PuestoStatus.ACTIVO &&
      !puesto.puedeSerActivado()
    ) {
      throw new BadRequestException(
        'Solo puestos aprobados pueden ser activados',
      );
    }
  }

  async aprobarPuesto(id: string): Promise<Puesto> {
    const puesto = await this.findOne(id);

    if (!puesto.puedeSerAprobado()) {
      throw new BadRequestException(
        'Solo puestos pendientes pueden ser aprobados',
      );
    }

    puesto.status = PuestoStatus.APROBADO;

    const approved = await this.puestosRepository.save(puesto);
    this.logger.log(`Puesto ${id} aprobado`);

    return approved;
  }

  async activarPuesto(id: string): Promise<Puesto> {
    const puesto = await this.findOne(id);

    if (!puesto.puedeSerActivado()) {
      throw new BadRequestException(
        'Solo puestos aprobados pueden ser activados',
      );
    }

    puesto.status = PuestoStatus.ACTIVO;

    const activated = await this.puestosRepository.save(puesto);
    this.logger.log(`Puesto ${id} activado`);

    return activated;
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const puesto = await this.findOne(id);

    // Solo el dueño puede eliminar
    if (puesto.ownerId !== ownerId) {
      throw new ForbiddenException('No eres el dueño de este puesto');
    }

    // Solo se pueden eliminar puestos pendientes
    if (puesto.status !== PuestoStatus.PENDIENTE) {
      throw new ForbiddenException(
        'Solo puestos pendientes pueden ser eliminados',
      );
    }

    await this.puestosRepository.remove(puesto);
    this.logger.log(`Puesto ${id} eliminado por owner: ${ownerId}`);
  }

  async findActivePuestos(): Promise<Puesto[]> {
    return await this.puestosRepository.find({
      where: {
        status: PuestoStatus.ACTIVO,
      },
      order: { name: 'ASC' },
    });
  }

  // Métodos para comunicación entre microservicios
  async validatePuestoActivo(puestoId: string): Promise<boolean> {
    try {
      const puesto = await this.findOne(puestoId);
      return puesto.esActivo();
    } catch (error) {
      this.logger.warn(
        `Validación de puesto activo falló para ID: ${puestoId}`,
      );
      return false;
    }
  }

  async validatePropietario(
    puestoId: string,
    emprendedorId: string,
  ): Promise<boolean> {
    try {
      const puesto = await this.findOne(puestoId);
      return puesto.ownerId === emprendedorId;
    } catch (error) {
      this.logger.warn(
        `Validación de propietario falló para puesto: ${puestoId}`,
      );
      return false;
    }
  }

  async getPuestoInfo(puestoId: string): Promise<{
    id: string;
    name: string;
    status: PuestoStatus;
    isActive: boolean;
    ownerId: string;
  } | null> {
    try {
      const puesto = await this.findOne(puestoId);
      return {
        id: puesto.id,
        name: puesto.name,
        status: puesto.status,
        isActive: puesto.esActivo(),
        ownerId: puesto.ownerId,
      };
    } catch (error) {
      return null;
    }
  }

  async countPuestos(): Promise<number> {
    return await this.puestosRepository.count();
  }
}
