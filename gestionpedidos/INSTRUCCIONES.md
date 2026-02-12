# Sistema de Gestión de Pedidos de Agua

Frontend desarrollado con React + Vite para la gestión de pedidos de agua potable en comunidades.

## 🚀 Características

### 3 Roles de Usuario
- **Administrador Principal**: Acceso completo al sistema
- **Administrador 2**: Dashboard, Pedidos, Bitácora
- **Repartidor**: Gestión de sus propios pedidos

### Funcionalidades
- ✅ Sistema de autenticación seguro
- 📊 Dashboard con estadísticas en tiempo real
- 📦 Gestión completa de pedidos (crear, actualizar estado, eliminar)
- 👥 Gestión de usuarios (solo Admin Principal)
- 📋 Bitácora de auditoría de todas las acciones
- 💧 Control de transacciones: Ventas, Donaciones, Descuentos

## 🛠️ Instalación

### 1. Instalar Dependencias

```bash
npm install
```

**Dependencias que se instalarán:**
- `react-router-dom` - Navegación entre páginas
- `axios` - Peticiones HTTP a la API
- `lucide-react` - Iconos modernos

### 2. Configurar la API

El frontend está configurado para conectarse a tu API local en `https://localhost:7004/api`

**Ubicación de configuración:** `src/services/api.js`

```javascript
const API_BASE_URL = 'https://localhost:7004/api';
```

Si tu API está en otra URL, modifica esta línea.

### 3. Endpoints de la API Requeridos

El frontend espera los siguientes endpoints (ajústalos según tu Swagger):

#### Autenticación
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

#### Dashboard
- `GET /api/dashboard/statistics` - Estadísticas generales
- `GET /api/dashboard/orders-by-community` - Pedidos por comunidad
- `GET /api/dashboard/orders-by-delivery-person` - Pedidos por repartidor
- `GET /api/dashboard/recent-orders` - Pedidos recientes

#### Pedidos
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Crear pedido
- `PATCH /api/orders/{id}/status` - Actualizar estado
- `DELETE /api/orders/{id}` - Eliminar pedido

#### Comunidades y Clientes
- `GET /api/communities` - Listar comunidades
- `GET /api/clients/by-community/{id}` - Clientes por comunidad

#### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PATCH /api/users/{id}/password` - Cambiar contraseña
- `PATCH /api/users/{id}/deactivate` - Desactivar usuario

#### Bitácora
- `GET /api/audit-logs` - Listar logs
- `GET /api/audit-logs/statistics` - Estadísticas de logs

### 4. Certificados SSL (Desarrollo)

Si tu API usa certificados autofirmados, el código ya incluye la configuración necesaria:

```javascript
httpsAgent: new (require('https').Agent)({
  rejectUnauthorized: false
})
```

## 🎨 Ejecución

### Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Producción

```bash
npm run build
npm run preview
```

## 👤 Usuario por Defecto

**Email:** admin@agua.com  
**Contraseña:** admin123

(Ya está visible en la pantalla de login)

## 📁 Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables
│   └── MainLayout.jsx # Layout principal con navegación
├── pages/            # Páginas de la aplicación
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Pedidos.jsx
│   ├── Usuarios.jsx
│   └── Bitacora.jsx
├── services/         # Servicios de API
│   └── api.js
├── context/          # Contextos de React
│   └── AuthContext.jsx
├── App.jsx           # Componente raíz con rutas
├── main.jsx          # Entry point
└── index.css         # Estilos globales
```

## 🔑 Sistema de Permisos

Los permisos se gestionan automáticamente según el rol:

```javascript
'Administrador Principal': ['dashboard', 'pedidos', 'usuarios', 'bitacora', 'crear_usuario', 'eliminar_pedido']
'Administrador 2': ['dashboard', 'pedidos', 'bitacora', 'eliminar_pedido']
'Repartidor': ['pedidos', 'crear_pedido']
```

## 🎯 Funcionalidades Clave

### Dashboard
- Tarjetas estadísticas con totales
- Gráficos de pedidos por comunidad
- Ranking de repartidores
- Pedidos recientes con detalles

### Pedidos
- Formulario de creación con validación
- Selección en cascada (Comunidad → Cliente)
- Tipos de transacción con descuentos en Quetzales
- Filtros por estado
- Cambio de estado dinámico

### Usuarios (Solo Admin Principal)
- Crear usuarios con roles
- Cambiar contraseñas
- Desactivar usuarios
- Protección: no puede desactivarse a sí mismo

### Bitácora
- Registro completo de acciones
- Agrupado por fecha
- Estadísticas de actividades
- Códigos de color por tipo de acción

## 🔧 Ajustes API

### Formato de Respuesta Login

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Admin Principal",
    "email": "admin@agua.com",
    "role": "Administrador Principal"
  }
}
```

### Formato de Pedido

```json
{
  "communityId": 1,
  "clientId": 1,
  "transactionType": "Venta",  // "Venta" | "Donación" | "Descuento"
  "bottles": 5,
  "discount": 0,  // En Quetzales si es tipo Descuento
  "initialStatus": "Pendiente",
  "notes": "Dejar en la entrada"
}
```

## 🎨 Colores del Sistema

- **Azul Principal:** #2563eb
- **Azul Oscuro:** #1d4ed8
- **Texto Oscuro:** #1e293b
- **Texto Claro:** #64748b
- **Fondo:** #f8fafc

## 📝 Notas Importantes

1. **Contraseñas en Texto Plano:** El login envía la contraseña en texto plano. La API debe hashearla con bcrypt al compararla.

2. **CORS:** Asegúrate de que tu API permita peticiones desde `http://localhost:5173` en desarrollo.

3. **Token JWT:** El token se guarda en `localStorage` y se envía automáticamente en cada petición.

4. **Quetzales:** Los descuentos NO usan porcentaje, sino moneda (Quetzales).

## 🐛 Solución de Problemas

### Error de CORS
Agrega en tu API:
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", builder => {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
```

### Error de Certificado SSL
Ya está manejado en el código con `rejectUnauthorized: false`

### Error 401 No Autorizado
Verifica que tu API esté retornando el token JWT correcto en el login.

## 📞 Soporte

Para cualquier duda sobre la integración con tu API, revisa tu Swagger en:
`https://localhost:7004/swagger/index.html`

Y ajusta los endpoints en `src/services/api.js` según corresponda.

---

**Desarrollado con ❤️ para el Proyecto de Graduación**
