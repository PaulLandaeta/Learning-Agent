// path: rbac/infrastructure/persistence/role.prisma.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RoleRepositoryPort } from '../../domain/ports/role.repository.port';
import { Role } from '../../domain/entities/role.entity';

@Injectable()
export class RolePrismaRepository implements RoleRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      where: { users: { some: { userId: userId } } },
    });
    return roles.map((r) => new Role(r.id, r.name, r.description));
  }

  async findById(id: string) {
    const r = await this.prisma.role.findUnique({ where: { id } });
    return r ? new Role(r.id, r.name, r.description) : null;
  }

  async findByName(name: string) {
    const r = await this.prisma.role.findUnique({ where: { name } });
    return r ? new Role(r.id, r.name, r.description) : null;
  }

  async create(name: string, description?: string | null) {
    const r = await this.prisma.role.create({ data: { name, description } });
    return new Role(r.id, r.name, r.description);
  }

  async list() {
    const rows = await this.prisma.role.findMany({ orderBy: { name: 'asc' } });
    return rows.map((r) => new Role(r.id, r.name, r.description));
  }

  /**
   * Create role and attach multiple permissions atomically.
   * Uses prisma.$transaction with callback form so all queries share same tx client.
   * If any operation throws, Prisma will rollback automatically.
   */
  async createWithPermissions(
    name: string,
    description: string | null,
    permissionIds: string[],
  ) {
    try {
      const role = await this.prisma.$transaction(async (tx) => {
        const createdRole = await tx.role.create({
          data: { name, description },
        });

        
        if (permissionIds && permissionIds.length > 0) {
         
          const foundPermissions = await tx.permission.findMany({
            where: { id: { in: permissionIds } },
            select: { id: true },
          });

          const foundIds = foundPermissions.map((p) => p.id);
          const missing = permissionIds.filter((id) => !foundIds.includes(id));
          if (missing.length > 0) {
            throw new Error(`Permissions not found: ${missing.join(', ')}`);
          }

          const items = permissionIds.map((pid) => ({
            roleId: createdRole.id,
            permissionId: pid,
          }));

         
          await tx.rolePermission.createMany({
            data: items,
            skipDuplicates: true,
          });
        }

        
        return createdRole;
      });

      return new Role(role.id, role.name, role.description);
    } catch (err) {
      
      throw new Error(
        `createWithPermissions failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  /**
   * Attach a single permission to a role with validation inside a transaction.
   * Even if it's a single write, we check consistency (role+permission exist) and upsert inside tx.
   */
  async attachPermission(roleId: string, permissionId: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        
        const role = await tx.role.findUnique({ where: { id: roleId }, select: { id: true } });
        if (!role) throw new Error(`Role ${roleId} not found`);

    
        const perm = await tx.permission.findUnique({
          where: { id: permissionId },
          select: { id: true },
        });
        if (!perm) throw new Error(`Permission ${permissionId} not found`);

       
        await tx.rolePermission.upsert({
          where: { roleId_permissionId: { roleId, permissionId } },
          create: { roleId, permissionId },
          update: {}, 
        });
      });
    } catch (err) {
      throw new Error(
        `attachPermission failed for role ${roleId} and permission ${permissionId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
