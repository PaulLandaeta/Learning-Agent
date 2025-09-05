import { AttachPermissionUseCase } from './attach-permission.usecase';
import type { RoleRepositoryPort } from '../../domain/ports/role.repository.port';
import type { PermissionRepositoryPort } from '../../domain/ports/permission.repository.port';
import { Role } from '../../domain/entities/role.entity';
import { Permission } from '../../domain/entities/permission.entity';

describe('AttachPermissionUseCase', () => {
  let roles: jest.Mocked<RoleRepositoryPort>;
  let perms: jest.Mocked<PermissionRepositoryPort>;
  let useCase: AttachPermissionUseCase;

  beforeEach(() => {
    roles = {
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
      attachPermission: jest.fn(),
      listForUser: jest.fn(),
    } as unknown as jest.Mocked<RoleRepositoryPort>;

    perms = {
      findById: jest.fn(),
      findByActionResource: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
    } as unknown as jest.Mocked<PermissionRepositoryPort>;

    useCase = new AttachPermissionUseCase(roles, perms);
  });

  it('throws if role not found', async () => {
    roles.findById.mockResolvedValue(null);
    perms.findById.mockResolvedValue(new Permission('p1', 'read', 'doc', null));

    await expect(
      useCase.execute({ roleId: 'r404', permissionId: 'p1' }),
    ).rejects.toThrow('Role not found');
    expect(roles.attachPermission).not.toHaveBeenCalled();
  });

  it('throws if permission not found', async () => {
    roles.findById.mockResolvedValue(new Role('r1', 'Admin', null));
    perms.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ roleId: 'r1', permissionId: 'p404' }),
    ).rejects.toThrow('Permission not found');
    expect(roles.attachPermission).not.toHaveBeenCalled();
  });

  it('attaches permission when both exist', async () => {
    roles.findById.mockResolvedValue(new Role('r1', 'Admin', null));
    perms.findById.mockResolvedValue(new Permission('p1', 'read', 'doc', null));
    roles.attachPermission.mockResolvedValue();

    const result = await useCase.execute({ roleId: 'r1', permissionId: 'p1' });

    expect(roles.attachPermission).toHaveBeenCalledWith('r1', 'p1');
    expect(result).toEqual({ ok: true });
  });
});

