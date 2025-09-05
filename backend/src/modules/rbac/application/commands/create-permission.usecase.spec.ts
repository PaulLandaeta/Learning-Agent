import { CreatePermissionUseCase } from './create-permission.usecase';
import type { PermissionRepositoryPort } from '../../domain/ports/permission.repository.port';
import { Permission } from '../../domain/entities/permission.entity';

describe('CreatePermissionUseCase', () => {
  let repo: jest.Mocked<PermissionRepositoryPort>;
  let useCase: CreatePermissionUseCase;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      findByActionResource: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
    } as unknown as jest.Mocked<PermissionRepositoryPort>;
    useCase = new CreatePermissionUseCase(repo);
  });

  it('creates a permission when not existing', async () => {
    repo.findByActionResource.mockResolvedValue(null);
    const created = new Permission('p1', 'read', 'document', null);
    repo.create.mockResolvedValue(created);

    const result = await useCase.execute({ action: 'read', resource: 'document' });

    expect(repo.findByActionResource).toHaveBeenCalledWith('read', 'document');
    expect(repo.create).toHaveBeenCalledWith('read', 'document', null);
    expect(result).toBe(created);
  });

  it('throws when permission already exists', async () => {
    const existing = new Permission('p1', 'read', 'document', null);
    repo.findByActionResource.mockResolvedValue(existing);

    await expect(
      useCase.execute({ action: 'read', resource: 'document' }),
    ).rejects.toThrow('Permission already exists');
    expect(repo.create).not.toHaveBeenCalled();
  });
});

