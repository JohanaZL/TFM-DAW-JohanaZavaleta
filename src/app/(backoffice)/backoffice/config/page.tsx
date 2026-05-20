import { getBaseUrl } from '@/lib/getBaseUrl';
import { SiteConfigForm } from '@/components/backoffice/SiteConfigForm';

async function getSiteConfig() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/site-config`, { cache: 'no-store' });
    if (!res.ok) return { homeParagraph: '' };
    return res.json();
  } catch {
    return { homeParagraph: '' };
  }
}

export default async function BackofficeConfigPage() {
  const config = await getSiteConfig();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Configuración del sitio</h1>
      <p className="text-sm text-gray-500 mb-8">Personaliza el contenido visible en la página de inicio.</p>
      <SiteConfigForm initialParagraph={config.homeParagraph ?? ''} />
    </div>
  );
}
