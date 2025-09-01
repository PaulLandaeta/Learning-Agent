import apiClient from "../api/apiClient";
import type { 
  Document, 
  DocumentListResponse, 
  UploadResponse 
} from "../interfaces/documentInterface";

// Interface para errores de HTTP
interface HttpError {
  response?: {
    status: number;
    data?: unknown;
  };
  message?: string;
}

// Función auxiliar para obtener el token de autenticación
const getAuthToken = (): string => {
  const authData = localStorage.getItem("auth");
  if (!authData) {
    throw new Error('No hay datos de autenticación disponibles. Por favor, inicia sesión.');
  }
  
  try {
    const parsedAuth = JSON.parse(authData);
    const token = parsedAuth.accessToken;
    
    if (!token) {
      throw new Error('Token de acceso no encontrado. Por favor, inicia sesión nuevamente.');
    }
    
    return token;
  } catch {
    throw new Error('Error al leer los datos de autenticación. Por favor, inicia sesión nuevamente.');
  }
};

// Interfaces para las respuestas del backend
interface DocumentBackendResponse {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  downloadUrl: string;
  uploadedAt: string;
}

interface DocumentListBackendResponse {
  success: boolean;
  message: string;
  documents: DocumentBackendResponse[];
  total: number;
}

interface UploadBackendResponse {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  downloadUrl: string;
  uploadedAt: string;
}

interface DeleteBackendResponse {
  success: boolean;
  message: string;
  fileName: string;
  deletedAt: string;
}

interface ProcessChunksBackendResponse {
  success: boolean;
  message: string;
  data?: {
    totalChunks: number;
    processingTimeMs: number;
    statistics: {
      averageChunkSize: number;
      minChunkSize: number;
      maxChunkSize: number;
      actualOverlapPercentage: number;
    };
  };
}

interface DocumentChunksBackendResponse {
  success: boolean;
  message: string;
  data: {
    chunks: Array<{
      id: string;
      content: string;
      chunkIndex: number;
      type: string;
      contentLength: number;
      metadata?: Record<string, unknown>;
      createdAt: string;
    }>;
    total: number;
    statistics: {
      totalChunks: number;
      averageChunkSize: number;
      minChunkSize: number;
      maxChunkSize: number;
      totalContentLength: number;
    };
  };
}

