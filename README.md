# Kardex Inventory System

Sistema web para el procesamiento y gestión de inventarios en formato Kardex,
con cálculo automático de **Costo Promedio Ponderado**, validación de datos
y control de trazabilidad.

> 🚧 **v1.1 — En desarrollo activo**

---

## 🧱 Tecnologías

| Capa          | Tecnología                               |
| ------------- | ---------------------------------------- |
| Frontend      | React + Vite + TypeScript + Tailwind CSS |
| Backend       | FastAPI + Python                         |
| Base de datos | PostgreSQL                               |
| ORM           | SQLAlchemy + Alembic                     |
| Procesamiento | pandas + openpyxl                        |

---

## ✨ Funcionalidades

### 📦 Procesamiento Kardex

* Carga de archivos Excel de movimientos
* Cálculo automático con **Costo Promedio Ponderado (CPP)**
* Validación de integridad (Reglas A y B)
* Sistema de semáforo por fila
* Exportación a Excel con datos recalculados

---

### 🗄️ Gestión de datos (CRUD)

#### Saldos Iniciales

* Crear, editar y eliminar saldos iniciales
* Asociación automática con productos
* Cálculo automático de costo total
* Persistencia en base de datos

#### Sistema de advertencias

* Detecta si un saldo ya fue usado en procesamientos
* Permite edición sin bloqueo (enfoque no destructivo)
* Mantiene integridad del historial

---

### 📊 Historial y trazabilidad

* Registro de procesamientos realizados
* Almacenamiento persistente en PostgreSQL
* Relación entre productos, saldos y movimientos
* Reprocesamiento como mecanismo de corrección

---

### 🔎 Filtros y consulta

* Filtros por código, fecha, mes y rango
* Búsqueda de productos
* Visualización de resultados procesados

---

## 🧠 Arquitectura

El sistema sigue una arquitectura en capas:

```
Router (FastAPI)
   ↓
Service (lógica de negocio)
   ↓
Repository (acceso a datos)
   ↓
Database (PostgreSQL)
```

### Principios clave

* 🔒 **Inmutabilidad contable:** los movimientos no se editan manualmente
* ⚠️ **Advertencias en lugar de bloqueos**
* ♻️ **Correcciones mediante reprocesamiento**
* 🧩 Separación clara de responsabilidades (clean architecture)

---

## ⚙️ Instalación

### Requisitos

* Python 3.11+
* Node.js 18+
* PostgreSQL 15+

---

### 🔧 Backend

```bash
cd backend
python -m venv venv
source venv/Scripts/activate      # Windows
source venv/bin/activate         # Mac/Linux
pip install -r requirements.txt
```

Crear `.env`:

```env
DATABASE_URL=postgresql://usuario:password@localhost/kardex_db
CORS_ORIGINS=http://localhost:5173
```

Migraciones:

```bash
alembic upgrade head
```

Run:

```bash
uvicorn app.main:app --reload
```

---

### 💻 Frontend

```bash
cd frontend
npm install
```

`.env`:

```env
VITE_API_URL=http://localhost:8000
```

Run:

```bash
npm run dev
```

---

## 🗺️ Estado del desarrollo

### Backend

* [x] Modelado de base de datos
* [x] Migraciones con Alembic
* [x] Arquitectura Repository + Service
* [x] CRUD de saldos iniciales
* [x] Sistema de advertencias
* [ ] CRUD de productos (pendiente)
* [ ] Tests

### Frontend

* [x] UI base con React + Tailwind
* [x] Vista de Kardex
* [x] Historial de procesamientos
* [x] Modal de saldo inicial
* [ ] Página de gestión de saldos (CRUD completo)
* [ ] Mejoras UX/UI

---

## 🔮 Roadmap

* CRUD completo de productos
* Eliminación controlada de procesamientos
* Dashboard con métricas
* Autenticación (JWT)
* Roles y permisos
* Reportes gráficos
* Auditoría de cambios
* Soporte PEPS/FIFO

---
