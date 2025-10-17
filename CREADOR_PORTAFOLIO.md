# Creador de Portafolios VetaCap

## Descripción

Sistema completo para crear, analizar y exportar portafolios de inversión con diseño profesional VetaCap. Incluye análisis inteligente con Claude AI y exportación a PDF de alta calidad.

---

## 🎯 Características Principales

### ✅ Configuración de Cliente
- Nombre del cliente personalizado
- Selección de perfil de riesgo:
  - **Conservador**: Prioriza preservación del capital con menor volatilidad
  - **Moderado**: Balance entre crecimiento y estabilidad
  - **Dinámico**: Busca máximo crecimiento asumiendo mayor riesgo

### ✅ Gestión de Instrumentos
- Agregar instrumentos con:
  - Símbolo (ticker) - Ej: GGAL, YPF, etc.
  - Nombre completo del instrumento
  - Porcentaje de asignación
  - Categoría opcional (Acciones, Bonos, CEDEARs, etc.)
- Validación automática de suma al 100%
- Visualización en tiempo real con gráfico de torta
- Eliminación individual de instrumentos

### ✅ Análisis con IA (Claude)
Genera análisis profesional que incluye:

1. **Resumen Ejecutivo**
   - Evaluación general de la cartera
   - Alineación con perfil de riesgo
   - Visión general de la estrategia

2. **Análisis Detallado de Instrumentos**
   - Descripción profesional de cada activo
   - Sector y características principales
   - Análisis de riesgos
   - Oportunidades potenciales

3. **Contexto de Mercado y Noticias**
   - Últimas tendencias relevantes
   - Noticias del mercado argentino
   - Contexto económico (tasas, inflación, etc.)

4. **Recomendaciones Profesionales**
   - Sugerencias de diversificación
   - Consideraciones de rebalanceo
   - Alertas importantes

### ✅ Exportación a PDF Profesional

El PDF generado incluye:

**Página 1 - Portada y Resumen:**
- Logo VetaCap con diseño corporativo
- Información del cliente
- Perfil de riesgo
- Tabla de composición de cartera
- Resumen ejecutivo

**Página 2 - Análisis Detallado:**
- Análisis completo de cada instrumento
- Descripción profesional
- Sectores y categorías
- Riesgos y oportunidades

**Página 3 - Noticias y Recomendaciones:**
- Contexto de mercado actualizado
- Noticias relevantes para la cartera
- Recomendaciones finales

**Diseño Profesional:**
- Colores corporativos VetaCap
- Logo y marca de agua
- Pie de página en todas las páginas
- Numeración automática
- Tipografía profesional

---

## 🚀 Cómo Usar

### 1. Configurar Variables de Entorno

Necesitas una API key de Anthropic para el análisis con IA:

```bash
# Editar .env.local
ANTHROPIC_API_KEY=tu_clave_de_anthropic
```

Obtén tu API key en: https://console.anthropic.com/

### 2. Acceder al Creador

Navega a: **http://localhost:3001/portfolio/creator**

O desde la página principal:
- Clic en "Crear Portafolio" (botón azul principal)

### 3. Configurar Cliente

1. Ingresa el nombre del cliente
2. Selecciona el perfil de riesgo apropiado:
   - Conservador (menor riesgo)
   - Moderado (riesgo balanceado)
   - Dinámico (mayor riesgo)

### 4. Agregar Instrumentos

Para cada instrumento:
1. **Símbolo**: Ticker del instrumento (Ej: GGAL, YPF, AL30)
2. **Porcentaje**: Asignación en la cartera (0-100%)
3. **Nombre**: Nombre completo (Ej: Grupo Financiero Galicia)
4. **Categoría** (opcional): Tipo de activo (Acciones, Bonos, etc.)

**Ejemplo de instrumentos:**
- GGAL - Grupo Financiero Galicia - 25% - Acciones
- YPF - YPF S.A. - 20% - Acciones
- AL30 - Boncer 2030 - 30% - Bonos Soberanos
- CEDEAR AAPL - Apple Inc. - 15% - CEDEARs
- MELI - MercadoLibre - 10% - Acciones

### 5. Validar Cartera

Asegúrate de que:
- ✅ La suma total sea exactamente 100%
- ✅ Todos los instrumentos tengan información completa
- ✅ Los porcentajes sean razonables

El sistema te mostrará el total en tiempo real y validará automáticamente.

### 6. Generar Análisis

1. Clic en **"Generar Análisis con IA"**
2. Espera mientras Claude analiza la cartera (10-30 segundos)
3. Revisa el análisis completo:
   - Resumen ejecutivo
   - Análisis de cada instrumento
   - Noticias y contexto
   - Recomendaciones

### 7. Exportar a PDF

1. Clic en **"Exportar a PDF"** (botón verde)
2. El navegador descargará automáticamente el PDF
3. Nombre del archivo: `VetaCap_Portfolio_[Cliente]_[Fecha].pdf`

---

## 📊 Ejemplo de Uso Completo

### Caso: Cartera Moderada para Juan Pérez

**Datos del Cliente:**
- Nombre: Juan Pérez
- Perfil: Moderado

**Instrumentos:**
1. GGAL - Grupo Financiero Galicia - 20% - Acciones
2. YPF - YPF S.A. - 15% - Acciones
3. PAMP - Pampa Energía - 15% - Acciones
4. AL30 - Boncer 2030 - 25% - Bonos Soberanos
5. AY24 - Boncer 2024 - 15% - Bonos Soberanos
6. CEDEAR AAPL - Apple Inc. - 10% - CEDEARs

