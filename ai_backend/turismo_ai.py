from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
import pandas as pd
import os
from dotenv import load_dotenv


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Carga las variables ocultas del archivo .env
load_dotenv() 

# ── CONFIGURACIÓN LOCAL ──────────────────────────────────────────────
API_KEY = os.getenv("GEMINI_API_KEY")
CSV_PATH = "https://raw.githubusercontent.com/Montiel-Oscar/predictive-tourism-intelligence-mexico/refs/heads/main/models/random_forest/predicciones_rf.csv"
df = pd.read_csv(CSV_PATH)
client = genai.Client(api_key=API_KEY)

print("Cargando CSV y limpiando columnas...")
try:
    df = pd.read_csv(CSV_PATH)
    df = df.rename(columns={'Año': 'Ano', 'Región': 'Region'})
    print(f"Listo: {len(df):,} filas. Columnas: {list(df.columns)}")
except Exception as e:
    print(f"Error al cargar el CSV: {e}")
    df = pd.DataFrame()

# ── LA HERRAMIENTA MAESTRA (Filtra y Agrupa dinámicamente) ─────────────
def analizar_datos(aeropuerto: str = None, pais: str = None, 
                   ano: int = None, mes: int = None, sexo: str = None, 
                   agrupar_por: list = None, top_n: int = 5):
    """Filtra y agrupa el dataframe dinámicamente según lo pida Gemini."""
    if df.empty: return {"resultado": "Base de datos no disponible."}
    f = df.copy()
    
    # 1. Filtros
    if aeropuerto: f = f[f["Aeropuerto"].str.contains(aeropuerto, case=False, na=False)]
    if pais:       f = f[f["Pais"].str.contains(pais, case=False, na=False)]
    if sexo:       f = f[f["Sexo"].str.lower() == sexo.lower()]
    if ano:        f = f[f["Ano"] == ano]
    if mes:        f = f[f["MesNum"] == mes]
    
    if f.empty:    return {"resultado": "Sin datos para estos filtros."}
    
    # 2. Agrupación Dinámica
    cols_validas = ["Aeropuerto", "Pais", "Ano", "MesNum", "Sexo"]
    agrupar_real = [c for c in (agrupar_por or []) if c in cols_validas]
    
    if agrupar_real:
        agg = f.groupby(agrupar_real)["Prediccion_RF"].sum().reset_index()
    else:
        agg = f

    # 3. Orden y Límite
    agg = agg.sort_values("Prediccion_RF", ascending=False).head(top_n)
    agg["Prediccion_RF"] = agg["Prediccion_RF"].round(0).astype(int)
    
    return {"resultado": agg.to_dict(orient="records")}

FUNCIONES = {"analizar_datos": analizar_datos}

# ── DEFINICIÓN DE LA HERRAMIENTA PARA GEMINI ─────────────────────────
TOOLS = [
    types.Tool(function_declarations=[
        types.FunctionDeclaration(
            name="analizar_datos",
            description="Herramienta principal de análisis. Filtra la base de datos de turismo y la AGRUPA para obtener resúmenes, tops o tendencias.",
            parameters=types.Schema(
                type="OBJECT",
                properties={
                    "aeropuerto": types.Schema(type="STRING"),
                    "pais":       types.Schema(type="STRING"),
                    "ano":        types.Schema(type="INTEGER"),
                    "mes":        types.Schema(type="INTEGER"),
                    "sexo":       types.Schema(type="STRING"),
                    "top_n":      types.Schema(type="INTEGER", description="Cuántos resultados devolver"),
                    "agrupar_por": types.Schema(
                        type="ARRAY",
                        items=types.Schema(type="STRING"),
                        description="¡CRÍTICO! Qué columnas sumar. Si el usuario pide 'Top 5 países', envía ['Pais']. Si pide 'estacionalidad o por mes', envía ['MesNum']. Si pide comparar años, envía ['Ano']."
                    ),
                }
            )
        )
    ])
]

CONFIG = types.GenerateContentConfig(
    system_instruction="""Eres un Científico de Datos experto analizando turismo en México.
Tu única fuente de información es la herramienta 'analizar_datos'.
REGLA DE ORO: Si te piden un "Top de Países", DEBES usar agrupar_por=['Pais']. 
Si te piden comparar hombres y mujeres, usa agrupar_por=['Sexo'].
Si te piden tendencias en el año, usa agrupar_por=['MesNum'].
Responde de forma natural, ejecutiva, resumiendo los hallazgos numéricos en español.""",
    tools=TOOLS,
)

# ── ENDPOINT ─────────────────────────────────────────────────────────
@app.post("/chat")
async def chat(body: dict):
    try:
        pregunta  = body.get("pregunta", "")
        historial = body.get("historial", [])

        contents = []
        for h in historial:
            contents.append(types.Content(
                role=h["role"],
                parts=[types.Part(text=p["text"]) for p in h["parts"]]
            ))
        contents.append(types.Content(role="user", parts=[types.Part(text=pregunta)]))

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=CONFIG,
        )

        part = response.candidates[0].content.parts[0]

        if hasattr(part, "function_call") and part.function_call:
            fn_name = part.function_call.name
            fn_args = dict(part.function_call.args)
            
            if "agrupar_por" in fn_args and not isinstance(fn_args["agrupar_por"], list):
                fn_args["agrupar_por"] = [fn_args["agrupar_por"]]

            print(f"Gemini ejecutando análisis: {fn_args}")
            resultado = FUNCIONES[fn_name](**fn_args)

            contents.append(types.Content(role="model", parts=[types.Part(function_call=part.function_call)]))
            contents.append(types.Content(
                role="user",
                parts=[types.Part(function_response=types.FunctionResponse(name=fn_name, response=resultado))]
            ))

            response2 = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=contents,
                config=CONFIG,
            )
            return {"respuesta": response2.text, "fn_usada": fn_name}

        return {"respuesta": response.text}

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return {"respuesta": f"Experimenté un fallo técnico. Reformula tu pregunta. (Error: {str(e)})"}

@app.get("/health")
async def health():
    return {"status": "ok", "filas": len(df)}