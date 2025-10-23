# Repository Documents Module

Este módulo gestiona el almacenamiento y gestión de documentos en el sistema, proporcionando una interfaz consistente para subir, descargar y administrar documentos.

## Características Principales

- Almacenamiento seguro de documentos en MinIO/S3
- Gestión de metadatos en base de datos
- Consistencia fuerte entre storage y base de datos
- Reconciliación automática de inconsistencias
- Manejo robusto de errores y recuperación

## Arquitectura

El módulo sigue los principios de arquitectura hexagonal:

```
repository_documents/
├── application/        # Casos de uso
├── domain/            # Entidades y puertos
├── infrastructure/    # Adaptadores
└── test/             # Tests unitarios y de integración
```

## Manejo de Consistencia

Implementa un patrón de consistencia fuerte entre el almacenamiento y la base de datos:

1. **Subida de Documentos**: 
   - Rollback automático en storage si falla la BD
   - Prevención de documentos duplicados
   - Manejo transaccional de metadatos

2. **Borrado de Documentos**:
   - Patrón de compensación con restauración
   - Manejo atómico de documento y chunks
   - Limpieza segura de recursos

3. **Reconciliación Automática**:
   - Job periódico cada 2 horas
   - Detección y corrección de inconsistencias
   - Logging detallado para auditoría

Para más detalles sobre el patrón de consistencia, ver [CONSISTENCY_PATTERN.md](./docs/CONSISTENCY_PATTERN.md).

## Tests

El módulo incluye tests exhaustivos para validar el manejo de consistencia:

```bash
# Ejecutar todos los tests del módulo
npm run test:unit -- src/modules/repository_documents/test

# Ejecutar tests específicos
npm run test:unit -- src/modules/repository_documents/test/upload-document.usecase.spec.ts
npm run test:unit -- src/modules/repository_documents/test/delete-document.usecase.spec.ts
npm run test:unit -- src/modules/repository_documents/test/storage-reconciliation.service.spec.ts
```

## Manejo de Errores

Los errores se manejan de forma robusta:

1. **Errores de Storage**:
   - Timeout configurable
   - Reintentos automáticos
   - Rollback de operaciones fallidas

2. **Errores de Base de Datos**:
   - Compensación automática
   - Restauración de estado consistente
   - Tracking de errores

3. **Errores de Red**:
   - Manejo de desconexiones
   - Recuperación automática
   - Logging detallado

## Configuración

El módulo utiliza las siguientes variables de entorno:

```env
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET_NAME=documents
```

## Monitoreo

- Logs detallados de operaciones críticas
- Métricas de reconciliación
- Alertas de inconsistencias
- Tracking de operaciones de rollback

## Contribución

1. Asegúrate de que los tests pasen:
   ```bash
   npm run test:unit
   ```

2. Sigue las convenciones de código:
   ```bash
   npm run lint
   ```

3. Documenta los cambios en el patrón de consistencia si es necesario