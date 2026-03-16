import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://vizion-connection.jp",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: "https://vizion-connection.jp/business",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: "https://vizion-connection.jp/discover",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: "https://vizion-connection.jp/register",
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: "https://vizion-connection.jp/roadmap",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
        },
    ];
}