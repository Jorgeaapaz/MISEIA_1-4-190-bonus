# Retrospectiva de Sesión — 2026-04-23
### BondVault — Implementación completa de aplicación de gestión de deuda corporativa

---

## Resumen / Overview

Se implementó desde cero la aplicación **BondVault**, una plataforma institucional para gestión de bonos corporativos, partiendo de un proyecto Next.js base (Create Next App). La sesión cubrió la totalidad de los 9 módulos definidos en `AGENTS.md`: autenticación por magic link, estructuración de bonos, bookbuilding, pagos automatizados, compliance, screener de bonos, dashboard de portafolio y alertas de riesgo.

**Resultado:** Build de producción exitoso — 21 rutas compiladas sin errores TypeScript.

---

## Proceso de instalación / Installation

```bash
# Instalar dependencias adicionales sobre el proyecto base
npm install mongodb jsonwebtoken nodemailer @aws-sdk/client-s3 @types/jsonwebtoken @types/nodemailer --legacy-peer-deps
```

Dependencias resultantes:
- `mongodb ^7.2.0` — driver nativo para MongoDB
- `jsonwebtoken ^9.0.3` — firma y verificación de JWT
- `nodemailer ^8.0.5` — envío de emails via MailHog
- `@aws-sdk/client-s3 ^3.1036.0` — almacenamiento en RustFS/S3

---

## Archivos creados / Files Created

### Infraestructura (lib/)
| Archivo | Propósito |
|---------|-----------|
| `lib/types.ts` | Todas las interfaces TypeScript del dominio (User, Bond, Order, Payment, Holding, Alert, ComplianceDocument, JwtPayload) |
| `lib/db.ts` | Singleton MongoDB — `getDb()` y `getCollection<T>()` |
| `lib/auth.ts` | JWT server-side: `signToken`, `verifyToken`, `generateMagicToken` |
| `lib/auth-client.ts` | Decode JWT en cliente (sin secreto, solo lectura de payload base64) |
| `lib/payments.ts` | Cálculos financieros: cupón por período, fechas de pago, YTM aproximado |
| `lib/email.ts` | Envío de magic links via MailHog (nodemailer) |

### Auth & Estado global
| Archivo | Propósito |
|---------|-----------|
| `context/AuthContext.tsx` | Contexto global de autenticación — token en `localStorage`, sin cookies |
| `app/api/auth/send/route.ts` | `POST` — genera token, invalida anteriores, envía email |
| `app/api/auth/verify/route.ts` | `POST` — valida token, devuelve JWT firmado |
| `app/login/page.tsx` | Formulario de acceso por magic link |
| `app/auth/verify/page.tsx` | Página de verificación del token desde URL |

### API Routes
| Ruta | Métodos | Descripción |
|------|---------|-------------|
| `/api/bonds` | GET, POST | Listado con filtros, creación (admin) |
| `/api/bonds/[id]` | GET, PATCH, DELETE | Operaciones por ID |
| `/api/orders` | GET, POST | Órdenes + schedule automático de pagos |
| `/api/payments` | GET, PATCH | Listado y procesamiento de pagos |
| `/api/portfolio` | GET | Holdings enriquecidos + pagos próximos e históricos |
| `/api/alerts` | GET, PATCH | Alertas del inversor + marcar como leída |
| `/api/compliance` | GET, POST | Documentos de cumplimiento |

### Páginas Admin
| Ruta | Módulo |
|------|--------|
| `/admin/bonds` | Estructuración de bonos — tabla + formulario de creación |
| `/admin/orderbook` | Libro de órdenes (Bookbuilding) |
| `/admin/payments` | Pagos automatizados — procesar cupones y principal |
| `/admin/compliance` | Portal de reportes — generar documentos fiscales |

### Páginas Inversor
| Ruta | Módulo |
|------|--------|
| `/investor/screener` | Screener con filtros + compra de bonos (modal) |
| `/investor/dashboard` | Dashboard de portafolio con stats, holdings, pagos |
| `/investor/alerts` | Alertas de riesgo con filtros por tipo y severidad |

### UI & Layout
| Archivo | Propósito |
|---------|-----------|
| `app/globals.css` | Sistema de diseño completo: dark theme, cards, badges, tablas, modales, botones |
| `app/layout.tsx` | Root layout con `AuthProvider` y metadata |
| `app/page.tsx` | Landing page con hero, feature cards y stats |
| `components/ui/Navbar.tsx` | Nav responsivo con enlaces por rol (admin/investor) |
| `app/admin/layout.tsx` | Guard de autenticación y rol para rutas admin |
| `app/investor/layout.tsx` | Guard de autenticación para rutas de inversor |

### Scripts
| Archivo | Propósito |
|---------|-----------|
| `scripts/seed.ts` | Pobla la BD con usuarios, bonos reales y alertas |

---

## Comandos ejecutados / Commands Run

```bash
# Instalar paquetes
npm install mongodb jsonwebtoken nodemailer @aws-sdk/client-s3 \
  @types/jsonwebtoken @types/nodemailer --legacy-peer-deps

# Verificar tipos TypeScript
npx tsc --noEmit

# Build de producción
npm run build
```

