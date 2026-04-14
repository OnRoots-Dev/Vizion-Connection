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
                id: "analytics",
                title: "分析",
                summary: "広告効果・数値確認",
                detail: "広告表示数、クリック数、Cheer連動などの主要指標を確認し、次の改善アクションにつなげます。",
                actionLabel: "分析ダッシュボードを見る",
            },
            {
                id: "ads",
                title: "広告管理",
                summary: "出稿・停止・設定",
                detail: "配信中の広告状況を把握し、出稿の切り替えや設定調整を進めるための起点になります。",
                actionLabel: "広告設定を確認する",
            },
            {
                id: "offers",
                title: "オファー",
                summary: "アスリートやトレーナーへの案件送信",
                detail: "マッチした相手に案件を送り、協業機会を作るためのオファー管理を担います。",
                actionLabel: "案件候補を整理する",
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
                id: "impact",
                title: "影響力",
                summary: "閲覧数・応援数などの指標",
                detail: "プロフィール閲覧やCheerなど、影響力を表す動きをひと目で確認し、露出の伸びを把握します。",
                actionLabel: "Cheerを確認する",
                targetView: "cheer",
            },
            {
                id: "revenue",
                title: "収益",
                summary: "スポンサー・案件収益",
                detail: "今後のスポンサー収益や案件機会を整理し、競技活動と収益化の両立を見える化します。",
                actionLabel: "Hubで詳細を確認中",
            },
            {
                id: "offers",
                title: "オファー",
                summary: "企業からの案件確認・管理",
                detail: "届いたオファーを確認し、対応すべき案件や交渉状況をまとめて管理します。",
                actionLabel: "オファー一覧を確認する",
                targetView: "offers",
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
                id: "achievements",
                title: "実績",
                summary: "指導履歴・成果",
                detail: "積み上げた指導経験や成果を整理し、信頼につながる実績を継続的に更新していきます。",
                actionLabel: "Careerを確認する",
                targetView: "career",
            },
            {
                id: "clients",
                title: "クライアント",
                summary: "担当ユーザー管理",
                detail: "現在関わっているクライアント情報を整理し、継続支援や関係性の把握に活用します。",
                actionLabel: "Hubで詳細を確認中",
            },
            {
                id: "sessions",
                title: "セッション",
                summary: "予約・実施履歴",
                detail: "予約状況や実施履歴を俯瞰し、次の指導機会につなげるための管理起点にします。",
                actionLabel: "Hubで詳細を確認中",
            },
            {
                id: "offers",
                title: "オファー",
                summary: "企業からの案件確認・管理",
                detail: "届いたオファーを確認し、対応状況や案件条件をまとめて確認できます。",
                actionLabel: "オファー一覧を確認する",
                targetView: "offers",
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
                id: "activity",
                title: "活動履歴",
                summary: "参加・閲覧・応援履歴",
                detail: "どのようなページを見て、どんな応援や参加をしてきたかを振り返るための履歴です。",
                actionLabel: "Notificationsを確認する",
                targetView: "notifications",
            },
            {
                id: "cheer-management",
                title: "応援管理",
                summary: "Cheer履歴・推し管理",
                detail: "これまでのCheer履歴や推しの状況を整理し、応援行動を継続しやすくします。",
                actionLabel: "Cheerを確認する",
                targetView: "cheer",
            },
            {
                id: "benefits",
                title: "特典",
                summary: "報酬・アンロック要素",
                detail: "ミッション達成や参加実績に応じた報酬・解放要素を確認するための機能です。",
                actionLabel: "Missionsを確認する",
                targetView: "missions",
            },
            {
                id: "referral",
                title: "紹介",
                summary: "招待・リファラル状況",
                detail: "招待リンクの拡散状況や紹介実績を把握し、コミュニティの輪を広げる起点にします。",
                actionLabel: "Referralを確認する",
                targetView: "referral",
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
                summary: "広告枠・配信の確認",
                detail: "広告の運用状況を確認します。",
                actionLabel: "Hubで詳細を確認中",
            },
        ],
    },
};

export function getHubConfig(role: UserRole) {
    return HUB_CONFIGS[role];
}
