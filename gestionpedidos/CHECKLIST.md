# ✅ Checklist de Verificación - Frontend

Usa este checklist para verificar que todo esté funcionando correctamente.

## 📦 Instalación

- [ ] Ejecutar `npm install` en la carpeta del proyecto
- [ ] Verificar que se instalaron:
  - [ ] react-router-dom
  - [ ] axios
  - [ ] lucide-react
- [ ] No hay errores en la consola después de `npm install`

## 🔌 Configuración de la API

- [ ] Tu API backend está corriendo en `https://localhost:7004`
- [ ] Swagger está accesible en `https://localhost:7004/swagger/index.html`
- [ ] CORS configurado para permitir `http://localhost:5173`
- [ ] Todos los endpoints del archivo `API_FORMAT.md` existen
- [ ] Usuario por defecto existe: `admin@agua.com` / `admin123`

## 🚀 Ejecución

- [ ] Ejecutar `npm run dev`
- [ ] El frontend abre en `http://localhost:5173`
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en consola de VSCode

## 🔐 Login y Autenticación

- [ ] La página de login se muestra correctamente
- [ ] El mensaje de usuario por defecto es visible
- [ ] Puedo hacer login con `admin@agua.com` / `admin123`
- [ ] Al hacer login, me redirige al Dashboard
- [ ] El nombre y rol se muestran en el header
- [ ] El token se guarda en localStorage
- [ ] Al recargar la página, sigo autenticado
- [ ] El botón de logout funciona
- [ ] Al hacer logout, me redirige al login

## 📊 Dashboard (Administrador Principal)

### Tarjetas de Estadísticas
- [ ] Se muestra "Total Pedidos" con número correcto
- [ ] Se muestra "Pendientes" con número correcto
- [ ] Se muestra "En Camino" con número correcto
- [ ] Se muestra "Entregados" con número correcto
- [ ] Se muestra "Ventas" con número correcto
- [ ] Se muestra "Donaciones" con número correcto
- [ ] Se muestra "Descuentos" con número correcto
- [ ] Se muestra "Garrafones Totales" con número correcto
- [ ] Se muestra "Pedidos Hoy" con la fecha de hoy

### Secciones Adicionales
- [ ] "Pedidos por Comunidad" muestra lista con barras de progreso
- [ ] "Pedidos por Repartidor" muestra lista con barras de progreso
- [ ] "Pedidos Recientes" muestra tarjetas de pedidos
- [ ] Los badges de estado se ven correctamente (Pendiente/En Camino/Entregado)
- [ ] Los badges de transacción se ven correctamente (Donación/Descuento)

## 📦 Gestión de Pedidos

### Formulario de Creación
- [ ] El formulario está sticky (se mantiene visible al hacer scroll)
- [ ] Dropdown de "Comunidad" muestra todas las comunidades
- [ ] Al seleccionar comunidad, se cargan los clientes
- [ ] Dropdown de "Cliente" está deshabilitado hasta seleccionar comunidad
- [ ] Dropdown de "Tipo de Transacción" tiene 3 opciones: Venta, Donación, Descuento
- [ ] Al seleccionar "Descuento", aparece el campo de porcentaje
- [ ] El campo de descuento tiene símbolo de %
- [ ] Campo de "Cantidad de Garrafones" acepta números
- [ ] Dropdown de "Estado Inicial" tiene 3 opciones
- [ ] Campo de "Notas Adicionales" es un textarea
- [ ] Botón "Crear Pedido" funciona
- [ ] Al crear pedido, el formulario se resetea
- [ ] Aparece mensaje de éxito al crear pedido

### Lista de Pedidos
- [ ] Se muestran todos los pedidos al cargar
- [ ] Hay 4 tabs de filtro: Todos, Pendientes, En Camino, Entregados
- [ ] Al hacer clic en cada tab, se filtran correctamente
- [ ] El contador en cada tab es correcto
- [ ] Cada pedido muestra:
  - [ ] Nombre del cliente
  - [ ] Comunidad
  - [ ] Dirección
  - [ ] Teléfono
  - [ ] Cantidad de garrafones
  - [ ] Fecha
  - [ ] Badge de estado
  - [ ] Badge de transacción (si aplica)
- [ ] El dropdown de "Cambiar Estado" funciona
- [ ] Al cambiar estado, se actualiza en la lista
- [ ] El botón "Eliminar" solo aparece si tengo permiso
- [ ] Al eliminar, pide confirmación
- [ ] Al eliminar, el pedido desaparece de la lista

## 👥 Gestión de Usuarios (Solo Admin Principal)

### Lista de Usuarios
- [ ] Se muestra el contador de usuarios registrados
- [ ] Cada usuario muestra:
  - [ ] Nombre
  - [ ] Email
  - [ ] Rol con badge de color
  - [ ] Fecha de creación
  - [ ] Badge "Tú" si es el usuario actual
- [ ] Hay 2 botones: Cambiar Contraseña y Desactivar
- [ ] El botón "Desactivar" NO aparece en mi propio usuario

### Crear Usuario
- [ ] El botón "Crear Usuario" abre un modal
- [ ] El modal tiene fondo oscuro
- [ ] El modal se centra en la pantalla
- [ ] Formulario tiene 4 campos: Nombre, Email, Contraseña, Rol
- [ ] Dropdown de Rol tiene 3 opciones
- [ ] Botón "Cancelar" cierra el modal
- [ ] Botón "Crear Usuario" crea el usuario
- [ ] Al crear, el modal se cierra
- [ ] El nuevo usuario aparece en la lista

