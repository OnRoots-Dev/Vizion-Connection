import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://vizion-connection.jp",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        // {
        //     url: "https://vizion-connection.jp/business",
        //     lastModified: new Date(),
        //     changeFrequency: "weekly",
        //     priority: 0.8,
        // },
        // NOTE: /discover(存在しない) と /roadmap(MVPスコープ外で封印中) は掲載しない。
        {
            url: "https://vizion-connection.jp/register",
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
    ];
}
