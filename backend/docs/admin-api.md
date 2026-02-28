# Documentación de APIs Administrativas (Cashback)

Esta documentación describe los endpoints disponibles para el futuro Panel de Administración independiente.

## Autenticación y Seguridad
Todas las rutas bajo `/api/admin` requieren que se proporcione un `userId` con rol `ADMIN`. 

Para desarrollo, el middleware acepta el ID a través de:
- Header: `X-User-Id`
- Body: `userId`
- Query: `userId` (ej. `/api/admin/loans?userId=...`)

> [!IMPORTANT]
> En producción, este ID se extraerá directamente del token JWT tras la autenticación centralizada.

## Endpoints

### 1. Obtener Lista de Préstamos y Contratos
**Ruta:** `GET /api/admin/loans`

Devuelve un listado completo de todas las solicitudes de préstamo en el sistema.

**Respuesta Exitosa (200 OK):**
```json
[
  {
    "id": "uuid-del-prestamo",
    "amount": "1000.00",
    "status": "APPROVED",
    "contractUrl": "https://r2.dev/contratos/uuid.pdf",
    "borrowerName": "Nombre Completo",
    "createdAt": "2024-03-20T10:00:00Z"
  }
]
```

### 2. Estadísticas Globales
**Ruta:** `GET /api/admin/stats`

Devuelve métricas clave sobre el estado de la plataforma.

**Respuesta Exitosa (200 OK):**
```json
{
  "totalUsers": 150,
  "admins": 2
}
```

## Códigos de Error Comunes
- **400 Bad Request:** Formato de `userId` inválido (debe ser UUID).
- **401 Unauthorized:** No se proporcionó el `userId`.
- **403 Forbidden:** El usuario no existe o no tiene el rol de `ADMIN`.
- **500 Internal Server Error:** Error de conexión a la base de datos.
