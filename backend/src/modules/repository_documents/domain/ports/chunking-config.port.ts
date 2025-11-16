export interface ChunkingConfigPort {
  getMaxChunksPerDocument(): number;
  getMaxChunkSize(): number;
  getMinChunkSize(): number;
  getDefaultChunkSize(): number;
  getMaxOverlap(): number;
  getDefaultOverlap(): number;
  getMaxDocumentSizeBytes(): number;
  getMaxTextLengthChars(): number;
}
