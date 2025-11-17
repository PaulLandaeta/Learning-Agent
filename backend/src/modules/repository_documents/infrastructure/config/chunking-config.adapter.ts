import { Injectable } from '@nestjs/common';
import { ChunkingConfigPort } from '../../domain/ports/chunking-config.port';

@Injectable()
export class ChunkingConfigAdapter implements ChunkingConfigPort {
  private readonly MAX_CHUNKS_PER_DOCUMENT = 500;
  private readonly MAX_CHUNK_SIZE = 2000;
  private readonly MIN_CHUNK_SIZE = 50;
  private readonly DEFAULT_CHUNK_SIZE = 1000;
  private readonly MAX_OVERLAP = 200;
  private readonly DEFAULT_OVERLAP = 100;
  private readonly MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
  private readonly MAX_TEXT_LENGTH_CHARS = 1000000;

  getMaxChunksPerDocument(): number {
    return this.MAX_CHUNKS_PER_DOCUMENT;
  }

  getMaxChunkSize(): number {
    return this.MAX_CHUNK_SIZE;
  }

  getMinChunkSize(): number {
    return this.MIN_CHUNK_SIZE;
  }

  getDefaultChunkSize(): number {
    return this.DEFAULT_CHUNK_SIZE;
  }

  getMaxOverlap(): number {
    return this.MAX_OVERLAP;
  }

  getDefaultOverlap(): number {
    return this.DEFAULT_OVERLAP;
  }

  getMaxDocumentSizeBytes(): number {
    return this.MAX_DOCUMENT_SIZE_BYTES;
  }

  getMaxTextLengthChars(): number {
    return this.MAX_TEXT_LENGTH_CHARS;
  }
}
