# Repository Documents Module

Módulo encargado del almacenamiento y gestión de documentos, asegurando consistencia fuerte entre la base de datos y MinIO/S3.

## Características
- Almacenamiento seguro en MinIO/S3
- Metadatos en base de datos
- Rollback y compensación automáticos
- Reconciliación periódica de inconsistencias
- Manejo robusto de errores y auditoría

## Arquitectura
Estructura basada en arquitectura hexagonal:

```
repository_documents/
├── application/     # Casos de uso
├── domain/          # Entidades y puertos
├── infrastructure/  # Adaptadores
└── test/            # Tests
```

## Consistencia
- **Subida**: rollback del archivo si falla la BD
- **Borrado**: compensación si falla el storage  
- **Reconciliación**: job cada 2 h corrige inconsistencias

➡️ Ver `CONSISTENCY_PATTERN.md` para más detalles.

## Tests
Ejecutar pruebas del módulo:

```bash
npm run test:unit -- src/modules/repository_documents/test
```

## Errores
- **Storage**: reintentos, timeouts y rollback
- **BD**: compensación y restauración
- **Red**: recuperación automática y logging

## Configuración
```env
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET_NAME=documents
```

## Monitoreo
- Logs y métricas de reconciliación
- Tracking de operaciones críticas
- Alertas de inconsistencias

## Contribución
- Ejecutar tests: `npm run test:unit`
- Aplicar lint: `npm run lint`
- Documentar cambios en el patrón de consistencia
```