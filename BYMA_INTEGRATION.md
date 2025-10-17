# Integración con BYMA API

Este proyecto integra la API de BYMA (Bolsas y Mercados Argentinos) para acceder a datos de mercado en tiempo real.

## Configuración

### 1. Obtener Credenciales

1. Accede al Portal de Desarrolladores de BYMA
2. Registra tu aplicación para obtener:
   - `client_id`
   - `client_secret`
   - Scopes/permisos necesarios

### 2. Configurar Variables de Entorno

Copia el archivo `.env.local.example` a `.env.local` y completa con tus credenciales:

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:

```env
BYMA_CLIENT_ID=tu_client_id
BYMA_CLIENT_SECRET=tu_client_secret
BYMA_SCOPE=read
BYMA_ENVIRONMENT=homologation
```

**Ambientes disponibles:**
- `homologation`: Ambiente de pruebas (hs-api.byma.com.ar)
- `production`: Ambiente productivo (api.byma.com.ar)

### 3. Reiniciar el Servidor

Después de configurar las variables de entorno, reinicia el servidor de desarrollo:

```bash
npm run dev
```

## Arquitectura

### Servicios

#### BYMAAuthService (`app/lib/byma-auth.ts`)
Maneja la autenticación OAuth 2.0 con BYMA:
- Solicitud de tokens de acceso
- Gestión del ciclo de vida del token
- Renovación automática antes de expiración
- Patrón singleton para mantener un token activo

#### BYMAMarketService (`app/lib/byma-market.ts`)
Servicio para consultar datos de mercado:
- Listado de instrumentos financieros
- Precios en tiempo real
- Detalles de instrumentos específicos
- Resumen del mercado
- Retry automático en caso de token expirado

### Endpoints API

#### GET `/api/byma/token`
Obtiene un token OAuth válido.

**Respuesta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Token obtained successfully"
}
```

#### POST `/api/byma/token`
Fuerza la renovación del token OAuth.

#### GET `/api/byma/instruments`
Lista instrumentos financieros disponibles.

**Query Parameters:**
- `symbol` (opcional): Filtrar por símbolo específico
- `market` (opcional): Filtrar por mercado
- `limit` (opcional): Limitar cantidad de resultados

**Ejemplo:**
```
GET /api/byma/instruments?market=ACCIONES&limit=10
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "GGAL",
      "description": "Grupo Financiero Galicia",
      "market": "ACCIONES",
      "price": 350.50,
      "change": 2.5,
      "volume": 1500000
    }
  ],
  "count": 10
}
```

#### GET `/api/byma/prices`
Obtiene precios actuales de mercado.

**Query Parameters:**
- `symbols` (opcional): Lista de símbolos separados por coma

**Ejemplo:**
```
GET /api/byma/prices?symbols=GGAL,YPF,PAMP
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "GGAL",
      "price": 350.50,
      "change": 2.5,
      "lastUpdate": "2024-01-15T14:30:00Z"
    }
  ],
  "count": 3,
  "timestamp": "2024-01-15T14:30:05Z"
}
```

#### GET `/api/byma/market-summary`
Obtiene un resumen general del mercado.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "instruments": [...],
    "count": 150,
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

## Uso en el Frontend

### Ejemplo con fetch

```typescript
// Obtener instrumentos
const response = await fetch('/api/byma/instruments?market=ACCIONES');
const data = await response.json();

if (data.success) {
  console.log('Instrumentos:', data.data);
}

// Obtener precios específicos
const pricesResponse = await fetch('/api/byma/prices?symbols=GGAL,YPF');
const pricesData = await pricesResponse.json();

if (pricesData.success) {
  console.log('Precios:', pricesData.data);
}
```

### Ejemplo con React

```tsx
'use client';

import { useEffect, useState } from 'react';

interface Instrument {
  symbol: string;
  description: string;
  price: number;
  change: number;
}

export default function MarketData() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/byma/instruments?market=ACCIONES&limit=10');
        const data = await response.json();

        if (data.success) {
          setInstruments(data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Mercado de Acciones</h2>
      {instruments.map(instrument => (
        <div key={instrument.symbol}>
          <strong>{instrument.symbol}</strong>: ${instrument.price}
          <span className={instrument.change > 0 ? 'text-green-600' : 'text-red-600'}>
            {instrument.change > 0 ? '+' : ''}{instrument.change}%
          </span>
        </div>
      ))}
    </div>
  );
}
```

## Manejo de Errores

El sistema implementa manejo robusto de errores:

1. **Token Expirado**: Renovación automática y reintento de solicitud
2. **Credenciales Inválidas**: Error claro con instrucciones
3. **API No Disponible**: Timeout y mensajes descriptivos
4. **Rate Limiting**: Respeta límites de la API

## Seguridad

- Las credenciales se almacenan en variables de entorno (nunca en el código)
- `.env.local` está en `.gitignore` para evitar commits accidentales
- Los tokens se manejan en el servidor (nunca se exponen al cliente)
- Todas las solicitudes al frontend van a través de API Routes de Next.js

## Testing

Para probar la integración en ambiente de homologación:

```bash
# Asegúrate de tener BYMA_ENVIRONMENT=homologation en .env.local
npm run dev

# En otra terminal, prueba los endpoints
curl http://localhost:3000/api/byma/token
curl http://localhost:3000/api/byma/instruments
curl http://localhost:3000/api/byma/prices
```

## Limitaciones Conocidas

- Los endpoints exactos pueden variar según la documentación oficial de BYMA
- Algunos datos pueden requerir permisos/scopes adicionales
- Rate limits dependen del plan contratado con BYMA

## Soporte

Para más información, consulta:
- Manual BYMA.pdf (en carpeta de Descargas del proyecto)
- Portal de Desarrolladores BYMA
- Documentación oficial de la API
