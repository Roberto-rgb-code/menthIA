# Docker Setup para MentorApp

## 🚀 Configuración rápida

### 1. Preparar variables de entorno
```bash
# Copia el archivo de ejemplo
cp .env.example .env.local

# Edita .env.local con tus valores reales
# Agrega tus keys de Firebase y AWS
```

### 2. Ejecutar con Docker Compose (Recomendado)
```bash
# Construir y ejecutar
docker compose up --build

# Ejecutar en background
docker compose up -d --build

# Ver logs
docker compose logs -f mentorapp

# Detener
docker compose down
```

### 3. Ejecutar con Docker directo
```bash
# Construir imagen
docker build --no-cache -t mentorapp .

# Ejecutar con archivo de variables
docker run -p 3000:3000 --env-file .env mentorapp

# Ejecutar con variables individuales
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key \
  -e AWS_ACCESS_KEY_ID=tu_access_key \
  mentorapp
```

## 🔧 Configuración del proyecto

### Archivos incluidos:
- `Dockerfile` - Imagen optimizada para Node.js 22
- `docker-compose.yml` - Configuración completa con networking
- `.dockerignore` - Archivos excluidos del build
- `next.config.js` - Configuración actualizada con Docker support
- `.env.example` - Template de variables de entorno

### Características optimizadas:
- ✅ **Multi-stage build** para imagen mínima
- ✅ **Node.js 22** con Alpine Linux
- ✅ **Cache de dependencias** npm optimizado
- ✅ **Variables de entorno** para Firebase y AWS
- ✅ **Three.js, GSAP, React Slick** configurados
- ✅ **Tailwind CSS v4** soporte completo
- ✅ **API rewrites** mantenidos (puerto 5000)
- ✅ **Networking** configurado para comunicación con API local

## 🌐 Acceso a la aplicación

Una vez ejecutando:
- **Frontend**: http://localhost:3000
- **API calls**: Se redirigen automáticamente a http://127.0.0.1:5000

## 🐛 Troubleshooting

### Si la API no se conecta:
1. Verifica que tu API esté corriendo en puerto 5000
2. Usa `network_mode: "host"` en docker-compose.yml
3. Cambia `127.0.0.1` por `host.docker.internal` en next.config.js si usas Docker Desktop

### Si faltan variables de entorno:
1. Verifica que `.env.local` existe
2. Asegúrate de que las variables tengan valores
3. Reinicia el contenedor después de cambios

### Para debugging:
```bash
# Acceder al contenedor
docker exec -it mentorapp_mentorapp_1 sh

# Ver logs detallados
docker compose logs -f

# Reconstruir sin cache
docker compose build --no-cache
```

## 📦 Dependencias incluidas

Tu proyecto incluye estas dependencias principales:
- **Next.js 15.2.4** con React 19
- **Firebase 11.x** para autenticación y storage
- **AWS SDK v3** para S3
- **Three.js 0.178** para gráficos 3D
- **GSAP 3.13** para animaciones
- **Tailwind CSS v4** para estilos
- **React Slick** para carruseles
- **Framer Motion** para animaciones

¡Tu aplicación está lista para producción! 🎉