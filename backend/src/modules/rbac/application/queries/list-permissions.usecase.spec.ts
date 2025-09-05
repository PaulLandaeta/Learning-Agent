import { ListPermissionsUseCase } from './list-permissions.usecase';
import type { PermissionRepositoryPort } from '../../domain/ports/permission.repository.port';
import { Permission } from '../../domain/entities/permission.entity';

describe('ListPermissionsUseCase', () => {
  it('returns permissions from repository', () => {
    const perms = [
      { id: 'p1', action: 'read', resource: 'doc', description: null } as Permission,
    ];
    const repo = {
      list: jest.fn().mockResolvedValue(perms),
    } as unknown as PermissionRepositoryPort;

    const useCase = new ListPermissionsUseCase(repo);
    return expect(useCase.execute()).resolves.toBe(perms);
  });
});

