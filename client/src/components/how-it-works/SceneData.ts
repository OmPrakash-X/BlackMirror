export const SCENES = [
    {
        id: 0,
        title: "You Upload Your Content",
        step: "STEP 01",
        explainer:
            "You drop your image or video into BlackMirror. Our system accepts photos, screenshots, and videos — anything you want to verify as real or fake.",
        color: "#00f5ff",
    },
    {
        id: 1,
        title: "We Prepare It for the AI",
        step: "STEP 02",
        explainer:
            "Before analysis, we standardize your content — resize it to 224×224 pixels, balance the color channels, and normalize it so our AI can examine it fairly against everything it has learned.",
        color: "#7c3aed",
    },
    {
        id: 2,
        title: "AI Scans for Hidden Patterns",
        step: "STEP 03",
        explainer:
            "Our EfficientNet-B0 AI scans every pixel layer by layer — hunting for unnatural smoothness, weird blending at edges, or pixel patterns that only appear in AI-generated or manipulated content.",
        color: "#f59e0b",
    },
    {
        id: 3,
        title: "Suspicion Score Calculated",
        step: "STEP 04",
        explainer:
            "The AI outputs a score from 0% to 100%. The higher the score, the more suspicious your content is. 87% means the AI is 87% confident this image was manipulated.",
        color: "#ef4444",
    },
    {
        id: 4,
        title: "Videos: Frame-by-Frame Scan",
        step: "STEP 05",
        explainer:
            "For videos, we don't just check one moment. We scan up to 120 frames, detect every face in each frame, and check them one by one. Nothing slips through.",
        color: "#10b981",
    },
    {
        id: 5,
        title: "Risk Level Assigned",
        step: "STEP 06",
        explainer:
            "Based on the score, we label your content: LOW RISK (probably safe, score below 40%), SUSPICIOUS (be careful, 40–70%), or HIGH RISK (very likely fake, above 70%).",
        color: "#f59e0b",
    },
    {
        id: 6,
        title: "Your Verdict Is Ready",
        step: "STEP 07",
        explainer:
            "Your result appears instantly — the label (REAL or FAKE), the confidence percentage, and the risk level. No technical jargon. Just the truth about your content.",
        color: "#00f5ff",
    },
];
