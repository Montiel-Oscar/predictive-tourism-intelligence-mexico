# Motor de Inteligencia Turística · México ✦

Este proyecto es un motor predictivo y panel de visualización diseñado para analizar y pronosticar el flujo mensual de turistas internacionales a México por aeropuerto, país de origen y género.

![Dashboard Preview](docs/index.html) <!-- Nota: GitHub no renderiza HTML directamente como imagen, pero es una referencia -->

## 📊 Descripción del Proyecto

El **Motor de Inteligencia Turística** utiliza modelos de aprendizaje automático (Machine Learning) entrenados con más de 10 años de datos históricos (2012–2022) para predecir el comportamiento del turismo internacional en México para el periodo 2023–2025.

### Características principales:
- **Predicciones Detalladas:** Pronósticos por mes, aeropuerto de llegada, país de residencia y género.
- **Validación Temporal:** El modelo ha sido validado con datos reales de 2023 y 2024, alcanzando un error mediano (MAPE) de **10.8%** en segmentos de alto volumen.
- **Dashboard Interactivo:** Explorador de segmentos, mapas de calor por estado y origen, y análisis de estacionalidad.
- **Consulta IA:** Integración con modelos de lenguaje (Google Gemini) para realizar consultas naturales sobre los datos turísticos.

## 🤖 Modelos y Tecnología

### Modelos de ML
Se evaluaron múltiples algoritmos para encontrar el mejor desempeño:
- **Random Forest:** 2,000 árboles (Ganador en precisión).
- **XGBoost Tweedie:** Optimizado para datos de conteo con ceros.
- **XGBoost:** Baseline comparativo.

### Stack Tecnológico
- **Análisis de Datos:** Python, Jupyter Notebooks, Pandas, Scikit-Learn, XGBoost.
- **Backend de IA:** Python, Flask (implícito en `turismo_ai.py`), Docker, Google Gemini API.
- **Frontend:** HTML5, CSS3, JavaScript (D3.js, Chart.js, TopoJSON).

## 📂 Estructura del Repositorio

- `notebooks/`: Ciclo completo de ciencia de datos (limpieza, ingeniería de variables, integración y modelado).
- `ai_backend/`: Microservicio para la consulta de IA y despliegue del modelo.
- `docs/`: Interfaz web del dashboard (disponible vía GitHub Pages).
- `models/`: Archivos de modelos entrenados y serializados.
- `data/`: Conjuntos de datos procesados.

## 🚀 Instalación y Uso Local

### Requisitos
- Python 3.x
- Docker (opcional para el backend)
- Una API Key de Google Gemini (para la función de Consulta IA)

### Configuración del Backend
1. Navega a la carpeta `ai_backend`.
2. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   pip install python-dotenv
   ```
3. Crea un archivo `.env` con tu llave de API:
   ```env
   GEMINI_API_KEY=tu_api_key_aqui
   ```
4. Ejecuta el backend:
   - En Windows: Haz doble clic en `iniciar_ia.bat`.
   - Manualmente: `python turismo_ai.py`.

### Visualización
Puedes abrir `docs/index.html` en cualquier navegador moderno para explorar el dashboard interactivo.

## 📈 Fuente de Datos
Los datos utilizados provienen de **DATATUR** (Secretaría de Turismo de México), cubriendo la red de 66 aeropuertos internacionales y 243 países de origen.

---
Desarrollado por [Oscar Montiel](https://github.com/Montiel-Oscar)
