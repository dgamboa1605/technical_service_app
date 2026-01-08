/**
 * Value Object: Tipo de servicio
 */
export type ServiceType = 'taller' | 'recojo' | 'domicilio' | 'instalacion';

/**
 * Obtiene el label en español para un tipo de servicio
 */
export function getServiceTypeLabel(type: ServiceType): string {
  const labels: Record<ServiceType, string> = {
    taller: 'Taller',
    recojo: 'Recojo',
    domicilio: 'Domicilio',
    instalacion: 'Instalación',
  };
  return labels[type] || type;
}


