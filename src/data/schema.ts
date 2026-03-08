/**
 * Schema.org JSON-LD for Directorio Morado — SEO and AI discoverability.
 */

export function getBaseUrl(): string {
  if (typeof import.meta.env.SITE === 'string' && import.meta.env.SITE) {
    return import.meta.env.SITE.replace(/\/$/, '');
  }
  return 'https://directoriomorado.com';
}

export function buildWebSiteSchema(baseUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Directorio Morado',
    url: baseUrl,
    description: 'Directorio de apoyo para sobrevivientes de violencia sexual en México',
    inLanguage: 'es',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/directorio?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildOrganizationSchema(baseUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Directorio Morado',
    url: baseUrl,
    description: 'Red de apoyo para sobrevivientes de violencia sexual en México',
  };
}

export function buildDatasetSchema(baseUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Directorio Morado',
    description:
      'Base de datos de recursos de apoyo para sobrevivientes de violencia sexual en México',
    creator: 'Directorio Morado',
    license: 'Informational use',
    url: `${baseUrl}/directorio`,
  };
}

export interface FAQItem {
  name: string;
  text: string;
}

export function buildFAQPageSchema(items: FAQItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.name,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.text,
      },
    })),
  };
}

export function buildCrisisServiceSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CrisisService',
    name: 'Línea de Crisis México',
    telephone: '+52-800-911-2000',
    areaServed: { '@type': 'Country', name: 'Mexico' },
    availableLanguage: { '@type': 'Language', name: 'Spanish' },
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    description: 'Línea de ayuda en crisis. 24 horas, 7 días, todo México, gratuita.',
  };
}

export interface DirectoryEntryForSchema {
  id: string;
  name: string;
  description: string;
  location?: string;
  country: string;
  state?: string;
  city?: string;
  instagram?: string;
  website?: string;
  phone?: string;
  type: string[];
  cost: string;
  population: string[];
  online: boolean;
  hours?: string;
  isEmergency?: boolean;
}

function mapEntryToSchemaType(entry: DirectoryEntryForSchema): string {
  if (entry.type.includes('government services')) return 'GovernmentOrganization';
  if (entry.type.includes('crisis hotline') || entry.isEmergency) return 'CrisisService';
  if (entry.type.some((t) => t.includes('psychological') || t.includes('medical')))
    return 'MedicalOrganization';
  return 'NGO';
}

export function buildDirectoryEntrySchema(
  entry: DirectoryEntryForSchema,
  baseUrl: string
): Record<string, unknown> {
  const schemaType = mapEntryToSchemaType(entry);
  const sameAs: string[] = [];
  if (entry.instagram) {
    sameAs.push(`https://instagram.com/${entry.instagram.replace('@', '')}`);
  }
  if (entry.website) sameAs.push(entry.website);

  const contactPoint: Record<string, unknown> = {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    areaServed: entry.country,
    availableLanguage: 'Spanish',
  };
  if (entry.phone) contactPoint.telephone = entry.phone;
  if (entry.hours) contactPoint.hoursAvailable = entry.hours;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: entry.name,
    description: entry.description,
    areaServed: entry.country,
  };
  if (sameAs.length) schema.sameAs = sameAs;
  if (entry.website) schema.url = entry.website;
  schema.contactPoint = contactPoint;

  return schema;
}
