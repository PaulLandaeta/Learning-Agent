import { CreateRoleUseCase } from './create-role.usecase';
import type { RoleRepositoryPort } from '../../domain/ports/role.repository.port';
import { Role } from '../../domain/entities/role.entity';

describe('CreateRoleUseCase', () => {
  let repo: jest.Mocked<RoleRepositoryPort>;
  let useCase: CreateRoleUseCase;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
      attachPermission: jest.fn(),
      listForUser: jest.fn(),
    } as unknown as jest.Mocked<RoleRepositoryPort>;
    useCase = new CreateRoleUseCase(repo);
  });

  it('creates a role when name is available', async () => {
    repo.findByName.mockResolvedValue(null);
    const created = new Role('r1', 'Admin', null);
    repo.create.mockResolvedValue(created);

    const result = await useCase.execute({ name: 'Admin' });

    expect(repo.findByName).toHaveBeenCalledWith('Admin');
    expect(repo.create).toHaveBeenCalledWith('Admin', null);
    expect(result).toBe(created);
  });

  it('throws when role name already exists', async () => {
    const existing = new Role('r1', 'Admin', null);
    repo.findByName.mockResolvedValue(existing);

    await expect(useCase.execute({ name: 'Admin' })).rejects.toThrow(
      'Role name already exists',
    );
    expect(repo.create).not.toHaveBeenCalled();
  });
});
