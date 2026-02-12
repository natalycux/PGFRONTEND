# Configuración de la API Backend

Este documento describe los formatos exactos que el frontend espera de tu API.

## 🔌 URL Base

```javascript
https://localhost:7004/api
```

## 🔐 Autenticación

### POST /api/auth/login

**Request:**
```json
{
  "email": "admin@agua.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Administrador Principal",
    "email": "admin@agua.com",
    "role": "Administrador Principal"
  }
}
```

**Roles válidos:**
- `"Administrador Principal"`
- `"Administrador 2"`
- `"Repartidor"`

### GET /api/auth/me

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Administrador Principal",
  "email": "admin@agua.com",
  "role": "Administrador Principal"
}
```

## 📊 Dashboard

### GET /api/dashboard/statistics

**Response:**
```json
{
  "totalOrders": 100,
  "pendingOrders": 25,
  "inTransitOrders": 35,
  "deliveredOrders": 40,
  "sales": 80,
  "donations": 15,
  "discounts": 5,
  "totalBottles": 450,
  "todayOrders": 12
}
```

### GET /api/dashboard/orders-by-community

**Response:**
```json
[
  {
    "name": "Colonia Norte",
    "orders": 45
  },
  {
    "name": "Colonia Este",
    "orders": 55
  }
]
```

### GET /api/dashboard/orders-by-delivery-person

**Response:**
```json
[
  {
    "name": "Nataly Michell Cux Recinos",
    "orders": 67
  },
  {
    "name": "Juan Pérez",
    "orders": 33
  }
]
```

### GET /api/dashboard/recent-orders

**Response:**
```json
[
  {
    "id": 1,
    "clientName": "Isabel Ruiz",
    "communityName": "Colonia Este",
    "address": "Calle Guerrero #67",
    "phone": "555-0402",
    "status": "Pendiente",
    "transactionType": "Donación",
    "discount": 0,
    "bottles": 4,
    "date": "2026-02-07T00:00:00Z"
  }
]
```

## 📦 Pedidos

### GET /api/orders

**Query Params (opcionales):**
- `status` - Filtrar por estado
- `communityId` - Filtrar por comunidad
- `deliveryPersonId` - Filtrar por repartidor

**Response:**
```json
[
  {
    "id": 1,
    "clientName": "Roberto Díaz",
    "clientId": 1,
    "communityName": "Colonia Norte",
    "communityId": 1,
    "address": "Av. Insurgentes #12",
    "phone": "555-0203",
    "status": "Entregado",
    "transactionType": "Venta",
    "discount": 10,
    "bottles": 3,
    "notes": "Dejar en la entrada",
    "date": "2026-02-07T00:00:00Z",
    "deliveryPersonName": "Nataly Michell"
  }
]
```

### POST /api/orders

**Request:**
```json
{
  "communityId": 1,
  "clientId": 2,
  "transactionType": "Venta",
  "bottles": 5,
  "discount": 0,
  "initialStatus": "Pendiente",
  "notes": "Tocar el timbre"
}
```

**Tipos de transacción válidos:**
- `"Venta"`
- `"Donación"`
- `"Descuento"`

**Estados válidos:**
- `"Pendiente"`
- `"En Camino"`
- `"Entregado"`

**Response (201 Created):**
```json
{
  "id": 5,
  "message": "Pedido creado exitosamente"
}
```

### PATCH /api/orders/{id}/status

**Request:**
```json
{
  "status": "En Camino"
}
```

**Response (200 OK):**
```json
{
  "message": "Estado actualizado exitosamente"
}
```

### DELETE /api/orders/{id}

**Response (200 OK):**
```json
{
  "message": "Pedido eliminado exitosamente"
}
```

## 🏘️ Comunidades

### GET /api/communities

**Response:**
```json
[
  {
    "id": 1,
    "name": "Colonia Norte"
  },
  {
    "id": 2,
    "name": "Colonia Este"
  }
]
```

## 👥 Clientes

### GET /api/clients/by-community/{communityId}

**Response:**
```json
[
  {
    "id": 1,
    "name": "Isabel Ruiz",
    "address": "Calle Guerrero #67",
    "phone": "555-0402",
    "communityId": 2
  }
]
```

## 👤 Usuarios

### GET /api/users

**Response:**
```json
[
  {
    "id": 1,
    "name": "Administrador Principal",
    "email": "admin@agua.com",
    "role": "Administrador Principal",
    "isActive": true,
    "createdAt": "2026-08-02T00:00:00Z"
  }
]
```

### POST /api/users

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "password123",
  "role": "Repartidor"
}
```

