import Image from "next/image";

export interface AdCardProps {
  ad: {
    id: string;
    headline: string;
    image_url?: string;
    link_url: string;
    sponsor?: string;
    business_id?: number;
  };
}

export default function AdCard({ ad }: AdCardProps) {
  return (
    <a
      href={ad.link_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="block border-b bg-muted/30 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-4 px-5 py-3 md:py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded">[PR]</span>
            {ad.sponsor ? <span className="text-xs text-muted-foreground">{ad.sponsor}</span> : null}
          </div>
          <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-foreground">{ad.headline}</p>
        </div>

        {ad.image_url ? (
          <div className="relative h-14 w-18 shrink-0 overflow-hidden rounded-md bg-muted md:h-18 md:w-24">
            <Image
              unoptimized
              src={ad.image_url}
              alt={ad.headline}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-14 w-18 shrink-0 rounded-md bg-muted md:h-18 md:w-24" />
        )}
      </div>
    </a>
  );
}
