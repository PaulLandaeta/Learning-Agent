
import { Inject, Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ROLE_REPO } from '../../tokens';
import type { RoleRepositoryPort } from '../../domain/ports/role.repository.port';
import { Role } from '../../domain/entities/role.entity';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(ROLE_REPO) private readonly roleRepo: RoleRepositoryPort,
  ) {}

  async execute(input: {
    name: string;
    description?: string | null;
    permissionIds?: string[];
  }): Promise<Role> {
 
    if (await this.roleRepo.findByName(input.name))
      throw new BadRequestException('Role name already exists');

    try {
      
      if (input.permissionIds && input.permissionIds.length > 0) {
        return await this.roleRepo.createWithPermissions(
          input.name,
          input.description ?? null,
          input.permissionIds,
        );
      }

      
      return await this.roleRepo.create(input.name, input.description ?? null);
    } catch (err) {
   
      throw new InternalServerErrorException(err instanceof Error ? err.message : 'Error creating role');
    }
  }
}