**Response (201 Created):**
```json
{
  "id": 5,
  "message": "Usuario creado exitosamente"
}
```

### PATCH /api/users/{id}/password

**Request:**
```json
{
  "password": "nuevaPassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

### PATCH /api/users/{id}/deactivate

**Response (200 OK):**
```json
{
  "message": "Usuario desactivado exitosamente"
}
```

## 📋 Bitácora

### GET /api/audit-logs

**Query Params (opcionales):**
- `startDate` - Fecha inicio (formato ISO)
- `endDate` - Fecha fin (formato ISO)
- `action` - Filtrar por tipo de acción
- `userId` - Filtrar por usuario

**Response:**
```json
[
  {
    "id": 1,
    "userName": "Administrador Principal",
    "userId": 1,
    "action": "Inicio de sesión",
    "details": "Email: admin@agua.com",
    "timestamp": "2026-02-11T23:20:10Z"
  },
  {
    "id": 2,
    "userName": "José Miguel De Paz Calderón",
    "userId": 2,
    "action": "Creó pedido",
    "details": "Cliente: Isabel Ruiz - 4 garrafones - donation",
    "timestamp": "2026-02-08T13:27:43Z"
  }
]
```

**Tipos de acciones:**
- `"Inicio de sesión"`
- `"Creó pedido"`
- `"Eliminó pedido"`
- `"Creó usuario"`
- `"Cambió contraseña"`
- `"Desactivó usuario"`

### GET /api/audit-logs/statistics

**Response:**
```json
{
  "totalLogs": 15,
  "loginCount": 9,
  "ordersCreated": 3,
  "usersCreated": 2
}
```

## 🔒 Seguridad

### Headers Requeridos

En cada petición (excepto login), el frontend envía:

```
Authorization: Bearer {token}
Content-Type: application/json
```

### CORS

Tu API debe permitir:

```csharp
// Program.cs o Startup.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins("http://localhost:5173")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

// Después de app
app.UseCors("AllowFrontend");
```

## ⚠️ Manejo de Errores

### Error 400 - Bad Request
```json
{
  "message": "Datos inválidos",
  "errors": {
    "email": ["El email es requerido"],
    "password": ["La contraseña debe tener al menos 6 caracteres"]
  }
}
```

### Error 401 - Unauthorized
```json
{
  "message": "Credenciales inválidas"
}
```

### Error 403 - Forbidden
```json
{
  "message": "No tienes permisos para realizar esta acción"
}
```

### Error 404 - Not Found
```json
{
  "message": "Recurso no encontrado"
}
```

### Error 500 - Server Error
```json
{
  "message": "Error interno del servidor"
}
```

## 🧪 Pruebas

Puedes probar los endpoints con:

1. **Postman/Insomnia**
2. **Swagger UI**: `https://localhost:7004/swagger`
3. **curl**:

```bash
# Login
curl -X POST https://localhost:7004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agua.com","password":"admin123"}' \
  -k

# Con token
curl -X GET https://localhost:7004/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -k
```

El flag `-k` ignora certificados autofirmados en desarrollo.

## 📝 Notas Adicionales

1. **Fechas**: Usar formato ISO 8601 (`2026-02-11T23:20:10Z`)
2. **Descuentos**: Son en Quetzales (moneda), NO en porcentaje
3. **IDs**: Números enteros positivos
4. **Contraseñas**: Hashear con bcrypt antes de guardar
5. **Tokens JWT**: Incluir roles y permisos en el payload

---

**¿Necesitas ajustar algún endpoint?** Modifica `src/services/api.js` en el frontend.
