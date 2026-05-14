import Link from 'next/link';
import { getPartnerStats, listSnapsByPartner, getForkChildren } from '@/lib/kv';
import { getTemplatesByPartner } from '@/lib/templates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SNAPS_SHOWN = 30;

// Read-only partner dashboard: aggregate views/forks/actions, the partner's
// signature templates, and the snaps co-branded with this partner sorted by
// how many times each has been forked.

export default async function PartnerDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [stats, snapIds] = await Promise.all([
    getPartnerStats(id),
    listSnapsByPartner(id, SNAPS_SHOWN),
  ]);
  const snaps = await Promise.all(
    snapIds.map(async (snapId) => ({
      snapId,
      forkCount: (await getForkChildren(snapId)).length,
    })),
  );
  snaps.sort((a, b) => b.forkCount - a.forkCount);

  const templates = getTemplatesByPartner(id);
  const partnerName = templates[0]?.partner?.name ?? id;

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
        <p className="text-sm uppercase tracking-wide text-[#b8c4d4] mb-1">Partner</p>
        <h1 className="text-4xl font-bold text-[#f5a623] mb-8">{partnerName}</h1>

        <div className="grid grid-cols-3 gap-4 mb-12">
          <StatCard label="Views" value={stats.views} />
          <StatCard label="Forks" value={stats.forks} />
          <StatCard label="Actions" value={stats.actions} />
        </div>

        {templates.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#e8eef7] mb-4">Signature Templates</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((t) => (
                <Link
                  key={t.id}
                  href={`/builder?template=${t.id}`}
                  className="bg-[#122440] border border-[#1f3252] rounded-lg p-4 hover:border-[#f5a623] transition"
                >
                  <h3 className="font-bold text-[#e8eef7] mb-1">{t.name}</h3>
                  <p className="text-sm text-[#b8c4d4]">{t.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <h2 className="text-2xl font-bold text-[#e8eef7] mb-4">Snaps by fork count</h2>
        {snaps.length === 0 ? (
          <p className="text-[#b8c4d4]">No snaps co-branded with this partner yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {snaps.map(({ snapId, forkCount }) => (
              <li
                key={snapId}
                className="bg-[#122440] border border-[#1f3252] rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <Link
                  href={`/s/${snapId}`}
                  className="text-[#e8eef7] hover:text-[#f5a623] transition font-mono text-sm"
                >
                  {snapId}
                </Link>
                <span className="text-xs text-[#b8c4d4]">
                  {forkCount} fork{forkCount === 1 ? '' : 's'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#122440] border border-[#1f3252] rounded-lg p-6">
      <p className="text-sm text-[#b8c4d4] mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#e8eef7]">{value.toLocaleString()}</p>
    </div>
  );
}
