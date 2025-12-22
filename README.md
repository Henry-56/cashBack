# CashBack - Plataforma de Préstamos P2P

Plataforma de préstamos entre personas (Peer-to-Peer) que conecta a solicitantes con prestamistas de confianza.

## Características Principales

- **Solicitudes de Préstamo**: Los usuarios pueden solicitar montos específicos con plazos definidos.
- **Marketplace de Préstamos**: Los prestamistas pueden ver y financiar solicitudes.
- **Flujo de Confirmación Segura**: 
  - El prestamista envía el comprobante.
  - El préstamo queda en estado "Por Confirmar".
  - El solicitante valida la recepción para activar el préstamo.
- **Gestión de Pagos**: Seguimiento de deudas e inversiones.

## Tecnologías

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: PostgreSQL (NeonDB) + Drizzle ORM
- **Tiempo Real**: Socket.io

## Configuración del Proyecto

### Requisitos Previos
- Node.js (v18+)
- PostgreSQL

### Instalación

1. **Clonar el repositorio**
2. **Backend**:
   ```bash
   cd backend
   npm install
   # Configurar .env basado en .env.example
   npm run db:push # Sincronizar base de datos
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Estructura del Proyecto

- `/backend`: API REST y lógica de negocio.
- `/frontend`: Interfaz de usuario React.

## Notas Importantes
- Asegúrate de configurar las variables de entorno correctamente en `backend/.env`.
- El sistema utiliza `Socket.io` para notificaciones en tiempo real, asegúrate de que el puerto 3001 esté libre.
