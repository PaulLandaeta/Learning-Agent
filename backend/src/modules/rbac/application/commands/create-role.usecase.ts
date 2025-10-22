import { Inject, Injectable } from '@nestjs/common';
import { ROLE_REPO } from '../../tokens';
import type { RoleRepositoryPort } from '../../domain/ports/role.repository.port';
import { Role } from '../../domain/entities/role.entity';
import type { AuditRepositoryPort } from '../../domain/ports/audit.repository.port'; // 👈 usa import type

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
    actorId: string;
  }): Promise<Role> {
    if (await this.roleRepo.findByName(input.name)) {
      throw new Error('Role name already exists');
    }

    const newRole = await this.roleRepo.create(
      input.name,
      input.description ?? null,
    );

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
  }
}
