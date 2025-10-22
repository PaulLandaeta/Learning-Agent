import { CreateRoleUseCase } from './create-role.usecase';
import type { RoleRepositoryPort } from '../../domain/ports/role.repository.port';
import type { AuditRepositoryPort } from '../../domain/ports/audit.repository.port';
import { Role } from '../../domain/entities/role.entity';

describe('CreateRoleUseCase', () => {
  function makeRoleRepoMock(overrides: Partial<RoleRepositoryPort> = {}): RoleRepositoryPort {
    return {
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
      attachPermission: jest.fn(),
      listForUser: jest.fn(),
      ...overrides,
    } as unknown as RoleRepositoryPort;
  }

  function makeAuditRepoMock(overrides: Partial<AuditRepositoryPort> = {}): AuditRepositoryPort {
    return {
      logAuditEntry: jest.fn(),
      getAuditEntriesByRole: jest.fn(),
      ...overrides,
    } as unknown as AuditRepositoryPort;
  }

  it('creates a role and logs audit entry when name is unique', async () => {
    const roleRepo = makeRoleRepoMock({
      findByName: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation(
        async (name: string, description?: string | null) =>
          new Role('r1', name, description ?? null),
      ),
    });
    const auditRepo = makeAuditRepoMock();

    const usecase = new CreateRoleUseCase(roleRepo, auditRepo);
    const result = await usecase.execute({
      name: 'docente',
      description: 'Teacher role',
      actorId: 'user-123',
    });

    expect(roleRepo.findByName).toHaveBeenCalledWith('docente');
    expect(roleRepo.create).toHaveBeenCalledWith('docente', 'Teacher role');
    expect(result).toEqual(new Role('r1', 'docente', 'Teacher role'));

    // 👇 Verificación de auditoría
    expect(auditRepo.logAuditEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'user-123',
        action: 'CREATE_ROLE',
        roleId: 'r1',
      }),
    );
  });

  it('throws if role name already exists', async () => {
    const existing = new Role('r0', 'docente', 'existing');
    const roleRepo = makeRoleRepoMock({
      findByName: jest.fn().mockResolvedValue(existing),
    });
    const auditRepo = makeAuditRepoMock();

    const usecase = new CreateRoleUseCase(roleRepo, auditRepo);

    await expect(
      usecase.execute({ name: 'docente', actorId: 'user-123' }),
    ).rejects.toThrow('Role name already exists');

    expect(roleRepo.findByName).toHaveBeenCalledWith('docente');
    expect(auditRepo.logAuditEntry).not.toHaveBeenCalled();
  });
});
