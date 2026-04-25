import type { UserRole } from "@/features/auth/types";
import type { DashboardView } from "@/app/(app)/dashboard/types";

export type HubFeature = {
    id: string;
    title: string;
    summary: string;
    detail: string;
    actionLabel: string;
    targetView?: DashboardView;
};

export type HubConfig = {
    hubName: string;
    purpose: string;
    summary: string;
    accentColor: string;
    accentLabel: string;
    features: HubFeature[];
};

export const HUB_CONFIGS: Record<UserRole, HubConfig> = {
    Business: {
        hubName: "Business Hub",
        purpose: "売上・広告効果の最大化",
        summary: "広告運用と案件創出をまとめて扱う、ビジネス価値の中核画面です。",
        accentColor: "#3C8CFF",
        accentLabel: "BUSINESS",
        features: [
            {
                id: "ads",
                title: "広告管理UI",
                summary: "掲載管理・効果測定・掲載期間",
                detail: "掲載中の広告を管理し、効果測定や掲載期間、追加購入などの運用をまとめて行えます。",
                actionLabel: "広告管理を開く",
                targetView: "business",
            },
            {
                id: "offers",
                title: "オファー送信機能",
                summary: "Athlete・Trainer にオファー送信",
                detail: "Athlete/Trainer に案件オファーを送信し、交渉や進捗を管理します。",
                actionLabel: "オファーを送信する",
                targetView: "business",
            },
            {
                id: "discovery",
                title: "Athlete・Trainer検索・リスト保存",
                summary: "Discovery検索 + 候補の一時保存",
                detail: "Discovery と同様の検索機能で候補を探し、気になった相手を一時保存して整理できます。",
                actionLabel: "Discoveryを開く",
                targetView: "discovery",
            },
        ],
    },
    Athlete: {
        hubName: "Athlete Hub",
        purpose: "影響力の可視化と収益化",
        summary: "応援と露出を価値に変え、活動の広がりを次の収益へ接続するための中核画面です。",
        accentColor: "#FF5050",
        accentLabel: "ATHLETE",
        features: [
            {
                id: "schedule",
                title: "スケジュール管理",
                summary: "試合・練習などのスケジュール",
                detail: "試合・練習・イベントなどの予定を登録し、公開/非公開を含めて管理できます。",
                actionLabel: "スケジュールを開く",
                targetView: "schedule",
            },
            {
                id: "offers",
                title: "オファー受信BOX",
                summary: "ビジネスアカウントからのオファー",
                detail: "Business アカウントから届いたオファーを確認し、承認/辞退などの対応を行えます。",
                actionLabel: "オファー受信BOXを開く",
                targetView: "offers",
            },
            {
                id: "cheer_graph",
                title: "Cheerグラフ",
                summary: "応援してくれたユーザーの属性分布",
                detail: "Cheerしてくれたアカウントの属性（ロール/地域/競技など）を可視化し、ファン層を把握できます。",
                actionLabel: "Cheerグラフを開く",
                targetView: "cheer_graph",
            },
        ],
    },
    Trainer: {
        hubName: "Trainer Hub",
        purpose: "信頼の蓄積と指名獲得",
        summary: "実績の可視化とクライアント接点を整理し、指名される理由を育てるための中核画面です。",
        accentColor: "#32D278",
        accentLabel: "TRAINER",
        features: [
            {
                id: "schedule",
                title: "スケジュール管理",
                summary: "セッション予定・予約状況",
                detail: "セッション予定や予約状況を確認し、今後の受付可否も含めてスケジュールを管理します。",
                actionLabel: "スケジュールを開く",
                targetView: "schedule",
            },
            {
                id: "offers",
                title: "オファー受信BOX",
                summary: "Business からのオファー受信",
                detail: "Business アカウントから届いたオファーを確認し、承認/辞退などの対応を行えます。",
                actionLabel: "オファー受信BOXを開く",
                targetView: "offers",
            },
            {
                id: "cheer_graph",
                title: "Cheerグラフ",
                summary: "応援してくれたユーザーの属性分布",
                detail: "Cheerしてくれたアカウントの属性（ロール/地域/競技など）を可視化し、ファン層を把握できます。",
                actionLabel: "Cheerグラフを開く",
                targetView: "cheer_graph",
            },
        ],
    },
    Members: {
        hubName: "Members Hub",
        purpose: "参加・応援・拡散の促進",
        summary: "応援行動と参加履歴を蓄積し、コミュニティ内での関わりを広げるための中核画面です。",
        accentColor: "#FFC81E",
        accentLabel: "MEMBERS",
        features: [
            {
                id: "history",
                title: "応援記録・Cheer、閲覧履歴",
                summary: "応援と閲覧の時系列ログ",
                detail: "Cheerや閲覧などの履歴をまとめて振り返り、応援行動を継続しやすくします。",
                actionLabel: "Hubで確認する",
            },
            {
                id: "my_hub",
                title: "My Hub",
                summary: "推しを最大5人まで登録",
                detail: "推しのAthlete/Trainerを登録して、Hub内で切り替えてプロフィールを確認できます。",
                actionLabel: "コレクションを開く",
                targetView: "collections",
            },
        ],
    },
    Admin: {
        hubName: "Admin Hub",
        purpose: "運営・管理",
        summary: "運営が状態を把握し、改善を回すための管理画面です。",
        accentColor: "#7C3AED",
        accentLabel: "ADMIN",
        features: [
            {
                id: "voicelab",
                title: "Voice Lab",
                summary: "ご意見の確認・ステータス管理",
                detail: "投稿されたご意見を確認し、対応状況（未対応/対応中/検討中/対応済み）を管理します。",
                actionLabel: "Voice Labを開く",
                targetView: "voicelab",
            },
            {
                id: "ads",
                title: "広告",
                summary: "広告の審査・承認",
                detail: "Businessアカウントから申請された広告の審査（承認/却下）と、掲載状態の管理ができます。",
                actionLabel: "広告審査を開く",
                targetView: "admin_ads",
            },
        ],
    },
};

export function getHubConfig(role: UserRole) {
    return HUB_CONFIGS[role];
}
