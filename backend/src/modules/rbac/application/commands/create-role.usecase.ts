import {
  Inject,
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ROLE_REPO } from '../../tokens';
import type { RoleRepositoryPort } from '../../domain/ports/role.repository.port';
import { Role } from '../../domain/entities/role.entity';
import type { AuditRepositoryPort } from '../../domain/ports/audit.repository.port';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(ROLE_REPO) private readonly roleRepo: RoleRepositoryPort,
    @Inject('AuditRepositoryPort')
    private readonly auditRepo: AuditRepositoryPort,
  ) {}

  async execute(input: {
    name: string;
    description?: string | null;
    permissionIds?: string[];
    actorId: string;
  }): Promise<Role> {
    if (await this.roleRepo.findByName(input.name)) {
      throw new BadRequestException('Role name already exists');
    }

    try {
      let newRole: Role;

      if (input.permissionIds && input.permissionIds.length > 0) {
        newRole = await this.roleRepo.createWithPermissions(
          input.name,
          input.description ?? null,
          input.permissionIds,
        );
      } else {
        newRole = await this.roleRepo.create(
          input.name,
          input.description ?? null,
        );
      }

      await this.auditRepo.logAuditEntry({
        actorId: input.actorId,
        timestamp: new Date(),
        action: 'CREATE_ROLE',
        roleId: newRole.id,
        after: {
          id: newRole.id,
          name: newRole.name,
          description: newRole.description,
        },
        reason: 'Role created via CreateRoleUseCase',
      });

      return newRole;
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Error creating role',
      );
    }
  }
}