**Total: 100%** ✅

**Resultado:**
- Análisis detallado de cada posición
- Evaluación de riesgos y oportunidades
- Noticias del mercado argentino
- PDF profesional listo para enviar al cliente

---

## 🎨 Diseño del PDF

### Colores Corporativos VetaCap

- **Azul Impulso (#1036E2)**: Títulos y destacados
- **Azul Respaldo (#021751)**: Encabezados y fondos
- **Verde Activo (#00C600)**: Acentos y elementos positivos
- **Gris (#808080)**: Texto secundario

### Elementos de Diseño

1. **Encabezado Principal**
   - Logo VetaCap
   - Línea verde característica
   - Fondo azul respaldo

2. **Tablas Profesionales**
   - Filas alternadas para mejor lectura
   - Encabezados destacados
   - Alineación perfecta

3. **Secciones Diferenciadas**
   - Títulos con iconos
   - Separadores visuales
   - Espaciado consistente

4. **Pie de Página**
   - Tagline: "VetaCap | El foco está en vos"
   - Numeración de páginas
   - Nota de confidencialidad

---

## 🔧 Configuración Técnica

### Archivos Principales

```
app/
├── portfolio/
│   └── creator/
│       └── page.tsx              # Interfaz principal del creador
├── api/
│   └── portfolio/
│       ├── analyze/
│       │   └── route.ts          # Endpoint de análisis con IA
│       └── export-pdf/
│           └── route.ts          # Endpoint de exportación PDF
├── lib/
│   └── types/
│       └── portfolio.ts          # Tipos y definiciones
└── components/                   # Componentes reutilizables
```

### Dependencias

```json
{
  "@anthropic-ai/sdk": "^latest",     // Claude AI
  "jspdf": "^latest",                 // Generación de PDF
  "recharts": "^latest",              // Gráficos
  "html2canvas": "^latest"            // Captura de gráficos
}
```

### Variables de Entorno Requeridas

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-xxxxx...
```

---

## 🌟 Casos de Uso

### 1. Asesor Financiero → Cliente
- Crea propuesta de inversión personalizada
- Genera análisis profesional con IA
- Exporta PDF con marca propia
- Envía por email al cliente

### 2. Presentación de Cartera
- Muestra distribución visual atractiva
- Explica cada instrumento profesionalmente
- Incluye contexto de mercado actualizado
- Documento formal para firmas

### 3. Seguimiento de Clientes
- Documenta estrategia inicial
- Compara con carteras futuras
- Tracking de rebalanceos
- Historial profesional

### 4. Análisis Interno
- Evaluación rápida de propuestas
- Validación de perfiles de riesgo
- Revisión de diversificación
- Training de equipo

---

## ⚡ Tips y Mejores Prácticas

### Composición de Cartera

✅ **Conservador:**
- 60-70% Bonos
- 20-30% Acciones de primera línea
- 0-10% Alternativos

✅ **Moderado:**
- 40-50% Bonos
- 40-50% Acciones
- 0-10% CEDEARs/Alternativos

✅ **Dinámico:**
- 20-30% Bonos
- 50-60% Acciones
- 10-20% CEDEARs/Crecimiento

### Instrumentos Comunes (Argentina)

**Acciones:**
- GGAL, YPF, PAMP, TXAR, BMA, COME, ALUA, etc.

**Bonos Soberanos:**
- AL30, AL29, AE38, GD30, GD29, etc.

**Bonos Corporativos:**
- YPFD, PAMPA, TGSU4, etc.

**CEDEARs:**
- AAPL (Apple), GOOGL (Google), MELI (MercadoLibre), etc.

### Categorías Sugeridas

- Acciones Argentinas
- Acciones Internacionales (CEDEARs)
- Bonos Soberanos
- Bonos Corporativos
- ETFs
- Fondos Comunes de Inversión
- Efectivo/Money Market

---

## 🐛 Solución de Problemas

### Error: "ANTHROPIC_API_KEY no configurada"
**Solución:** Agrega la API key en `.env.local` y reinicia el servidor

### Error: "La suma no es 100%"
**Solución:** Verifica que los porcentajes sumen exactamente 100.00%

### El análisis tarda mucho
**Solución:** Normal para carteras grandes. Claude puede tomar 30-60 segundos.

### El PDF no se descarga
**Solución:**
1. Verifica que el análisis se haya generado primero
2. Revisa la consola del navegador para errores
3. Prueba con otro navegador

### Error en generación de PDF
**Solución:** Revisa que `jspdf` esté instalado: `npm install jspdf`

---

## 📈 Próximas Mejoras Sugeridas

- [ ] Integración con BYMA API para precios en tiempo real
- [ ] Gráficos adicionales (histórico, comparativas)
- [ ] Múltiples idiomas (EN, PT)
- [ ] Plantillas de PDF personalizables
- [ ] Guardar carteras en base de datos
- [ ] Comparación entre carteras
- [ ] Alertas de rebalanceo automático
- [ ] Firma digital en PDFs
- [ ] Integración con CRM

---

## 📞 Soporte

Para consultas o problemas:
- Revisar este documento
- Consultar logs en consola del navegador
- Verificar variables de entorno
- Reintentar con datos más simples

---

**VetaCap | El foco está en vos**

*Documentación actualizada: 2025-10-17*
