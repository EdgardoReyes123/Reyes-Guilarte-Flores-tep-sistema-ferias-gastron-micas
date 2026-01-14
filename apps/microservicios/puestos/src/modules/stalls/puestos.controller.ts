// microservicios/puestos/src/puestos/puestos.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { puestosService } from './puestos.service';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { Logger } from '@nestjs/common';

@Controller()
export class puestosController {
  private readonly logger = new Logger(puestosController.name);

  constructor(private readonly puestosService: puestosService) {}

  @MessagePattern({ cmd: 'puestos.create' })
  async create(@Payload() data: any) {
    try {
      this.logger.log(`Creando puesto para owner: ${data.ownerId}`);

      const { ownerId, userRole, ...puestoData } = data;
      const createPuestoDto = puestoData as CreatePuestoDto;

      const puesto = await this.puestosService.create(createPuestoDto, ownerId);

      this.logger.log(`✅ Puesto creado exitosamente: ${puesto.id}`);
      return {
        success: true,
        data: puesto,
        message: 'Puesto creado exitosamente',
      };
    } catch (error) {
      this.logger.error(
        `❌ Error creando puesto: ${error.message}`,
        error.stack,
      );
      throw new RpcException({
        message: error.message || 'Error creando puesto',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'puestos.findAll' })
  async findAll(@Payload() filters: any) {
    try {
      this.logger.log(
        `Buscando puestos con filtros: ${JSON.stringify(filters)}`,
      );

      // Mapear filtros antiguos a nuevos nombres si es necesario
      const mappedFilters = this.mapFilters(filters);

      const puestos = await this.puestosService.findAll(mappedFilters);

      this.logger.log(`✅ Encontrados ${puestos.length} puestos`);
      return {
        success: true,
        data: puestos,
        count: puestos.length,
      };
    } catch (error) {
      this.logger.error(`❌ Error buscando puestos: ${error.message}`);
      throw new RpcException({
        message: error.message || 'Error obteniendo puestos',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'puestos.findByOwner' })
  async findByOwner(@Payload() data: any) {
    try {
      const { ownerId } = data;
      this.logger.log(`Buscando puestos del owner: ${ownerId}`);

      const puestos = await this.puestosService.findByOwner(ownerId);

      this.logger.log(
        `✅ Encontrados ${puestos.length} puestos para owner ${ownerId}`,
      );
      return {
        success: true,
        data: puestos,
        count: puestos.length,
      };
    } catch (error) {
      this.logger.error(
        `❌ Error buscando puestos del owner: ${error.message}`,
      );
      throw new RpcException({
        message: error.message || 'Error obteniendo puestos del owner',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'puestos.findOne' })
  async findOne(@Payload() data: any) {
    try {
      const { id, userId, userRole } = data;
      this.logger.log(`Buscando puesto ID: ${id}`);

      const puesto = await this.puestosService.findOne(id);

      // Si el usuario no es organizador, validar que sea el dueño
      if (userRole !== 'organizador' && puesto.ownerId !== userId) {
        throw new RpcException({
          message: 'No tienes permisos para ver este puesto',
          statusCode: 403,
        });
      }

      this.logger.log(`✅ Puesto encontrado: ${puesto.id}`);
      return {
        success: true,
        data: puesto,
      };
    } catch (error) {
      this.logger.error(`❌ Error buscando puesto: ${error.message}`);
      throw new RpcException({
        message: error.message || 'Error obteniendo puesto',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'puestos.update' })
  async update(@Payload() data: any) {
    try {
      const { id, ownerId, userRole, ...updateData } = data;
      this.logger.log(`Actualizando puesto ID: ${id} por owner: ${ownerId}`);

      const puesto = await this.puestosService.update(
        id,
        updateData as UpdatePuestoDto,
        ownerId,
        userRole,
      );

      this.logger.log(`✅ Puesto actualizado: ${puesto.id}`);
      return {
        success: true,
        data: puesto,
        message: 'Puesto actualizado exitosamente',
      };
    } catch (error) {
      this.logger.error(
        `❌ Error actualizando puesto: ${error.message}`,
        error.stack,
      );
      throw new RpcException({
        message: error.message || 'Error actualizando puesto',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'puestos.delete' })
  async remove(@Payload() data: any) {
    try {
      const { id, ownerId } = data;
      this.logger.log(`Eliminando puesto ID: ${id} por owner: ${ownerId}`);

      await this.puestosService.remove(id, ownerId);

      this.logger.log(`✅ Puesto eliminado: ${id}`);
      return {
        success: true,
        message: 'Puesto eliminado exitosamente',
      };
    } catch (error) {
      this.logger.error(`❌ Error eliminando puesto: ${error.message}`);
      throw new RpcException({
        message: error.message || 'Error eliminando puesto',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'puestos.aprobar' })
  async aprobar(@Payload() data: any) {
    try {
      const { id } = data;
      this.logger.log(`Aprobando puesto ID: ${id}`);

      const puesto = await this.puestosService.aprobarPuesto(id);

      this.logger.log(`✅ Puesto aprobado: ${puesto.id}`);
      return {
        success: true,
        data: puesto,
        message: 'Puesto aprobado exitosamente',
      };
    } catch (error) {
      this.logger.error(`❌ Error aprobando puesto: ${error.message}`);
      throw new RpcException({
        message: error.message || 'Error aprobando puesto',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'puestos.activar' })
  async activar(@Payload() data: any) {
    try {
      const { id } = data;
      this.logger.log(`Activando puesto ID: ${id}`);

      const puesto = await this.puestosService.activarPuesto(id);

      this.logger.log(`✅ Puesto activado: ${puesto.id}`);
      return {
        success: true,
        data: puesto,
        message: 'Puesto activado exitosamente',
      };
    } catch (error) {
      this.logger.error(`❌ Error activando puesto: ${error.message}`);
      throw new RpcException({
        message: error.message || 'Error activando puesto',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'puestos.findActivos' })
  async findActivos() {
    try {
      this.logger.log('Buscando puestos activos para catálogo');

      const puestos = await this.puestosService.findActivePuestos();

      this.logger.log(`✅ Encontrados ${puestos.length} puestos activos`);
      return {
        success: true,
        data: puestos,
        count: puestos.length,
      };
    } catch (error) {
      this.logger.error(`❌ Error buscando puestos activos: ${error.message}`);
      throw new RpcException({
        message: error.message || 'Error obteniendo puestos activos',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'puestos.validateActivo' })
  async validateActivo(@Payload() data: any) {
    try {
      const { puestoId } = data;
      this.logger.log(`Validando si puesto está activo: ${puestoId}`);

      const esActivo = await this.puestosService.validatePuestoActivo(puestoId);

      this.logger.log(
        `✅ Validación completada para puesto: ${puestoId} - Activo: ${esActivo}`,
      );
      return {
        success: true,
        esActivo,
      };
    } catch (error) {
      this.logger.error(`❌ Error validando puesto activo: ${error.message}`);
      throw new RpcException({
        message: error.message || 'Error validando puesto',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'puestos.validatePropietario' })
  async validatePropietario(@Payload() data: any) {
    try {
      const { puestoId, emprendedorId } = data;
      this.logger.log(
        `Validando propietario ${emprendedorId} para puesto: ${puestoId}`,
      );

      // Nota: El servicio todavía usa 'validatePropietario' con emprendedorId
      // pero internamente compara con ownerId
      const esPropietario = await this.puestosService.validatePropietario(
        puestoId,
        emprendedorId,
      );

      this.logger.log(
        `✅ Validación de propietario completada: ${esPropietario}`,
      );
      return {
        success: true,
        esPropietario,
      };
    } catch (error) {
      this.logger.error(`❌ Error validando propietario: ${error.message}`);
      throw new RpcException({
        message: error.message || 'Error validando propietario',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'puestos.getInfo' })
  async getInfo(@Payload() data: any) {
    try {
      const { puestoId } = data;
      this.logger.log(`Obteniendo información del puesto: ${puestoId}`);

      const info = await this.puestosService.getPuestoInfo(puestoId);

      this.logger.log(`✅ Información obtenida para puesto: ${puestoId}`);
      return {
        success: true,
        info,
      };
    } catch (error) {
      this.logger.error(
        `❌ Error obteniendo información del puesto: ${error.message}`,
      );
      throw new RpcException({
        message: error.message || 'Error obteniendo información del puesto',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'puestos.health' })
  async healthCheck() {
    try {
      const count = await this.puestosService.countPuestos();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        puestosCount: count,
      };
    } catch (error) {
      throw new RpcException({
        message: 'Service unhealthy',
        statusCode: 503,
      });
    }
  }

  // Método auxiliar para mapear filtros antiguos a nuevos nombres
  private mapFilters(filters: any): any {
    if (!filters) return {};

    const mapped: any = {};

    // Mapear 'estado' a 'status' si existe
    if (filters.estado !== undefined) {
      mapped.status = filters.estado;
    }

    // Mapear 'emprendedorId' a 'ownerId' si existe
    if (filters.emprendedorId !== undefined) {
      mapped.ownerId = filters.emprendedorId;
    }

    // Mantener otros filtros
    if (filters.search !== undefined) mapped.search = filters.search;
    if (filters.onlyActive !== undefined)
      mapped.onlyActive = filters.onlyActive;
    if (filters.fromDate !== undefined) mapped.fromDate = filters.fromDate;
    if (filters.toDate !== undefined) mapped.toDate = filters.toDate;

    return mapped;
  }
}
