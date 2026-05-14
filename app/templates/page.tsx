'use client';

import Link from 'next/link';
import { TEMPLATES, listTemplatePartners, type TemplateMeta } from '@/lib/templates';

export default function TemplatesPage() {
  const partners = listTemplatePartners();
  const communityTemplates = TEMPLATES.filter((t) => !t.partner);

  return (
    <main className="min-h-screen bg-[#0a1628]">
      <header className="border-b border-[#1f3252] px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-[#f5a623] font-bold text-lg">
            Zlank
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-[#f5a623] mb-4">Templates Gallery</h1>
        <p className="text-[#b8c4d4] mb-12 max-w-2xl">
          Pick a template below to get started. Each is fully customizable - edit titles, links, colors, and more.
        </p>

        {partners.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-[#e8eef7] mb-2">Featured Partners</h2>
            <p className="text-[#b8c4d4] mb-6 text-sm">
              Signature templates from leading Farcaster apps. Fork one - the partner attribution travels with it.
            </p>
            {partners.map((partner) => {
              const partnerTemplates = TEMPLATES.filter((t) => t.partner?.id === partner.id);
              return (
                <div key={partner.id} className="mb-10">
                  <div className="flex items-baseline gap-3 mb-4">
                    <h3 className="text-lg font-bold text-[#f5a623]">{partner.name}</h3>
                    <Link
                      href={`/partners/${partner.id}`}
                      className="text-xs text-[#b8c4d4] hover:text-[#f5a623] transition"
                    >
                      View partner dashboard
                    </Link>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {partnerTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <section>
          <h2 className="text-2xl font-bold text-[#e8eef7] mb-6">Community Templates</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </section>

        <div className="mt-16 pt-8 border-t border-[#1f3252]">
          <p className="text-[#b8c4d4] text-sm">
            Not finding what you need? <Link href="/builder" className="text-[#f5a623] hover:underline">Start from scratch</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function TemplateCard({ template }: { template: TemplateMeta }) {
  const blockCount = template.doc.pages.reduce((sum, p) => sum + p.blocks.length, 0);

  return (
    <div className="bg-[#122440] border border-[#1f3252] rounded-lg p-6 flex flex-col hover:border-[#f5a623] transition">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getThemeColor(template.doc.theme) }}
          />
          <h3 className="text-lg font-bold text-[#e8eef7]">{template.name}</h3>
        </div>
        <p className="text-sm text-[#b8c4d4] mb-4">{template.description}</p>
        <div className="flex items-center gap-2 mb-6">
          <p className="text-xs text-[#b8c4d4]">{blockCount} block{blockCount !== 1 ? 's' : ''}</p>
          {template.partner && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1f3252] text-[#f5a623]">
              {template.partner.name}
            </span>
          )}
        </div>
      </div>

      <Link
        href={`/builder?template=${template.id}`}
        className="block text-center bg-[#f5a623] text-[#0a1628] font-bold px-4 py-2 rounded hover:bg-[#ffc14d] transition"
      >
        Use Template
      </Link>
    </div>
  );
}

function getThemeColor(theme: string): string {
  const colors: Record<string, string> = {
    purple: '#a855f7',
    amber: '#f59e0b',
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    pink: '#ec4899',
    teal: '#14b8a6',
    gray: '#6b7280',
  };
  return colors[theme] || '#f5a623';
}