---

## Levantar y detener la aplicación / Running & Stopping

### Prerequisitos de infraestructura

Antes de iniciar la app, los siguientes servicios deben estar corriendo:

```bash
# MongoDB (debe escuchar en localhost:27017)
# MailHog (debe escuchar en localhost:1027 SMTP / localhost:8025 UI)
# RustFS/MinIO (debe escuchar en localhost:10000)
```

### Poblar la base de datos (primera vez)

```bash
cd /d/Master-IA-Dev/04-Bloque4/1-4-190-bonus/bonus
npm run seed
```

Usuarios creados por el seed:
| Email | Rol | Contraseña |
|-------|-----|------------|
| `admin@bondvault.io` | admin | (magic link) |
| `investor1@example.com` | investor | (magic link) |
| `investor2@example.com` | investor | (magic link) |

### Iniciar en desarrollo

```bash
npm run dev
# App disponible en http://localhost:3000
```

### Build y producción

```bash
npm run build
npm start
```

### Detener

```bash
# Ctrl+C en la terminal donde corre next dev / next start
```

---

## Configuración de red / Network Configuration

Esta es una aplicación local en Windows — no requiere NAT ni port forwarding de VirtualBox. Todos los servicios se conectan vía `localhost`.

| Servicio | Host | Puerto |
|----------|------|--------|
| Next.js app | localhost | 3000 |
| MongoDB | localhost | 27017 |
| MailHog SMTP | localhost | 1027 |
| MailHog UI | localhost | 8025 |
| RustFS/S3 | localhost | 10000 |

---

## URLs de prueba / Test URLs

```
http://localhost:3000              → Landing page
http://localhost:3000/login        → Acceso por magic link
http://localhost:3000/auth/verify?token=<TOKEN>  → Verificación de token

# Admin (requiere login como admin@bondvault.io)
http://localhost:3000/admin/bonds
http://localhost:3000/admin/orderbook
http://localhost:3000/admin/payments
http://localhost:3000/admin/compliance

# Inversor (requiere login como investor1@example.com)
http://localhost:3000/investor/screener
http://localhost:3000/investor/dashboard
http://localhost:3000/investor/alerts

# MailHog (ver emails con magic links)
http://localhost:8025
```

### Pruebas de API con curl

```bash
# Solicitar magic link
curl -X POST http://localhost:3000/api/auth/send \
  -H "Content-Type: application/json" \
  -d '{"email":"investor1@example.com","name":"Carlos"}'

# Verificar token (token viene del email en MailHog)
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"<TOKEN_DEL_EMAIL>"}'

# Listar bonos (respuesta pública)
curl http://localhost:3000/api/bonds

# Listar bonos con filtro por sector
curl "http://localhost:3000/api/bonds?sector=energy"

# Comprar bono (con JWT del paso anterior)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"bondId":"<BOND_ID>","quantity":5}'

# Ver portafolio
curl http://localhost:3000/api/portfolio \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Ver alertas
curl http://localhost:3000/api/alerts \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## Convenciones clave / Key Conventions

- **Dinero:** Siempre en **centavos** (enteros) en BD y cómputos. Display: `cents / 100` formateado como MXN.
- **Tasa de cupón:** En **puntos base** (e.g. `875` = 8.75%). Display: `bp / 100`%.
- **Auth:** JWT en `localStorage` con key `bv_token`. Sin cookies. Header `Authorization: Bearer <token>`.
- **Roles:** `admin` → rutas `/admin/*`; `investor` → rutas `/investor/*`. Redirección automática si el rol no coincide.
- **API errors:** Siempre `{ error: string }` con HTTP status apropiado.
- **Server Components** hacen queries directos a MongoDB. **Client Components** llaman a API routes.

---

## Problemas encontrados / Problems & Solutions

| Problema | Solución |
|----------|----------|
| `RouteContext` no encontrado en TypeScript (Next.js 16 lo genera en `next dev/build`) | Reemplazado con tipo explícito `{ params: Promise<{ id: string }> }` |
| Error de tipo en array mixto de `PaymentType` (`coupon` y `principal`) | Declarar el array como `PaymentDoc[]` y usar `as PaymentType` en cada literal |
| `getCollection<T>` falla constraint `Document` de MongoDB | Agregar `T extends Document` en la firma de la función |

---

## Resultados y conclusiones / Results & Conclusions

**Lo que funcionó:**
- Build limpio en primera iteración (tras 3 fixes de TypeScript menores)
- La arquitectura de `lib/db.ts` singleton funciona bien con Next.js App Router
- El flujo completo de magic link (send → email → verify → JWT → localStorage) es sólido
- El seed crea datos realistas (PEMEX, Banorte, FEMSA, AMX, Gruma) que permiten probar todos los módulos

**Pendiente para próximas sesiones:**
- Tests E2E con Playwright (registro, login, compra de bono)
- Tests unitarios Jest para `lib/payments.ts` (couponPerPeriod, ytm, paymentDates)
- Integración real de S3/RustFS para descarga de PDFs de compliance
- WebSocket o polling para actualización en tiempo real del Order Book
- CI pipeline (GitHub Actions) para ejecutar tests automáticamente
