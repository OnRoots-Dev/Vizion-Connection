"use client";

// app/(marketing)/page.tsx

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import FloatingCTAWrapper from "@/components/marketing/sections/FloatingCTAWrapper";

export default function Page() {
  const [activeRole, setActiveRole] = useState("Athlete");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const roles = [
    {
      id: "Athlete", color: "#FF5050",
      tagline: "競技活動を記録・可視化・発見される。",
      points: [
        "練習・試合・コンディションを毎日記録",
        "Journeyが積み上がるほど、Portfolioが育つ",
        "Pulseが育つほど、Discoveryで発見されやすくなる",
        "BusinessからのオファーやスポンサーをHubで受け取る",
      ],
    },
    {
      id: "Trainer", color: "#32D278",
      tagline: "指導実績を蓄積し、信頼を可視化する。",
      points: [
        "指導実績・資格をPortfolioに蓄積",
        "Trainer Discoveryで新規Athleteに発見される",
        "担当Athleteのコンディションをまとめて管理",
        "第三者証言（Trainerコメント）で信頼を構築",
      ],
    },
    {
      id: "Crew", color: "#FFC81E",
      tagline: "好きな選手を、深く応援できる場所。",
      points: [
        "Cheerを続けてPulse（脈動）を育てる",
        "3日でBond解放・詳細Portfolioが閲覧できる",
        "応援の記録がSUPPORT SCOREとして蓄積される",
        "「最も熱いファン」として可視化される",
      ],
    },
    {
      id: "Business", color: "#3C8CFF",
      tagline: "アスリートへの注目・広告・協業機会。",
      points: [
        "Discovery・Hub・Timelineに広告掲載",
        "地域・競技・Pulseスコアでアスリートを検索",
        "Cheerで注目を伝え、オファーを送信",
        "効果測定ダッシュボードで投資対効果を確認",
      ],
    },
  ];

  const faqs = [
    {
      q: "登録は無料ですか？",
      a: "はい。Athlete・Trainer・Crew・Businessすべてのロールで無料で登録・利用できます。",
    },
    {
      q: "Businessプランとは何ですか？",
      a: "アスリートへの広告掲載・Discovery優先表示・効果測定が利用できる企業向けプランです。5つのプランから選べます。",
    },
    {
      q: "Founding Memberの枠はいつ埋まりますか？",
      a: "先着100名限定です。枠がなくなり次第、Founding Member登録は終了します。お早めにどうぞ。",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes vcPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes vcFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <Header />
      <main style={{ background: "#07070e", minHeight: "100vh" }}>

        {/* Section 1: Hero */}
        <section style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 24px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0, zIndex: 0,
            backgroundImage: `
              linear-gradient(rgba(167,139,250,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(167,139,250,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute",
            top: "40%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600, height: 600,
            background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 10, letterSpacing: "0.2em",
              textTransform: "uppercase", fontFamily: "monospace",
              color: "#a78bfa", marginBottom: 32,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#a78bfa",
                animation: "vcPulse 2s ease-in-out infinite",
                display: "inline-block",
              }} />
              IGNITION — 先行登録受付中
            </div>
            <h1 style={{
              fontSize: "clamp(3rem, 8vw, 6rem)",
              fontWeight: 900,
              color: "#f0f0f5",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 28,
            }}>
              活動が、<br />
              信用になる。
            </h1>
            <p style={{
              fontSize: "clamp(15px, 2vw, 18px)",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.9,
              marginBottom: 48,
              maxWidth: 520,
              margin: "0 auto 48px",
            }}>
              アスリート・トレーナー・クルー・企業。<br />
              スポーツに関わるすべての人の<br />
              役割と信頼を可視化する場所。
            </p>
            <div style={{
              display: "flex", gap: 12,
              justifyContent: "center", flexWrap: "wrap",
            }}>
              <a href="/register" style={{
                display: "inline-block",
                padding: "16px 40px",
                background: "#a78bfa",
                color: "#000",
                borderRadius: 10,
                fontSize: 15, fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 0 32px rgba(167,139,250,0.4)",
                transition: "all 0.2s",
              }}>
                今すぐ登録する（無料）
              </a>
              <a href="/business" style={{
                display: "inline-block",
                padding: "16px 32px",
                background: "transparent",
                color: "rgba(255,255,255,0.65)",
                borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.15)",
                transition: "all 0.2s",
              }}>
                Businessプランを見る →
              </a>
            </div>
          </div>
        </section>

        {/* Section 2: Core Features */}
        <section style={{
          padding: "100px 24px",
          maxWidth: 1100, margin: "0 auto",
        }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.2em",
              textTransform: "uppercase", fontFamily: "monospace",
              color: "rgba(255,255,255,0.28)", marginBottom: 16,
            }}>
              Core Features
            </div>
            <h2 style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 900, color: "#f0f0f5",
              letterSpacing: "-0.02em",
            }}>
              毎日使える。育つ。見つかる。
            </h2>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}>
            {[
              {
                icon: "⊹",
                color: "#a78bfa",
                title: "毎日の積み上げが、証明になる。",
                desc: "練習・試合・コンディションを記録するだけ。続けるほどPortfolioが自動で育ち、あなたの軌跡が信用になる。",
                label: "Journey & Pulse",
              },
              {
                icon: "◈",
                color: "#32D278",
                title: "応援が、関係になる。",
                desc: "Cheerを続けると脈動（Pulse）が育つ。3日でBond解放。応援の深さが可視化され、単なるフォローを超えた関係になる。",
                label: "Cheer & Bond",
              },
              {
                icon: "◎",
                color: "#3C8CFF",
                title: "URLひとつで、あなたが伝わる。",
                desc: "役割・競技・Pulse継続日数が1枚に。SNSに貼るだけでVizion Cardが自動表示される。",
                label: "Portfolio & Vizion Card",
              },
            ].map((f) => (
              <div key={f.label} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: 32,
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = f.color + "44";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: f.color + "18",
                  border: `1px solid ${f.color}33`,
                  display: "flex", alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22, color: f.color,
                  marginBottom: 20,
                }}>
                  {f.icon}
                </div>
                <div style={{
                  fontSize: 10, letterSpacing: "0.15em",
                  textTransform: "uppercase", fontFamily: "monospace",
                  color: f.color, marginBottom: 10,
                }}>
                  {f.label}
                </div>
                <h3 style={{
                  fontSize: 18, fontWeight: 700,
                  color: "#f0f0f5", marginBottom: 12,
                  lineHeight: 1.4,
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontSize: 14, color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.8,
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Role Benefits */}
        <section style={{
          padding: "100px 24px",
          background: "rgba(255,255,255,0.015)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{
                fontSize: 10, letterSpacing: "0.2em",
                textTransform: "uppercase", fontFamily: "monospace",
                color: "rgba(255,255,255,0.28)", marginBottom: 16,
              }}>
                Roles
              </div>
              <h2 style={{
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 900, color: "#f0f0f5",
                letterSpacing: "-0.02em",
              }}>
                あなたのロールはどれですか？
              </h2>
            </div>
            <div style={{
              display: "flex", gap: 4, justifyContent: "center",
              marginBottom: 40, flexWrap: "wrap",
            }}>
              {roles.map(r => (
                <button key={r.id}
                  onClick={() => setActiveRole(r.id)}
                  style={{
                    padding: "9px 22px", borderRadius: 999,
                    background: "transparent", border: "none",
                    cursor: "pointer", fontSize: 13, fontWeight: 600,
                    color: activeRole === r.id ? r.color : "rgba(255,255,255,0.35)",
                    borderBottom: activeRole === r.id
                      ? `2px solid ${r.color}`
                      : "2px solid transparent",
                    transition: "all 0.2s",
                  }}>
                  {r.id}
                </button>
              ))}
            </div>
            {roles.filter(r => r.id === activeRole).map(r => (
              <div key={r.id} style={{
                animation: "vcFadeUp 0.25s ease-out",
                background: "#111118",
                border: `1px solid ${r.color}22`,
                borderRadius: 16, padding: "32px 36px",
              }}>
                <p style={{
                  fontSize: 18, fontWeight: 700,
                  color: "#f0f0f5", marginBottom: 24,
                  lineHeight: 1.5,
                }}>
                  {r.tagline}
                </p>
                <div style={{
                  display: "flex", flexDirection: "column", gap: 12,
                }}>
                  {r.points.map((p, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                    }}>
                      <span style={{
                        color: r.color, fontSize: 14,
                        marginTop: 2, flexShrink: 0,
                      }}>✓</span>
                      <span style={{
                        fontSize: 14, color: "rgba(255,255,255,0.65)",
                        lineHeight: 1.7,
                      }}>
                        {p}
                      </span>
                    </div>
                  ))}
                </div>
                <a href="/register" style={{
                  display: "inline-block", marginTop: 28,
                  padding: "12px 28px", borderRadius: 8,
                  background: r.color, color: "#000",
                  fontWeight: 700, fontSize: 13,
                  textDecoration: "none",
                }}>
                  {r.id}として登録する →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Founding Member */}
        <section style={{
          padding: "100px 24px",
          background: "linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(59,130,246,0.04) 100%)",
        }}>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.2em",
              textTransform: "uppercase", fontFamily: "monospace",
              color: "#a78bfa", marginBottom: 16,
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#a78bfa",
                animation: "vcPulse 2s ease-in-out infinite",
                display: "inline-block",
              }} />
              Founding Member
            </div>
            <h2 style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 900, color: "#f0f0f5",
              letterSpacing: "-0.02em", marginBottom: 16,
            }}>
              最初の記録が、永遠に残る。
            </h2>
            <p style={{
              fontSize: 16, color: "rgba(255,255,255,0.5)",
              marginBottom: 48, lineHeight: 1.8,
            }}>
              シリアルナンバー #001 から埋まります。
            </p>
            <div style={{
              display: "flex", flexDirection: "column", gap: 12,
              textAlign: "left", marginBottom: 48,
              background: "#111118",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: "28px 32px",
            }}>
              {[
                "#001から始まるシリアルナンバー（永久表示）",
                "将来の有料プランが登録時点の価格で永久固定",
                "Discovery永続優先表示",
                "新機能への最優先アクセス",
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ color: "#32D278", fontSize: 14 }}>✓</span>
                  <span style={{
                    fontSize: 14, color: "rgba(255,255,255,0.7)",
                  }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 36 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 12, color: "rgba(255,255,255,0.4)",
                marginBottom: 8,
              }}>
                <span>現在 0名</span>
                <span>上限 100名</span>
              </div>
              <div style={{
                height: 4, borderRadius: 2,
                background: "rgba(255,255,255,0.08)",
              }}>
                <div style={{
                  height: "100%", width: "2%",
                  background: "#a78bfa", borderRadius: 2,
                }} />
              </div>
            </div>
            <a href="/register" style={{
              display: "inline-block",
              padding: "16px 48px",
              background: "#a78bfa", color: "#000",
              borderRadius: 10, fontSize: 15,
              fontWeight: 700, textDecoration: "none",
              boxShadow: "0 0 32px rgba(167,139,250,0.4)",
            }}>
              番号を確保する（無料）
            </a>
          </div>
        </section>

        {/* Section 5: FAQ + Footer CTA */}
        <section style={{ padding: "100px 24px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{
                fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                fontWeight: 900, color: "#f0f0f5",
                letterSpacing: "-0.02em",
              }}>
                よくある質問
              </h2>
            </div>
            <div style={{
              display: "flex", flexDirection: "column", gap: 2,
              marginBottom: 100,
            }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: "100%", display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "20px 0",
                      background: "transparent", border: "none",
                      cursor: "pointer",
                      color: "#f0f0f5", fontSize: 15,
                      fontWeight: 600, textAlign: "left", gap: 16,
                    }}
                  >
                    {faq.q}
                    <span style={{
                      fontSize: 18,
                      color: "rgba(255,255,255,0.4)",
                      transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 0.25s",
                      flexShrink: 0,
                    }}>+</span>
                  </button>
                  <div style={{
                    maxHeight: openFaq === i ? 200 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                  }}>
                    <p style={{
                      padding: "0 0 20px",
                      fontSize: 14,
                      color: "rgba(255,255,255,0.55)",
                      lineHeight: 1.8,
                    }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              textAlign: "center",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 80,
            }}>
              <p style={{
                fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                fontWeight: 800, color: "#f0f0f5",
                marginBottom: 32, lineHeight: 1.4,
              }}>
                迷っているなら、今日が最安です。
              </p>
              <a href="/register" style={{
                display: "inline-block",
                padding: "16px 48px",
                background: "#a78bfa", color: "#000",
                borderRadius: 10, fontSize: 15,
                fontWeight: 700, textDecoration: "none",
                boxShadow: "0 0 32px rgba(167,139,250,0.4)",
              }}>
                今すぐ登録する（無料）
              </a>
            </div>
          </div>
        </section>

        <Footer />
        <FloatingCTAWrapper />
      </main>
    </>
  );
}
