import crypto from 'crypto';
import { DocumentChunk } from '../entities/document-chunk.entity';

export class DocumentChunkService {
  /**
   * Generates a SHA256 hash for the chunk content.
   * Used to detect duplicates (idempotency).
   */
  static getContentHash(content: string): string {
    return crypto.createHash('sha256').update(content.trim()).digest('hex');
  }

  /**
   * Check if the chunk contains valid content.
   */
  static isValid(chunk: DocumentChunk): boolean {
    return chunk.content.trim().length > 0 && chunk.chunkIndex >= 0;
  }

  /**
   * Gets the length of the chunk content.
   */
  static getContentLength(chunk: DocumentChunk): number {
    return chunk.content.length;
  }

  /**
   * Checks if the chunk is of the specified type.
   */
  static isOfType(chunk: DocumentChunk, type: string): boolean {
    return chunk.type === type;
  }

  /**
   * Creates a new chunk with validations and deduplication hash.
   */
  static create(
    id: string,
    documentId: string,
    content: string,
    chunkIndex: number,
    type: string = 'text',
    metadata?: Record<string, any>,
    createdAt?: Date,
    updatedAt?: Date,
  ): DocumentChunk {
    this.validateContent(content);
    this.validateChunkIndex(chunkIndex);

    const hash = this.getContentHash(content);

    const chunk = new DocumentChunk(
      id,
      documentId,
      content,
      chunkIndex,
      type,
      { ...metadata, hash }, 
      createdAt || new Date(),
      updatedAt || new Date(),
    );

    if (!this.isValid(chunk)) {
      throw new Error(
        'Invalid chunk: content must not be empty and chunkIndex must be >= 0',
      );
    }

    return chunk;
  }

  /**
   * Validates that a chunk has the minimum required content.
   */
  static validateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Chunk content cannot be empty');
    }
  }

  /**
   * Validates that the chunk index is valid.
   */
  static validateChunkIndex(chunkIndex: number): void {
    if (chunkIndex < 0) {
      throw new Error('Chunk index must be >= 0');
    }
  }

  /**
   * Checks if two chunks are duplicates based on their hash.
   */
  static isDuplicate(a: DocumentChunk, b: DocumentChunk): boolean {
    const hashA = a.metadata?.hash;
    const hashB = b.metadata?.hash;
    return !!hashA && !!hashB && hashA === hashB;
  }
}
