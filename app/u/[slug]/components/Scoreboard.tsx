// app/u/[slug]/components/Scoreboard.tsx
// Activity Summary — Replaced KPI card grid with narrative summary
// Focus on human activity story, not dashboard statistics
import { VP, VP_DISPLAY_FONT, VP_MONO_FONT, vpPanel } from "../profile-theme";

export default function Scoreboard({
    cheerCount,
    connectorCount,
    activityCount,
    togetherCount,
}: {
    cheerCount: number;
    connectorCount: number;
    activityCount: number;
    togetherCount: number;
}) {
    // Only show if there's meaningful activity
    if (activityCount === 0 && togetherCount === 0 && cheerCount === 0) {
        return null;
    }

    return (
        <section aria-label="Activity Summary">
            <div
                style={{
                    padding: "18px 20px",
                    ...vpPanel,
                }}
            >
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: VP.sub }}>
                    {activityCount > 0 && (
                        <span>
                            {activityCount}件の活動を記録
                            {togetherCount > 0 && `、${togetherCount}回のTogetherに参加`}
                        </span>
                    )}
                    {activityCount === 0 && togetherCount > 0 && (
                        <span>{togetherCount}回のTogetherに参加</span>
                    )}
                    {cheerCount > 0 && (
                        <span style={{ marginLeft: activityCount > 0 || togetherCount > 0 ? 8 : 0 }}>
                            {cheerCount}件のCheerを受け取りました
                        </span>
                    )}
                </p>
            </div>
        </section>
    );
}