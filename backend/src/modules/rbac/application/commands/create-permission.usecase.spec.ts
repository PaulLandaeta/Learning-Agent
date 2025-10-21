import { Test, TestingModule } from '@nestjs/testing';
import { CreateRoleUseCase } from './create-role.usecase';
import { ROLE_REPO } from '../../tokens';
import { RoleRepositoryPort } from '../../domain/ports/role.repository.port';

describe('CreateRoleUseCase (transaction test)', () => {
  let useCase: CreateRoleUseCase;
  let mockRoleRepo: jest.Mocked<RoleRepositoryPort>;

  beforeEach(async () => {
    mockRoleRepo = {
      createWithPermissions: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoleUseCase,
        { provide: ROLE_REPO, useValue: mockRoleRepo },
      ],
    }).compile();

    useCase = module.get(CreateRoleUseCase);
  });

  it('should create role with permissions successfully', async () => {
    // Mock con `as any` para evitar error de tipos (permissions no existe en Role)
    const mockRole = {
      id: '1',
      name: 'Admin',
      description: 'Full access',
      permissions: [
        { permissionId: 'p1', roleId: '1' },
        { permissionId: 'p2', roleId: '1' },
      ],
    } as any;

    mockRoleRepo.createWithPermissions.mockResolvedValueOnce(mockRole);

    const result = await useCase.execute({
      name: 'Admin',
      description: 'Full access',
      permissionIds: ['p1', 'p2'],
    });

    expect(result.name).toBe('Admin');
    expect(mockRoleRepo.createWithPermissions).toHaveBeenCalledTimes(1);
    expect(mockRoleRepo.createWithPermissions).toHaveBeenCalledWith(
      'Admin',
      'Full access',
      ['p1', 'p2'],
    );
  });

  it('should rollback if repository throws error', async () => {
    mockRoleRepo.createWithPermissions.mockRejectedValueOnce(
      new Error('Simulated DB error'),
    );

    await expect(
      useCase.execute({
        name: 'BrokenRole',
        description: 'This should fail',
        permissionIds: ['p1', 'p2'],
      }),
    ).rejects.toThrow('Simulated DB error');

    expect(mockRoleRepo.createWithPermissions).toHaveBeenCalledTimes(1);
  });
});