export const documentService = {
  /**
   * Obtener lista de documentos
   */
  async getDocuments(): Promise<DocumentListResponse> {
    try {
      const response = await apiClient.get<DocumentListBackendResponse>('/api/documents');
      
      // Mapear respuesta del backend a nuestra interfaz
      const documents: Document[] = response.data.documents.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        size: doc.size,
        downloadUrl: doc.downloadUrl,
        uploadedAt: doc.uploadedAt,
      }));

      return {
        success: true,
        data: {
          documents,
          totalCount: response.data.total,
        },
      };
    } catch (error) {
      console.error('Error loading documents:', error);
      throw new Error('Error al cargar los documentos');
    }
  },

  /**
   * Subir un documento
   */
  async uploadDocument(file: File): Promise<UploadResponse> {
    try {
      // Obtener el token de autenticación usando la función auxiliar
      const token = getAuthToken();

      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<UploadBackendResponse>(
        '/api/documents/upload', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      // Mapear respuesta del backend a nuestra interfaz
      const document: Document = {
        id: response.data.id,
        fileName: response.data.fileName,
        originalName: response.data.originalName,
        mimeType: response.data.mimeType,
        size: response.data.size,
        downloadUrl: response.data.downloadUrl,
        uploadedAt: response.data.uploadedAt,
      };

      return {
        success: true,
        data: document,
      };
    } catch (error: unknown) {
      console.error('Error uploading document:', error);
      
      const httpError = error as HttpError;
      
      // Manejar errores específicos de autenticación
      if (httpError.response?.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      }
      
      if (httpError.response?.status === 403) {
        throw new Error('Sin permisos para subir documentos.');
      }
      
      // Si es un error de la función getAuthToken, mantener el mensaje original
      if ((error as Error).message?.includes('autenticación') || (error as Error).message?.includes('sesión')) {
        throw error;
      }
      
      throw new Error('Error al subir el documento. Por favor, inténtalo nuevamente.');
    }
  },

  /**
   * Descargar un documento usando su ID
   */
  async getDownloadUrl(documentId: string): Promise<string> {
    try {
      const response = await apiClient.get(`/api/documents/download/${documentId}`);
      return response.data.downloadUrl || response.data.url;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw new Error('Error al obtener URL de descarga');
    }
  },

  /**
   * Descargar y guardar documento usando su ID
   */
  async downloadAndSaveDocument(documentId: string, originalName: string): Promise<void> {
    try {
      // Obtener la URL de descarga usando axios (nuestro backend)
      const downloadUrlResponse = await apiClient.get(`/api/documents/download/${documentId}`);
      const downloadUrl = downloadUrlResponse.data.downloadUrl;
      
      // Usar fetch() para MinIO ya que axios puede interferir con las URLs firmadas
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Error al descargar: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Crear URL temporal para el blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Crear enlace temporal para descarga forzada
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = originalName.endsWith('.pdf') ? originalName : `${originalName}.pdf`;
      
      // Forzar descarga
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar blob URL para liberar memoria
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw new Error('Error al descargar el documento');
    }
  },

  /**
   * Eliminar un documento
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      await apiClient.delete<DeleteBackendResponse>(`/api/documents/${documentId}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Error al eliminar el documento');
    }
  },

  /**
   * Procesar chunks de un documento
   */
  async processDocumentChunks(
    documentId: string,
    options?: {
      chunkSize?: number;
      overlapSize?: number;
      maxChunkSize?: number;
      strategy?: string;
      minChunkSize?: number;
      preserveFormatting?: boolean;
      splitBy?: string;
    }
  ): Promise<ProcessChunksBackendResponse> {
    try {
      const response = await apiClient.post<ProcessChunksBackendResponse>(
        `/api/documents/${documentId}/process-chunks`,
        options || {}
      );
      return response.data;
    } catch (error) {
      console.error('Error processing document chunks:', error);
      throw new Error('Error al procesar los chunks del documento');
    }
  },

  /**
   * Obtener chunks de un documento
   */
  async getDocumentChunks(documentId: string): Promise<DocumentChunksBackendResponse> {
    try {
      const response = await apiClient.get<DocumentChunksBackendResponse>(`/api/documents/${documentId}/chunks`);
      return response.data;
    } catch (error) {
      console.error('Error getting document chunks:', error);
      throw new Error('Error al obtener los chunks del documento');
    }
  },

  /**
   * Generar embeddings para un documento
   */
  async generateDocumentEmbeddings(
    documentId: string,
    options?: {
      embeddingConfig?: {
        model?: string;
        dimensions?: number;
        additionalConfig?: Record<string, unknown>;
      };
      replaceExisting?: boolean;
      batchSize?: number;
      chunkFilters?: {
        chunkTypes?: string[];
        chunkIndices?: number[];
        minContentLength?: number;
      };
    }
  ): Promise<{
    success: boolean;
    result?: {
      documentId: string;
      totalChunksProcessed: number;
      chunksSkipped: number;
      chunksWithErrors: number;
      totalProcessingTimeMs: number;
      estimatedCost?: {
        totalTokens: number;
        totalCost: number;
      };
    };
    metadata?: {
      processingTimeMs: number;
      timestamp: string;
    };
  }> {
    try {
      const response = await apiClient.post(
        `/api/repository-documents/embeddings/generate/${documentId}`,
        options || {}
      );
      return response.data;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Error al generar embeddings');
    }
  },

  /**
   * Procesar texto de un documento
   */
  async processDocumentText(documentId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`/api/documents/${documentId}/process-text`);
      return response.data;
    } catch (error) {
      console.error('Error processing document text:', error);
      throw new Error('Error al procesar el texto del documento');
    }
  },

  /**
   * Procesamiento completo de un documento (upload + process + chunks)
   */
  async processDocumentComplete(
    file: File,
    onProgress?: (step: string, progress: number, message: string) => void
  ): Promise<{
    success: boolean;
    document: Document;
    processing: {
      textProcessed: boolean;
      chunksProcessed: boolean;
      totalChunks: number;
    };
  }> {
    try {
      // Paso 1: Upload
      onProgress?.('upload', 25, 'Subiendo documento...');
      const uploadResult = await this.uploadDocument(file);
      
      if (!uploadResult.data.id) {
        throw new Error('No se obtuvo ID del documento subido');
      }

      // Paso 2: Procesar texto
      onProgress?.('text', 50, 'Procesando texto...');
      await this.processDocumentText(uploadResult.data.id);

      // Paso 3: Procesar chunks
      onProgress?.('chunks', 75, 'Generando chunks...');
      const chunksResult = await this.processDocumentChunks(uploadResult.data.id);

      onProgress?.('complete', 100, 'Proceso completado');

      return {
        success: true,
        document: uploadResult.data,
        processing: {
          textProcessed: true,
          chunksProcessed: true,
          totalChunks: chunksResult.data?.totalChunks || 0,
        },
      };
    } catch (error) {
      console.error('Error in complete document processing:', error);
      throw new Error('Error en el procesamiento completo del documento');
    }
  },
};