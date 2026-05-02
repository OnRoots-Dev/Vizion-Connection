import { createElement as h } from "react";
import type { OgProfileData } from "@/features/og/server/og-data-service";

export function StoriesCard(profile: OgProfileData): React.ReactElement {
    const slug = profile.slug;
    const displayName = profile.displayName;
    const bio = profile.bio;
    const sport = profile.sport;
    const location = profile.location;
    const cheerCount = profile.cheerCount;
    const serialId = profile.serialId;
    const isFounding = profile.isFounding;
    const rl = profile.roleColor;
    const bg1 = profile.roleGradient;
    const initials = profile.initials;
    const bgData = profile.bgData;
    const roleLabel = profile.roleLabel;

    // ── Stories 1080×1920 ── シンメトリーレイアウト・フローティングカード
    const nameFzS = displayName.length > 12
        ? (displayName.length > 18 ? "72px" : "90px")
        : "110px";

    // カードの高さ・位置計算（上下シンメトリー）
    // 上マージン: 160px, 下マージン: 160px, カード: 1600px
    const CARD_TOP = 160;
    const CARD_H = 1600;

    return h("div", {
        style: {
            width: "1080px", height: "1920px",
            display: "flex", position: "relative",
            overflow: "hidden", fontFamily: "sans-serif",
            background: "#05050c",
        }
    },

        // ══════════════════════════════════════════
        // BG レイヤー
        // ══════════════════════════════════════════

        // フルブリード写真
        bgData
            ? h("img", {
                src: bgData,
                style: {
                    position: "absolute", inset: 0,
                    width: "1080px", height: "1920px",
                    objectFit: "cover", objectPosition: "center top",
                    display: "flex", opacity: 0.22,
                }
            })
            : h("div", {
                style: {
                    position: "absolute", inset: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    background: `linear-gradient(145deg, ${bg1} 0%, #04040a 100%)`,
                }
            },
                h("div", {
                    style: {
                        fontSize: "380px", fontWeight: 900, color: `${rl}07`,
                        fontFamily: "monospace", letterSpacing: "-0.05em",
                        display: "flex", lineHeight: 1,
                    }
                }, initials)
            ),

        // 全体暗めオーバーレイ
        h("div", {
            style: {
                position: "absolute", inset: 0, display: "flex",
                background: "rgba(5,5,12,0.68)",
            }
        }),

        // ロールカラーのアンビエントグロー（中央）
        h("div", {
            style: {
                position: "absolute",
                top: "50%", left: "50%",
                width: "900px", height: "900px",
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(circle, ${rl}18 0%, transparent 65%)`,
                display: "flex",
            }
        }),

        // 上部グロー
        h("div", {
            style: {
                position: "absolute", top: "-80px", left: "50%",
                width: "700px", height: "400px",
                transform: "translateX(-50%)",
                background: `radial-gradient(ellipse, ${rl}22 0%, transparent 70%)`,
                display: "flex",
            }
        }),

        // 下部グロー（シンメトリー）
        h("div", {
            style: {
                position: "absolute", bottom: "-80px", left: "50%",
                width: "700px", height: "400px",
                transform: "translateX(-50%)",
                background: `radial-gradient(ellipse, ${rl}14 0%, transparent 70%)`,
                display: "flex",
            }
        }),

        // ══════════════════════════════════════════
        // 上部ロゴバー（top: 56px → center: 108px = シンメトリー確保）
        // ══════════════════════════════════════════
        h("div", {
            style: {
                position: "absolute",
                top: `${(CARD_TOP - 100) / 2 + 20}px`,
                left: 0, right: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "20px",
            }
        },
            h("div", { style: { width: "40px", height: "1px", background: `${rl}60`, display: "flex" } }),
            h("span", {
                style: {
                    fontSize: "18px", fontWeight: 900, color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.38em", textTransform: "uppercase", fontFamily: "monospace",
                }
            }, "VIZION CONNECTION"),
            h("div", { style: { width: "40px", height: "1px", background: `${rl}60`, display: "flex" } })
        ),

        // ══════════════════════════════════════════
        // メインカード（フローティング）
        // ══════════════════════════════════════════
        h("div", {
            style: {
                position: "absolute",
                top: `${CARD_TOP}px`,
                left: "56px", right: "56px",
                height: `${CARD_H}px`,
                borderRadius: "28px",
                overflow: "hidden",
                display: "flex", flexDirection: "column",
                background: `linear-gradient(160deg, ${bg1}ee 0%, rgba(6,6,14,0.96) 55%, rgba(5,5,12,0.98) 100%)`,
                border: `1px solid ${rl}30`,
                boxShadow: `0 0 0 1px ${rl}12, 0 40px 120px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.07)`,
            }
        },

            // ── カード内：プロフィール写真エリア（上半分）
            h("div", {
                style: {
                    position: "relative",
                    height: "720px",
                    flexShrink: 0,
                    overflow: "hidden",
                    display: "flex",
                }
            },
                // 写真
                bgData
                    ? h("img", {
                        src: bgData,
                        style: {
                            position: "absolute", inset: 0,
                            width: "100%", height: "100%",
                            objectFit: "cover", objectPosition: "center top",
                            display: "flex",
                        }
                    })
                    : h("div", {
                        style: {
                            position: "absolute", inset: 0, display: "flex",
                            alignItems: "center", justifyContent: "center",
                            background: `linear-gradient(145deg, ${bg1} 0%, #08080f 100%)`,
                        }
                    },
                        h("div", {
                            style: {
                                fontSize: "220px", fontWeight: 900, color: `${rl}12`,
                                fontFamily: "monospace", display: "flex",
                            }
                        }, initials)
                    ),

                // 写真上グラデーション
                h("div", {
                    style: {
                        position: "absolute", inset: 0, display: "flex",
                        background: `linear-gradient(to bottom, rgba(5,5,12,0.1) 0%, rgba(5,5,12,0.05) 40%, rgba(5,5,12,0.82) 85%, rgba(5,5,12,0.98) 100%)`,
                    }
                }),

                // 右上コーナーグロー
                h("div", {
                    style: {
                        position: "absolute", top: "-60px", right: "-60px",
                        width: "360px", height: "360px",
                        background: `radial-gradient(circle, ${rl}28 0%, transparent 65%)`,
                        display: "flex",
                    }
                }),

                // sheen（光沢）
                h("div", {
                    style: {
                        position: "absolute", inset: 0, display: "flex",
                        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 25%, transparent 50%)",
                    }
                }),

                // 上部バッジ行
                h("div", {
                    style: {
                        position: "absolute", top: "36px", left: "48px", right: "48px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }
                },
                    // Founding badge
                    h("div", {
                        style: {
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "7px 18px", borderRadius: "6px",
                            background: `${rl}22`, border: `1px solid ${rl}55`,
                            backdropFilter: "blur(8px)",
                        }
                    },
                        h("div", { style: { width: "7px", height: "7px", borderRadius: "50%", background: rl, display: "flex", boxShadow: `0 0 8px ${rl}` } }),
                        h("span", {
                            style: {
                                fontSize: "16px", fontWeight: 900, color: rl,
                                letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "monospace",
                            }
                        }, isFounding ? "FOUNDING MEMBER" : "EARLY MEMBER")
                    ),

                    // Serial ID
                    serialId && h("span", {
                        style: {
                            fontSize: "15px", fontFamily: "monospace", color: "rgba(255,255,255,0.28)",
                            letterSpacing: "0.1em", fontWeight: 600,
                        }
                    }, serialId)
                ),

                // 名前エリア（写真下部に重ねる）
                h("div", {
                    style: {
                        position: "absolute", bottom: "40px", left: "48px", right: "48px",
                        display: "flex", flexDirection: "column", gap: "0px",
                    }
                },
                    // Role line
                    h("div", {
                        style: {
                            display: "flex", alignItems: "center", gap: "14px",
                            marginBottom: "14px",
                        }
                    },
                        h("div", { style: { width: "32px", height: "3px", background: rl, borderRadius: "2px", display: "flex" } }),
                        h("span", {
                            style: {
                                fontSize: "18px", fontWeight: 800, color: `${rl}dd`,
                                letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "monospace",
                            }
                        }, `${roleLabel}${sport ? "  /  " + sport : ""}`)
                    ),

                    // 名前
                    h("div", {
                        style: {
                            fontSize: nameFzS, fontWeight: 900, color: "#fff",
                            lineHeight: 0.92, letterSpacing: "-0.03em", display: "flex",
                            textShadow: `0 0 80px ${rl}50, 0 4px 30px rgba(0,0,0,0.95)`,
                        }
                    }, displayName)
                )
            ),

            // ── カード内：情報エリア（下半分）
            h("div", {
                style: {
                    flex: 1, display: "flex", flexDirection: "column",
                    padding: "52px 56px 56px",
                    background: `linear-gradient(180deg, rgba(8,8,16,0.0) 0%, rgba(8,8,16,1.0) 12%)`,
                }
            },
                // @slug + location
                h("div", {
                    style: {
                        display: "flex", alignItems: "center", gap: "16px",
                        marginBottom: "36px",
                    }
                },
                    h("span", {
                        style: {
                            fontSize: "24px", color: "rgba(255,255,255,0.38)",
                            fontFamily: "monospace", letterSpacing: "0.04em",
                        }
                    }, `@${slug}`),
                    location && h("div", { style: { width: "4px", height: "4px", borderRadius: "50%", background: `${rl}60`, display: "flex" } }),
                    location && h("span", {
                        style: {
                            fontSize: "24px", color: "rgba(255,255,255,0.3)",
                            fontFamily: "monospace",
                        }
                    }, location)
                ),

                // Bio
                bio && h("div", {
                    style: {
                        display: "flex", marginBottom: "44px",
                        paddingLeft: "20px",
                        borderLeft: `3px solid ${rl}55`,
                    }
                },
                    h("span", {
                        style: {
                            fontSize: "26px", color: "rgba(255,255,255,0.52)",
                            lineHeight: 1.65,
                        }
                    }, bio.length > 38 ? bio.slice(0, 38) + "..." : bio)
                ),

                // セパレーター
                h("div", {
                    style: {
                        height: "1px", marginBottom: "44px",
                        background: `linear-gradient(90deg, ${rl}45 0%, rgba(255,255,255,0.06) 50%, transparent 100%)`,
                        display: "flex",
                    }
                }),

                // Stats: Cheer + Role
                h("div", {
                    style: {
                        display: "flex", alignItems: "center",
                        marginBottom: "auto", gap: "0px",
                    }
                },
                    // Cheer
                    h("div", {
                        style: { display: "flex", flexDirection: "column", gap: "10px", flex: 1 }
                    },
                        h("span", {
                            style: {
                                fontSize: "14px", color: "rgba(255,214,0,0.45)",
                                letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "monospace",
                            }
                        }, "CHEER"),
                        h("div", {
                            style: { display: "flex", alignItems: "baseline", gap: "10px" }
                        },
                            h("span", {
                                style: {
                                    fontSize: "80px", fontWeight: 900, color: "#FFD600",
                                    fontFamily: "monospace", lineHeight: 1,
                                    textShadow: "0 0 40px rgba(255,214,0,0.5)",
                                }
                            }, cheerCount.toLocaleString()),
                            h("svg", {
                                viewBox: "0 0 24 24", width: "32", height: "32",
                                fill: "#FFD600", style: { opacity: 0.55, display: "flex", marginBottom: "6px" }
                            },
                                h("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" })
                            )
                        )
                    ),

                    // 縦セパレーター
                    h("div", {
                        style: {
                            width: "1px", height: "88px",
                            background: `linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)`,
                            margin: "0 56px", display: "flex",
                        }
                    }),

                    // Role
                    h("div", {
                        style: { display: "flex", flexDirection: "column", gap: "10px", flex: 1 }
                    },
                        h("span", {
                            style: {
                                fontSize: "14px", color: "rgba(255,255,255,0.28)",
                                letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "monospace",
                            }
                        }, "ROLE"),
                        h("span", {
                            style: {
                                fontSize: "38px", fontWeight: 900, color: rl,
                                fontFamily: "monospace", lineHeight: 1,
                                textShadow: `0 0 24px ${rl}50`,
                            }
                        }, roleLabel)
                    )
                ),

                // 下部セパレーター
                h("div", {
                    style: {
                        height: "1px", marginTop: "44px", marginBottom: "36px",
                        background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, ${rl}30 100%)`,
                        display: "flex",
                    }
                }),

                // URL行
                h("div", {
                    style: {
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }
                },
                    h("span", {
                        style: {
                            fontSize: "20px", color: "rgba(255,255,255,0.2)",
                            fontFamily: "monospace", letterSpacing: "0.04em",
                        }
                    }, `vizion-connection.jp/u/${slug}`),
                    // ドット装飾
                    h("div", { style: { display: "flex", gap: "8px", alignItems: "center" } },
                        h("div", { style: { width: "8px", height: "8px", borderRadius: "50%", background: rl, opacity: 0.9, display: "flex", boxShadow: `0 0 8px ${rl}` } }),
                        h("div", { style: { width: "8px", height: "8px", borderRadius: "50%", background: rl, opacity: 0.4, display: "flex" } }),
                        h("div", { style: { width: "8px", height: "8px", borderRadius: "50%", background: rl, opacity: 0.15, display: "flex" } })
                    )
                )
            )
        ),

        // ══════════════════════════════════════════
        // 下部ロゴバー（上部とシンメトリー）
        // ══════════════════════════════════════════
        h("div", {
            style: {
                position: "absolute",
                bottom: `${(CARD_TOP - 100) / 2 + 20}px`,
                left: 0, right: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "16px",
            }
        },
            h("div", { style: { width: "24px", height: "1px", background: "rgba(255,255,255,0.15)", display: "flex" } }),
            h("span", {
                style: {
                    fontSize: "14px", color: "rgba(255,255,255,0.2)",
                    letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "monospace",
                }
            }, "PROOF OF EXISTENCE"),
            h("div", { style: { width: "24px", height: "1px", background: "rgba(255,255,255,0.15)", display: "flex" } })
        )
    );
}
