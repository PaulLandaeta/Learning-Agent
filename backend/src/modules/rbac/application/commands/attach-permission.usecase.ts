import { Inject, Injectable } from '@nestjs/common';
import { ROLE_REPO, PERM_REPO, AUTHZ_PORT } from '../../tokens';
import type { RoleRepositoryPort } from '../../domain/ports/role.repository.port';
import type { PermissionRepositoryPort } from '../../domain/ports/permission.repository.port';
import type { AuthorizationPort } from '../../../identity/domain/ports/authorization.port';

@Injectable()
export class AttachPermissionUseCase {
  constructor(
    @Inject(ROLE_REPO) private readonly roleRepo: RoleRepositoryPort,
    @Inject(PERM_REPO) private readonly permRepo: PermissionRepositoryPort,
    @Inject(AUTHZ_PORT) private readonly authz: AuthorizationPort,
  ) { }

  async execute(input: {
    roleId: string;
    permissionId: string;
    userId: string;
  }) {
    const isAdmin = await this.authz.hasRole(input.userId, 'admin');
    const hasPermission = await this.authz.hasPermission(input.userId, 'manage', 'permissions');

    if (!isAdmin && !hasPermission) {
      await this.authz.requiresRole(input.userId, 'admin');
    }

    const [role, perm] = await Promise.all([
      this.roleRepo.findById(input.roleId),
      this.permRepo.findById(input.permissionId),
    ]);
    if (!role) throw new Error('Role not found');
    if (!perm) throw new Error('Permission not found');
    await this.roleRepo.attachPermission(input.roleId, input.permissionId);
    return { ok: true };
  }
}
