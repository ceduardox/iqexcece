import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { TestFormUnified, FormDataType } from "@/components/TestFormUnified";

export default function CerebralFormPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ categoria: string }>();
  const categoria = params.categoria || "adolescentes";
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData: FormDataType) => {
    setSubmitting(true);
    
    try {
      const isPwa = window.matchMedia('(display-mode: standalone)').matches ||
                    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      
      const lateralidadAnswers = sessionStorage.getItem('lateralidadAnswers');
      const preferenciaAnswers = sessionStorage.getItem('preferenciaAnswers');
      
      const latAnswers: string[] = lateralidadAnswers ? JSON.parse(lateralidadAnswers) : [];
      const prefAnswers: { meaning: string }[] = preferenciaAnswers ? JSON.parse(preferenciaAnswers) : [];
      
      const leftCount = latAnswers.filter(a => a.toLowerCase().includes('izquierda')).length;
      const rightCount = latAnswers.filter(a => a.toLowerCase().includes('derecha')).length;
      const total = leftCount + rightCount || 1;
      const leftPercent = Math.round((leftCount / total) * 100);
      const rightPercent = 100 - leftPercent;
      const dominantSide = leftPercent >= rightPercent ? 'izquierdo' : 'derecho';
      const personalityTraits = prefAnswers.map(a => a.meaning).filter(Boolean);
      
      await fetch("/api/cerebral-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email || null,
          edad: formData.edad || null,
          ciudad: formData.estado || null,
          telefono: formData.telefono ? `${formData.codigoPais} ${formData.telefono}` : null,
          comentario: formData.comentario || null,
          grado: formData.grado || null,
          institucion: formData.institucion || null,
          tipoEstudiante: formData.tipoEstudiante || null,
          semestre: formData.semestre || null,
          esProfesional: formData.esProfesional,
          profesion: formData.profesion || null,
          ocupacion: formData.ocupacion || null,
          lugarTrabajo: formData.lugarTrabajo || null,
          pais: formData.pais || null,
          codigoPais: formData.codigoPais || null,
          estado: formData.estado || null,
          categoria: params.categoria,
          lateralidadData: lateralidadAnswers || null,
          preferenciaData: preferenciaAnswers || null,
          leftPercent,
          rightPercent,
          dominantSide,
          personalityTraits: JSON.stringify(personalityTraits),
          isPwa: isPwa,
        }),
      });
    } catch (error) {
      console.error("Error submitting:", error);
    }
    
    setLocation(`/cerebral/resultado/${params.categoria}`);
  };

  return (
    <TestFormUnified
      categoria={categoria}
      onSubmit={handleSubmit}
      submitting={submitting}
      title="Test Cerebral"
      subtitle="Completa tus datos para ver tu resultado."
      buttonText="Ver mis resultados"
    />
  );
}
