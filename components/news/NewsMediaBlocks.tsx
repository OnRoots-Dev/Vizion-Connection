function getYouTubeEmbed(url: string): string | null {
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes("youtu.be")) {
            const id = parsed.pathname.replace("/", "");
            return id ? `https://www.youtube.com/embed/${id}` : null;
        }
        if (parsed.hostname.includes("youtube.com")) {
            const id = parsed.searchParams.get("v");
            return id ? `https://www.youtube.com/embed/${id}` : null;
        }
        return null;
    } catch {
        return null;
    }
}

function getVimeoEmbed(url: string): string | null {
    try {
        const parsed = new URL(url);
        if (!parsed.hostname.includes("vimeo.com")) return null;
        const id = parsed.pathname.split("/").filter(Boolean).pop();
        return id ? `https://player.vimeo.com/video/${id}` : null;
    } catch {
        return null;
    }
}

function getEmbedUrl(url: string): string | null {
    return getYouTubeEmbed(url) ?? getVimeoEmbed(url);
}

export function NewsMediaBlocks({
    title,
    imageUrl,
    galleryImages,
    videoUrl,
}: {
    title: string;
    imageUrl: string | null;
    galleryImages: string[];
    videoUrl: string | null;
}) {
    const gallery = [imageUrl, ...galleryImages].filter((item, index, array): item is string => Boolean(item) && array.indexOf(item) === index);
    const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;
    const nativeVideo = videoUrl && !embedUrl && /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl);

    if (gallery.length === 0 && !videoUrl) {
        return null;
    }

    return (
        <div className="space-y-4">
            {gallery.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                    {gallery.map((src, index) => (
                        <figure
                            key={`${src}-${index}`}
                            className={`${index === 0 && gallery.length === 1 ? "" : ""} overflow-hidden rounded-[20px] border border-slate-200 bg-slate-100`}
                        >
                            <img src={src} alt={`${title} ${index + 1}`} className="h-full w-full object-cover" />
                        </figure>
                    ))}
                </div>
            ) : null}

            {videoUrl ? (
                <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-950">
                    {embedUrl ? (
                        <div className="aspect-video">
                            <iframe
                                src={embedUrl}
                                title={`${title} video`}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : nativeVideo ? (
                        <video src={videoUrl} controls className="aspect-video h-full w-full" />
                    ) : (
                        <div className="flex items-center justify-between gap-3 p-4 text-white">
                            <span className="text-sm text-white/80">動画リンク</span>
                            <a
                                href={videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10"
                            >
                                動画を開く
                            </a>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}
