import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RoleRepositoryPort } from '../../domain/ports/role.repository.port';
import { Role } from '../../domain/entities/role.entity';
import {
  RoleNotFoundError,
  PermissionNotFoundError,
  RoleTransactionError,
} from '../../domain/errors/role.errors';
import { RoleMapper } from '../../domain/mappers';

@Injectable()
export class RolePrismaRepository implements RoleRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      where: { users: { some: { userId } } },
    });
    return RoleMapper.toDomainList(roles);
  }

  async findById(id: string) {
    const r = await this.prisma.role.findUnique({ where: { id } });
    return r ? RoleMapper.toDomain(r) : null;
  }

  async findByName(name: string) {
    const r = await this.prisma.role.findUnique({ where: { name } });
    return r ? RoleMapper.toDomain(r) : null;
  }

  async create(name: string, description?: string | null) {
    try {
      const createData = RoleMapper.toPersistenceCreate({ name, description });
      const r = await this.prisma.role.create({ data: createData });
      return RoleMapper.toDomain(r);
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new RoleTransactionError(`El rol "${name}" ya existe.`);
      }
      throw new RoleTransactionError(err.message);
    }
  }

  async list() {
    const rows = await this.prisma.role.findMany({ orderBy: { name: 'asc' } });
    return RoleMapper.toDomainList(rows);
  }

  /**
   * Crea un rol y asocia múltiples permisos de forma atómica.
   * Utiliza prisma.$transaction con la forma de callback para que todas las consultas compartan el mismo cliente de transacción.
   * Si alguna operación falla, Prisma realizará automáticamente el rollback.
   */
  async createWithPermissions(
    name: string,
    description: string | null,
    permissionIds: string[],
  ) {
    try {
      const role = await this.prisma.$transaction(async (tx) => {
        const createData = RoleMapper.toPersistenceCreate({ name, description });
        const createdRole = await tx.role.create({
          data: createData,
        });

        if (permissionIds?.length > 0) {
          const foundPermissions = await tx.permission.findMany({
            where: { id: { in: permissionIds } },
            select: { id: true },
          });

          const foundIds = foundPermissions.map((p) => p.id);
          const missing = permissionIds.filter((id) => !foundIds.includes(id));

          if (missing.length > 0) {
            throw new PermissionNotFoundError(missing);
          }

          await tx.rolePermission.createMany({
            data: permissionIds.map((pid) => ({
              roleId: createdRole.id,
              permissionId: pid,
            })),
            skipDuplicates: true,
          });
        }

        return createdRole;
      });

      return RoleMapper.toDomain(role);
    } catch (err: any) {
      if (err instanceof PermissionNotFoundError) throw err;
      throw new RoleTransactionError(err.message);
    }
  }

  /**
   * Asocia un solo permiso a un rol con validación dentro de una transacción.
   * Aunque sea una sola escritura, se verifica la consistencia (que el rol y el permiso existan) 
   * y se realiza un upsert dentro de la transacción.
   */
  async attachPermission(roleId: string, permissionId: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        const role = await tx.role.findUnique({ where: { id: roleId } });
        if (!role) throw new RoleNotFoundError(roleId);

        const perm = await tx.permission.findUnique({ where: { id: permissionId } });
        if (!perm) throw new PermissionNotFoundError([permissionId]);

        await tx.rolePermission.upsert({
          where: { roleId_permissionId: { roleId, permissionId } },
          create: { roleId, permissionId },
          update: {},
        });
      });
    } catch (err: any) {
      if (err instanceof RoleNotFoundError || err instanceof PermissionNotFoundError)
        throw err;
      throw new RoleTransactionError(
        `Fallo al asociar permiso: ${err.message}`,
      );
    }
  }
}
