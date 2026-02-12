# 🚀 Inicio Rápido - 5 Minutos

## Paso 1: Instalar Dependencias (2 min)

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Esto instalará:
- ✅ react-router-dom (navegación)
- ✅ axios (peticiones HTTP)
- ✅ lucide-react (iconos)

## Paso 2: Verificar API (1 min)

1. Asegúrate de que tu API esté corriendo en `https://localhost:7004`
2. Abre Swagger: `https://localhost:7004/swagger/index.html`
3. Verifica que existe el endpoint `POST /api/auth/login`

**Si tu API está en otra URL:**
- Edita `src/services/api.js`
- Cambia la línea: `const API_BASE_URL = 'https://localhost:7004/api';`

## Paso 3: Configurar CORS en tu API (1 min)

Agrega esto en tu `Program.cs`:

```csharp
// Antes de builder.Build()
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins("http://localhost:5173")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Después de app
app.UseCors("AllowFrontend");
```

## Paso 4: Ejecutar Frontend (30 seg)

```bash
npm run dev
```

Se abrirá automáticamente en: `http://localhost:5173`

## Paso 5: Probar (30 seg)

1. Ve a `http://localhost:5173`
2. Usa las credenciales por defecto:
   - **Email:** `admin@agua.com`
   - **Password:** `admin123`
3. ¡Listo! Ya deberías ver el Dashboard

---

## ⚠️ Problemas Comunes

### "Error de CORS"
→ Verifica el Paso 3

### "Network Error" o "ERR_CONNECTION_REFUSED"
→ Tu API no está corriendo. Ejecuta tu backend primero.

### "Credenciales inválidas"
→ Verifica que el usuario `admin@agua.com` exista en tu base de datos

### "Cannot GET /api/..."
→ Revisa los endpoints en `src/services/api.js` vs tu Swagger

---

## 📚 Documentación Completa

- **INSTRUCCIONES.md** - Guía detallada de instalación
- **API_FORMAT.md** - Formatos de todos los endpoints
- **CHECKLIST.md** - Verificación completa del sistema
- **RESUMEN.md** - Resumen del proyecto completo

---

## 🎯 ¿Todo Funcionó?

Si ves el Dashboard con las estadísticas, ¡felicidades! 🎉

Ahora puedes:
- ✅ Crear pedidos
- ✅ Gestionar usuarios
- ✅ Ver la bitácora
- ✅ Explorar todas las funcionalidades

---

**Tiempo total:** ~5 minutos ⏱️
