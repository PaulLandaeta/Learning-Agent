import { GetRolesForUserUseCase } from './get-roles-for-user.usecase';
import type { RoleRepositoryPort } from '../../domain/ports/role.repository.port';
import { Role } from '../../domain/entities/role.entity';

describe('GetRolesForUserUseCase', () => {
  it('returns roles for given user', () => {
    const roles = [new Role('r1', 'Student', null)];
    const repo = {
      listForUser: jest.fn().mockResolvedValue(roles),
    } as unknown as RoleRepositoryPort;

    const useCase = new GetRolesForUserUseCase(repo);
    return expect(useCase.execute({ userId: 'u1' })).resolves.toBe(roles);
  });
});

