import { CreateRoleUseCase } from './create-role.usecase';
import type { RoleRepositoryPort } from '../../domain/ports/role.repository.port';
import type { AuthorizationPort } from '../../../identity/domain/ports/authorization.port';
import { Role } from '../../domain/entities/role.entity';
import { ForbiddenException } from '@nestjs/common';

describe('CreateRoleUseCase', () => {
  function makeRepoMock(overrides: Partial<RoleRepositoryPort> = {}): RoleRepositoryPort {
    return {
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
      attachPermission: jest.fn(),
      listForUser: jest.fn(),
      getPermissionsForUser: jest.fn(),
      ...overrides,
    } as unknown as RoleRepositoryPort;
  }

  function makeAuthzMock(overrides: Partial<AuthorizationPort> = {}): AuthorizationPort {
    return {
      getRolesForUser: jest.fn(),
      hasRole: jest.fn(),
      hasPermission: jest.fn(),
      requiresRole: jest.fn(),
      requiresPermission: jest.fn(),
      ...overrides,
    } as unknown as AuthorizationPort;
  }

  it('creates a role when user is admin and name is unique', async () => {
    const repo = makeRepoMock({
      findByName: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation(async (name: string, description?: string | null) => new Role('r1', name, description ?? null)),
    });
    const authz = makeAuthzMock({
      hasRole: jest.fn().mockResolvedValue(true),
      hasPermission: jest.fn().mockResolvedValue(false),
    });

    const usecase = new CreateRoleUseCase(repo, authz);
    const result = await usecase.execute({
      name: 'docente',
      description: 'Teacher role',
      userId: 'admin-user-id'
    });

    expect(authz.hasRole).toHaveBeenCalledWith('admin-user-id', 'admin');
    expect(repo.findByName).toHaveBeenCalledWith('docente');
    expect(repo.create).toHaveBeenCalledWith('docente', 'Teacher role');
    expect(result).toEqual(new Role('r1', 'docente', 'Teacher role'));
  });

  it('creates a role when user has manage permissions on roles', async () => {
    const repo = makeRepoMock({
      findByName: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation(async (name: string, description?: string | null) => new Role('r1', name, description ?? null)),
    });
    const authz = makeAuthzMock({
      hasRole: jest.fn().mockResolvedValue(false),
      hasPermission: jest.fn().mockResolvedValue(true),
    });

    const usecase = new CreateRoleUseCase(repo, authz);
    const result = await usecase.execute({
      name: 'docente',
      description: 'Teacher role',
      userId: 'authorized-user-id'
    });

    expect(authz.hasRole).toHaveBeenCalledWith('authorized-user-id', 'admin');
    expect(authz.hasPermission).toHaveBeenCalledWith('authorized-user-id', 'manage', 'roles');
    expect(result).toEqual(new Role('r1', 'docente', 'Teacher role'));
  });

  it('throws ForbiddenException when user lacks authorization', async () => {
    const repo = makeRepoMock();
    const authz = makeAuthzMock({
      hasRole: jest.fn().mockResolvedValue(false),
      hasPermission: jest.fn().mockResolvedValue(false),
      requiresRole: jest.fn().mockRejectedValue(new ForbiddenException("Acceso denegado: Se requiere el rol 'admin'")),
    });

    const usecase = new CreateRoleUseCase(repo, authz);

    await expect(usecase.execute({
      name: 'docente',
      userId: 'unauthorized-user-id'
    })).rejects.toThrow(ForbiddenException);

    expect(authz.hasRole).toHaveBeenCalledWith('unauthorized-user-id', 'admin');
    expect(authz.hasPermission).toHaveBeenCalledWith('unauthorized-user-id', 'manage', 'roles');
    expect(authz.requiresRole).toHaveBeenCalledWith('unauthorized-user-id', 'admin');
  });

  it('throws if role name already exists even with authorization', async () => {
    const existing = new Role('r0', 'docente', 'existing');
    const repo = makeRepoMock({
      findByName: jest.fn().mockResolvedValue(existing),
    });
    const authz = makeAuthzMock({
      hasRole: jest.fn().mockResolvedValue(true),
    });

    const usecase = new CreateRoleUseCase(repo, authz);

    await expect(usecase.execute({
      name: 'docente',
      userId: 'admin-user-id'
    })).rejects.toThrow('Role name already exists');

    expect(authz.hasRole).toHaveBeenCalledWith('admin-user-id', 'admin');
    expect(repo.findByName).toHaveBeenCalledWith('docente');
  });
});