### Otras Acciones
- [ ] "Cambiar Contraseña" pide nueva contraseña con prompt
- [ ] Al cambiar contraseña, aparece mensaje de éxito
- [ ] "Desactivar" pide confirmación
- [ ] Al desactivar, el usuario desaparece o se marca como inactivo

## 📋 Bitácora de Actividades

### Estadísticas
- [ ] Se muestra "Total de Registros"
- [ ] Se muestra "Inicio de Sesión"
- [ ] Se muestra "Pedidos Creados"
- [ ] Se muestra "Usuarios Creados"

### Logs por Fecha
- [ ] Los logs están agrupados por fecha
- [ ] Cada grupo muestra la fecha y contador de registros
- [ ] Cada log muestra:
  - [ ] Icono según tipo de acción
  - [ ] Nombre del usuario
  - [ ] Badge de acción
  - [ ] Detalles de la acción
  - [ ] Hora exacta (HH:MM:SS)
- [ ] Los colores de badges coinciden con el tipo de acción:
  - [ ] Azul para "Inicio de sesión"
  - [ ] Verde para "Creó pedido"
  - [ ] Rojo para "Eliminó pedido"
  - [ ] Morado para "Creó usuario"

## 🎨 Diseño y Estilos

### General
- [ ] Los colores coinciden con el diseño de Figma
- [ ] El header es azul con gradiente
- [ ] El logo de gota de agua se muestra
- [ ] La fuente es legible y profesional
- [ ] Los espacios y márgenes son consistentes

### Header
- [ ] El header tiene el logo y título
- [ ] Se muestra el nombre y rol del usuario
- [ ] El botón de logout tiene icono
- [ ] Al hacer hover, los elementos cambian de color

### Navegación
- [ ] Los tabs (Dashboard, Pedidos, Usuarios, Bitácora) se ven bien
- [ ] El tab activo tiene línea azul debajo
- [ ] Solo se muestran los tabs según permisos
- [ ] Al hacer clic, navega correctamente

### Componentes
- [ ] Los botones tienen efecto hover
- [ ] Los cards tienen sombras sutiles
- [ ] Los inputs tienen borde azul al hacer focus
- [ ] Los badges tienen colores adecuados
- [ ] Los iconos son claros y relevantes

## 🔒 Permisos y Seguridad

### Administrador Principal
- [ ] Puede acceder a Dashboard
- [ ] Puede acceder a Pedidos
- [ ] Puede acceder a Usuarios
- [ ] Puede acceder a Bitácora
- [ ] Puede crear usuarios
- [ ] Puede eliminar pedidos
- [ ] Puede cambiar contraseñas
- [ ] Puede desactivar usuarios (excepto a sí mismo)

### Administrador 2
- [ ] Puede acceder a Dashboard
- [ ] Puede acceder a Pedidos
- [ ] NO puede acceder a Usuarios
- [ ] Puede acceder a Bitácora
- [ ] Puede eliminar pedidos
- [ ] NO puede crear usuarios

### Repartidor
- [ ] NO puede acceder a Dashboard
- [ ] Puede acceder a Pedidos
- [ ] NO puede acceder a Usuarios
- [ ] NO puede acceder a Bitácora
- [ ] Puede crear pedidos
- [ ] NO puede eliminar pedidos
- [ ] Solo ve sus propios pedidos

## 📱 Responsive Design

- [ ] En pantalla grande (desktop), todo se ve bien
- [ ] En tablet, el layout se adapta
- [ ] En móvil:
  - [ ] El header se ajusta
  - [ ] Los tabs son desplazables
  - [ ] Las tarjetas se apilan verticalmente
  - [ ] Los formularios son usables
  - [ ] Los botones son fáciles de presionar

## 🐛 Manejo de Errores

- [ ] Si la API no responde, muestra mensaje de error
- [ ] Si el login falla, muestra mensaje de error
- [ ] Si un formulario está incompleto, pide los datos requeridos
- [ ] Si no tengo permisos, me redirige correctamente
- [ ] Si el token expira, me redirige al login

## 🚀 Rendimiento

- [ ] La aplicación carga rápidamente
- [ ] Las transiciones son suaves
- [ ] No hay lag al cambiar de página
- [ ] Las listas grandes se renderizan bien

## ✅ Pruebas Finales

### Flujo Completo Admin Principal
1. [ ] Login con admin@agua.com
2. [ ] Ver Dashboard con todas las estadísticas
3. [ ] Ir a Pedidos y crear un pedido de Venta
4. [ ] Cambiar el estado del pedido a "En Camino"
5. [ ] Ir a Usuarios y crear un Repartidor
6. [ ] Cambiar la contraseña de ese usuario
7. [ ] Ir a Bitácora y ver todas las acciones registradas
8. [ ] Logout

### Flujo Completo Repartidor
1. [ ] Login con cuenta de repartidor
2. [ ] Solo veo el tab de Pedidos
3. [ ] Puedo crear un pedido
4. [ ] Solo veo mis propios pedidos
5. [ ] No puedo eliminar pedidos
6. [ ] Logout

## 📝 Notas Adicionales

**Problemas encontrados:**
```
(Escribe aquí cualquier problema que encuentres)
```

**Ajustes necesarios en la API:**
```
(Anota los endpoints que necesitan cambios)
```

**Mejoras sugeridas:**
```
(Ideas para mejorar el sistema)
```

---

## 🎉 ¡Checklist Completo!

Si marcaste todos los items, ¡tu frontend está listo para producción!

**Fecha de verificación:** _______________
**Verificado por:** _______________
**Estado:** [ ] Aprobado  [ ] Requiere ajustes

---

**¿Encontraste algún bug?** Anótalo aquí y corrígelo en `src/`
