import { ListRolesUseCase } from './list-roles.usecase';
import type { RoleRepositoryPort } from '../../domain/ports/role.repository.port';
import { Role } from '../../domain/entities/role.entity';

describe('ListRolesUseCase', () => {
  it('returns roles from repository', () => {
    const roles = [{ id: 'r1', name: 'Admin', description: null } as Role];
    const repo = {
      list: jest.fn().mockResolvedValue(roles),
    } as unknown as RoleRepositoryPort;

    const useCase = new ListRolesUseCase(repo);
    return expect(useCase.execute()).resolves.toBe(roles);
  });
});

