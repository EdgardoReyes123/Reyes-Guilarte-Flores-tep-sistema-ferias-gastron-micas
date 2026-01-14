# Punto 3. Pedidos y Ventas.

Endpoints principales:

- `POST /orders` : Crear pedido
- `GET /orders/customer/:customerId` : Historial de un cliente
- `PATCH /orders/:id/status` : Actualizar estado del pedido (PENDING -> PREPARING -> READY -> DELIVERED)
- `GET /orders/stall/:stallId/sales` : Ventas registradas por puesto (items vendidos)

# Postgres:
- El microservicio usa TypeORM.
- Variables de entorno para DB (por defecto):
	- `DB_HOST` (localhost)
	- `DB_PORT` (5432)
	- `DB_USERNAME` (postgres)
	- `DB_PASSWORD` (password)
	- `DB_DATABASE` (orders_service_db)
	- `DB_SYNCHRONIZE` (true|false) — usar `false` en producción; `true` crea tablas automáticamente en desarrollo.