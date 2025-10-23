# Consistencia entre Storage y Base de Datos

## Descripción
Mecanismo para mantener la coherencia entre MinIO/S3 y la base de datos en `repository_documents`.

## Patrones

### 1. Subida (Rollback)
**Flujo:**
1. Subir archivo al storage
2. Guardar registro en base de datos  
3. Si falla BD → eliminar archivo y lanzar error

```mermaid
sequenceDiagram
    Client->>UseCase: uploadDocument()
    UseCase->>Storage: upload
    Storage-->>UseCase: ok
    UseCase->>DB: save
    alt falla BD
        UseCase->>Storage: delete (rollback)
    end
```

### 2. Borrado (Compensación)  
**Flujo:**
1. Marcar borrado en BD
2. Eliminar del storage
3. Si falla → restaurar BD

```mermaid
sequenceDiagram
    Client->>UseCase: deleteDocument()
    UseCase->>DB: mark deleted
    UseCase->>Storage: delete
    alt falla Storage
        UseCase->>DB: restore
    end
```

### 3. Reconciliación
**Job periódico:**
- BD sin archivo → marcar ERROR
- Archivo sin BD → eliminar

```mermaid
sequenceDiagram
    loop Cada 2h
        Job->>DB/Storage: verificar y corregir
    end
```

## Errores y Monitoreo
- Rollback y restauración automáticos
- Logs y métricas de inconsistencias  
- Procesamiento por lotes y asíncrono
```