import { Injectable, Logger, Inject } from '@nestjs/common';
import { CHUNKING_CONFIG_PORT } from '../../tokens';
import type { ChunkingConfigPort } from '../ports/chunking-config.port';
import {
  ChunkingLimitExceededError,
  DocumentSizeExceededError,
  InvalidChunkingConfigError,
} from '../../../../shared/exceptions/document.exceptions';
import type { ChunkingConfig } from '../../domain/ports/chunking-strategy.port';

export interface ChunkingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  estimatedChunks: number;
}

@Injectable()
export class ChunkingValidationService {
  private readonly logger = new Logger(ChunkingValidationService.name);

  constructor(
    @Inject(CHUNKING_CONFIG_PORT)
    private readonly chunkingConfig: ChunkingConfigPort,
  ) {}

  validateDocumentSize(textLength: number): void {
    if (textLength > this.chunkingConfig.getMaxTextLengthChars()) {
      throw new DocumentSizeExceededError(
        `Document text exceeds maximum allowed length of ${this.chunkingConfig.getMaxTextLengthChars()} characters`,
        textLength,
        this.chunkingConfig.getMaxTextLengthChars(),
      );
    }
  }

  validateChunkCount(chunkCount: number): void {
    if (chunkCount > this.chunkingConfig.getMaxChunksPerDocument()) {
      throw new ChunkingLimitExceededError(
        `Document generated ${chunkCount} chunks, exceeding the maximum limit of ${this.chunkingConfig.getMaxChunksPerDocument()}`,
        chunkCount,
        this.chunkingConfig.getMaxChunksPerDocument(),
      );
    }
  }

  validateChunkingConfig(config: ChunkingConfig): ChunkingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.maxChunkSize <= 0) {
      errors.push('maxChunkSize must be greater than 0');
    }

    if (config.maxChunkSize > this.chunkingConfig.getMaxChunkSize()) {
      errors.push(
        `maxChunkSize cannot exceed ${this.chunkingConfig.getMaxChunkSize()}`,
      );
    }

    if (config.minChunkSize <= 0) {
      errors.push('minChunkSize must be greater than 0');
    }

    if (config.minChunkSize < this.chunkingConfig.getMinChunkSize()) {
      warnings.push(
        `minChunkSize is below recommended minimum of ${this.chunkingConfig.getMinChunkSize()}`,
      );
    }

    if (config.minChunkSize > config.maxChunkSize) {
      errors.push('minChunkSize cannot be greater than maxChunkSize');
    }

    if (config.overlap < 0) {
      errors.push('overlap cannot be negative');
    }

    if (config.overlap >= config.maxChunkSize) {
      errors.push('overlap must be less than maxChunkSize');
    }

    if (config.overlap > this.chunkingConfig.getMaxOverlap()) {
      warnings.push(
        `overlap exceeds recommended maximum of ${this.chunkingConfig.getMaxOverlap()}`,
      );
    }

    if (errors.length > 0) {
      throw new InvalidChunkingConfigError(
        `Invalid chunking configuration: ${errors.join(', ')}`,
        Object.keys(config),
      );
    }

    if (warnings.length > 0) {
      this.logger.warn(`Chunking config warnings: ${warnings.join(', ')}`);
    }

    return {
      isValid: true,
      errors,
      warnings,
      estimatedChunks: 0,
    };
  }

  estimateChunkCount(
    textLength: number,
    config: ChunkingConfig,
  ): number {
    const effectiveChunkSize = config.maxChunkSize - config.overlap;
    const estimated = Math.ceil(textLength / effectiveChunkSize);
    
    this.logger.log(
      `Estimated ${estimated} chunks for ${textLength} characters ` +
      `(chunkSize: ${config.maxChunkSize}, overlap: ${config.overlap})`,
    );
    
    return estimated;
  }

  validateBeforeChunking(
    textLength: number,
    config: ChunkingConfig,
  ): void {
    this.validateDocumentSize(textLength);
    this.validateChunkingConfig(config);

    const estimatedChunks = this.estimateChunkCount(textLength, config);
    
    if (estimatedChunks > this.chunkingConfig.getMaxChunksPerDocument()) {
      throw new ChunkingLimitExceededError(
        `Estimated ${estimatedChunks} chunks would exceed the maximum limit of ${this.chunkingConfig.getMaxChunksPerDocument()}. ` +
        `Consider using a larger chunk size or processing the document in batches.`,
        estimatedChunks,
        this.chunkingConfig.getMaxChunksPerDocument(),
      );
    }
  }
}
