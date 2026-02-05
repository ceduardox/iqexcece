import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MessageSquare, GraduationCap, Building, Briefcase, MapPin, ChevronDown } from "lucide-react";

const COUNTRY_DATA: Record<string, { flag: string; code: string; states: string[] }> = {
  BO: { flag: "🇧🇴", code: "+591", states: ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", "Chuquisaca", "Tarija", "Beni", "Pando"] },
  AR: { flag: "🇦🇷", code: "+54", states: ["Buenos Aires", "Córdoba", "Santa Fe", "Mendoza", "Tucumán", "Entre Ríos", "Salta", "Misiones", "Chaco", "Corrientes", "Santiago del Estero", "San Juan", "Jujuy", "Río Negro", "Neuquén", "Formosa", "Chubut", "San Luis", "Catamarca", "La Rioja", "La Pampa", "Santa Cruz", "Tierra del Fuego"] },
  PE: { flag: "🇵🇪", code: "+51", states: ["Lima", "Arequipa", "La Libertad", "Piura", "Cusco", "Junín", "Lambayeque", "Cajamarca", "Puno", "Áncash", "Loreto", "Ica", "San Martín", "Huánuco", "Ayacucho", "Ucayali", "Apurímac", "Amazonas", "Tacna", "Pasco", "Tumbes", "Huancavelica", "Moquegua", "Madre de Dios", "Callao"] },
  CO: { flag: "🇨🇴", code: "+57", states: ["Bogotá", "Antioquia", "Valle del Cauca", "Cundinamarca", "Atlántico", "Santander", "Bolívar", "Nariño", "Córdoba", "Tolima", "Cauca", "Norte de Santander", "Huila", "Boyacá", "Risaralda", "Magdalena", "Cesar", "Meta", "Caldas", "Sucre", "Quindío", "La Guajira", "Caquetá", "Casanare", "Putumayo", "Chocó", "Arauca", "Amazonas", "Guaviare", "Vichada", "San Andrés", "Vaupés", "Guainía"] },
  EC: { flag: "🇪🇨", code: "+593", states: ["Pichincha", "Guayas", "Azuay", "Manabí", "El Oro", "Tungurahua", "Los Ríos", "Loja", "Chimborazo", "Imbabura", "Esmeraldas", "Cotopaxi", "Santo Domingo", "Santa Elena", "Cañar", "Carchi", "Sucumbíos", "Bolívar", "Morona Santiago", "Zamora Chinchipe", "Napo", "Orellana", "Pastaza", "Galápagos"] },
  CL: { flag: "🇨🇱", code: "+56", states: ["Santiago", "Valparaíso", "Biobío", "Maule", "La Araucanía", "O'Higgins", "Coquimbo", "Antofagasta", "Los Lagos", "Atacama", "Tarapacá", "Los Ríos", "Ñuble", "Arica y Parinacota", "Magallanes", "Aysén"] },
  MX: { flag: "🇲🇽", code: "+52", states: ["Ciudad de México", "Estado de México", "Jalisco", "Veracruz", "Puebla", "Guanajuato", "Chiapas", "Nuevo León", "Michoacán", "Oaxaca", "Chihuahua", "Guerrero", "Tamaulipas", "Baja California", "Sinaloa", "Coahuila", "Hidalgo", "Sonora", "San Luis Potosí", "Tabasco", "Yucatán", "Querétaro", "Morelos", "Durango", "Zacatecas", "Quintana Roo", "Aguascalientes", "Tlaxcala", "Nayarit", "Campeche", "Colima", "Baja California Sur"] },
  ES: { flag: "🇪🇸", code: "+34", states: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao", "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón", "Hospitalet", "La Coruña", "Vitoria", "Granada", "Elche"] },
  US: { flag: "🇺🇸", code: "+1", states: ["California", "Texas", "Florida", "New York", "Pennsylvania", "Illinois", "Ohio", "Georgia", "North Carolina", "Michigan", "New Jersey", "Virginia", "Washington", "Arizona", "Massachusetts", "Tennessee", "Indiana", "Maryland", "Missouri", "Wisconsin", "Colorado", "Minnesota", "South Carolina", "Alabama", "Louisiana", "Kentucky", "Oregon", "Oklahoma", "Connecticut", "Utah", "Iowa", "Nevada", "Arkansas", "Mississippi", "Kansas", "New Mexico", "Nebraska", "Idaho", "West Virginia", "Hawaii", "New Hampshire", "Maine", "Montana", "Rhode Island", "Delaware", "South Dakota", "North Dakota", "Alaska", "Vermont", "Wyoming"] },
  BR: { flag: "🇧🇷", code: "+55", states: ["São Paulo", "Rio de Janeiro", "Minas Gerais", "Bahia", "Paraná", "Rio Grande do Sul", "Pernambuco", "Ceará", "Pará", "Santa Catarina", "Maranhão", "Goiás", "Amazonas", "Paraíba", "Espírito Santo", "Rio Grande do Norte", "Alagoas", "Piauí", "Mato Grosso", "Distrito Federal", "Mato Grosso do Sul", "Sergipe", "Rondônia", "Tocantins", "Acre", "Amapá", "Roraima"] },
  VE: { flag: "🇻🇪", code: "+58", states: ["Distrito Capital", "Miranda", "Zulia", "Carabobo", "Lara", "Aragua", "Bolívar", "Táchira", "Mérida", "Anzoátegui", "Falcón", "Portuguesa", "Barinas", "Monagas", "Yaracuy", "Guárico", "Sucre", "Trujillo", "Nueva Esparta", "Cojedes", "Apure", "Delta Amacuro", "Amazonas", "Vargas"] },
  PY: { flag: "🇵🇾", code: "+595", states: ["Asunción", "Central", "Alto Paraná", "Itapúa", "Caaguazú", "San Pedro", "Cordillera", "Paraguarí", "Guairá", "Caazapá", "Misiones", "Ñeembucú", "Amambay", "Canindeyú", "Pdte. Hayes", "Concepción", "Alto Paraguay", "Boquerón"] },
  UY: { flag: "🇺🇾", code: "+598", states: ["Montevideo", "Canelones", "Maldonado", "Salto", "Colonia", "Paysandú", "Rivera", "San José", "Tacuarembó", "Cerro Largo", "Soriano", "Rocha", "Artigas", "Florida", "Lavalleja", "Durazno", "Treinta y Tres", "Flores", "Río Negro"] },
};

const COUNTRIES = Object.entries(COUNTRY_DATA).map(([code, data]) => ({
  code,
  flag: data.flag,
  phoneCode: data.code,
  name: code === "BO" ? "Bolivia" : code === "AR" ? "Argentina" : code === "PE" ? "Perú" : code === "CO" ? "Colombia" : code === "EC" ? "Ecuador" : code === "CL" ? "Chile" : code === "MX" ? "México" : code === "ES" ? "España" : code === "US" ? "Estados Unidos" : code === "BR" ? "Brasil" : code === "VE" ? "Venezuela" : code === "PY" ? "Paraguay" : "Uruguay"
}));

export interface FormDataType {
  nombre: string;
  email: string;
  edad: string;
  telefono: string;
  comentario: string;
  grado: string;
  institucion: string;
  tipoEstudiante: string;
  semestre: string;
  esProfesional: boolean | null;
  profesion: string;
  ocupacion: string;
  lugarTrabajo: string;
  pais: string;
  codigoPais: string;
  estado: string;
}

interface Props {
  categoria: string;
  onSubmit: (data: FormDataType) => Promise<void>;
  submitting: boolean;
  buttonText?: string;
  title?: string;
  subtitle?: string;
}

export function TestFormUnified({ categoria, onSubmit, submitting, buttonText = "Ver mis resultados", title = "Complete tus datos", subtitle = "Completa el formulario para continuar" }: Props) {
  const [formData, setFormData] = useState<FormDataType>({
    nombre: "",
    email: "",
    edad: "",
    telefono: "",
    comentario: "",
    grado: "",
    institucion: "",
    tipoEstudiante: "",
    semestre: "",
    esProfesional: null,
    profesion: "",
    ocupacion: "",
    lugarTrabajo: "",
    pais: "BO",
    codigoPais: "+591",
    estado: "",
  });

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(data => {
        const countryCode = data.country_code || "BO";
        const countryData = COUNTRY_DATA[countryCode] || COUNTRY_DATA["BO"];
        setFormData(prev => ({
          ...prev,
          pais: countryCode,
          codigoPais: countryData.code,
        }));
      })
      .catch(() => {});
  }, []);

  const handleChange = (field: keyof FormDataType, value: string | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "pais" && typeof value === "string") {
      const countryData = COUNTRY_DATA[value];
      if (countryData) {
        setFormData(prev => ({ ...prev, pais: value, codigoPais: countryData.code, estado: "" }));
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.nombre.trim()) return;
    onSubmit(formData);
  };

  const isNino = categoria === "ninos" || categoria === "preescolar";
  const isAdolescente = categoria === "adolescentes";
  const isProfesional = categoria === "profesionales" || categoria === "adulto_mayor";
  const isUniversitario = categoria === "universitarios";

  const gradosPrimaria = ["1ero Primaria", "2do Primaria", "3ero Primaria", "4to Primaria", "5to Primaria", "6to Primaria"];
  const gradosSecundaria = ["1ero Secundaria", "2do Secundaria", "3ero Secundaria", "4to Secundaria", "5to Secundaria", "6to Secundaria"];
  const semestres = ["1er Semestre", "2do Semestre", "3er Semestre", "4to Semestre", "5to Semestre", "6to Semestre", "7mo Semestre", "8vo Semestre", "9no Semestre", "10mo Semestre"];

  const currentCountry = COUNTRY_DATA[formData.pais] || COUNTRY_DATA["BO"];
  const states = currentCountry.states;

  const inputClass = "w-full pl-11 pr-4 py-3.5 rounded-xl border border-purple-100 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all";
  const selectClass = "w-full pl-11 pr-10 py-3.5 rounded-xl border border-purple-100 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none cursor-pointer";
  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500";

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #e9d5ff 0%, #f3e8ff 30%, #faf5ff 60%, #ffffff 100%)" }}
    >
      <main className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex flex-col items-center mb-6">
          <motion.div 
            className="relative w-20 h-20 mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <User className="w-10 h-10 text-purple-500" />
              </motion.div>
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400"
              animate={{ scale: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-purple-400"
              animate={{ scale: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-5 shadow-lg border border-purple-50 space-y-4"
        >
          <div className="relative">
            <User className={iconClass} />
            <input
              type="text"
              placeholder="Nombre completo"
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              className={inputClass}
              data-testid="input-nombre"
            />
          </div>

          {isNino && (
            <>
              <div className="relative">
                <GraduationCap className={iconClass} />
                <select
                  value={formData.grado}
                  onChange={(e) => handleChange("grado", e.target.value)}
                  className={selectClass}
                  data-testid="select-grado"
                >
                  <option value="">Perfil educativo</option>
                  {gradosPrimaria.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <Building className={iconClass} />
                <input
                  type="text"
                  placeholder="Institución (colegio)"
                  value={formData.institucion}
                  onChange={(e) => handleChange("institucion", e.target.value)}
                  className={inputClass}
                  data-testid="input-institucion"
                />
              </div>
            </>
          )}

          {isAdolescente && (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleChange("tipoEstudiante", "estudiante")}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${formData.tipoEstudiante === "estudiante" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600"}`}
                  data-testid="btn-estudiante"
                >
                  Estudiante
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("tipoEstudiante", "universitario")}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${formData.tipoEstudiante === "universitario" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600"}`}
                  data-testid="btn-universitario"
                >
                  Universitario
                </button>
              </div>
              {formData.tipoEstudiante === "estudiante" && (
                <>
                  <div className="relative">
                    <GraduationCap className={iconClass} />
                    <select
                      value={formData.grado}
                      onChange={(e) => handleChange("grado", e.target.value)}
                      className={selectClass}
                      data-testid="select-grado"
                    >
                      <option value="">Selecciona tu curso</option>
                      {gradosSecundaria.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <Building className={iconClass} />
                    <input
                      type="text"
                      placeholder="Colegio"
                      value={formData.institucion}
                      onChange={(e) => handleChange("institucion", e.target.value)}
                      className={inputClass}
                      data-testid="input-institucion-colegio"
                    />
                  </div>
                </>
              )}
              {formData.tipoEstudiante === "universitario" && (
                <>
                  <div className="relative">
                    <GraduationCap className={iconClass} />
                    <select
                      value={formData.semestre}
                      onChange={(e) => handleChange("semestre", e.target.value)}
                      className={selectClass}
                      data-testid="select-semestre"
                    >
                      <option value="">Selecciona semestre</option>
                      {semestres.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <Building className={iconClass} />
                    <input
                      type="text"
                      placeholder="Universidad"
                      value={formData.institucion}
                      onChange={(e) => handleChange("institucion", e.target.value)}
                      className={inputClass}
                      data-testid="input-institucion-universidad"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {isUniversitario && (
            <div className="relative">
              <GraduationCap className={iconClass} />
              <select
                value={formData.semestre}
                onChange={(e) => handleChange("semestre", e.target.value)}
                className={selectClass}
                data-testid="select-semestre-uni"
              >
                <option value="">Selecciona semestre</option>
                {semestres.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          )}

          {isProfesional && (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleChange("esProfesional", true)}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${formData.esProfesional === true ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600"}`}
                  data-testid="btn-es-profesional"
                >
                  Soy Profesional
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("esProfesional", false)}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${formData.esProfesional === false ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600"}`}
                  data-testid="btn-no-profesional"
                >
                  No soy Profesional
                </button>
              </div>
              {formData.esProfesional === true && (
                <div className="relative">
                  <Briefcase className={iconClass} />
                  <input
                    type="text"
                    placeholder="Tu profesión"
                    value={formData.profesion}
                    onChange={(e) => handleChange("profesion", e.target.value)}
                    className={inputClass}
                    data-testid="input-profesion"
                  />
                </div>
              )}
              {formData.esProfesional === false && (
                <div className="relative">
                  <Briefcase className={iconClass} />
                  <input
                    type="text"
                    placeholder="Tu ocupación"
                    value={formData.ocupacion}
                    onChange={(e) => handleChange("ocupacion", e.target.value)}
                    className={inputClass}
                    data-testid="input-ocupacion"
                  />
                </div>
              )}
              <div className="relative">
                <Building className={iconClass} />
                <input
                  type="text"
                  placeholder="Institución / Lugar de trabajo"
                  value={formData.lugarTrabajo}
                  onChange={(e) => handleChange("lugarTrabajo", e.target.value)}
                  className={inputClass}
                  data-testid="input-lugar-trabajo"
                />
              </div>
            </>
          )}

          <div className="relative">
            <input
              type="number"
              placeholder="Edad"
              value={formData.edad}
              onChange={(e) => handleChange("edad", e.target.value)}
              className={`${inputClass} pl-11`}
              data-testid="input-edad"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">🎂</span>
          </div>

          <div className="relative">
            <MessageSquare className={iconClass} />
            <textarea
              placeholder="Comentario (opcional)"
              value={formData.comentario}
              onChange={(e) => handleChange("comentario", e.target.value)}
              className={`${inputClass} pl-11 resize-none min-h-[60px]`}
              data-testid="input-comentario"
            />
          </div>

          <div className="relative">
            <Mail className={iconClass} />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={inputClass}
              data-testid="input-email"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative w-28">
              <select
                value={formData.pais}
                onChange={(e) => handleChange("pais", e.target.value)}
                className="w-full py-3.5 pl-3 pr-6 rounded-xl border border-purple-200 text-sm bg-purple-50 text-gray-800 appearance-none cursor-pointer"
                data-testid="select-pais"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.phoneCode}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-1">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
              <input
                type="tel"
                placeholder="Número de teléfono"
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                className={inputClass}
                data-testid="input-telefono"
              />
            </div>
          </div>

          <div className="relative">
            <MapPin className={iconClass} />
            <select
              value={formData.estado}
              onChange={(e) => handleChange("estado", e.target.value)}
              className={selectClass}
              data-testid="select-estado"
            >
              <option value="">Estado / Departamento / Provincia</option>
              {states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting || !formData.nombre.trim()}
            className="w-full py-4 rounded-2xl text-white font-bold shadow-lg disabled:opacity-50 mt-2"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)" }}
            data-testid="button-submit"
          >
            {submitting ? "Enviando..." : buttonText}
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}
