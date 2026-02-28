import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { TestFormUnified, FormDataType } from "@/components/TestFormUnified";
import { computeCerebralProfile, type CerebralAnswer, type PreferenciaAnswer } from "@/lib/cerebral-scoring";

export default function CerebralFormPage() {
  const { t } = useTranslation();
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
      const cerebralAnswers = sessionStorage.getItem('cerebralAnswers');
      
      const latAnswers: string[] = lateralidadAnswers ? JSON.parse(lateralidadAnswers) : [];
      const prefAnswers: PreferenciaAnswer[] = preferenciaAnswers ? JSON.parse(preferenciaAnswers) : [];
      const cogAnswers: CerebralAnswer[] = cerebralAnswers ? JSON.parse(cerebralAnswers) : [];

      const profile = computeCerebralProfile({
        lateralidadAnswers: latAnswers,
        preferenciaAnswers: prefAnswers,
        cerebralAnswers: cogAnswers,
      });
      
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
          leftPercent: profile.leftPercent,
          rightPercent: profile.rightPercent,
          dominantSide: profile.dominantSide,
          personalityTraits: JSON.stringify(profile.personalityTraits),
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
      subtitle={t("tests.completeData")}
      buttonText={t("tests.seeResults")}
    />
  );
}
