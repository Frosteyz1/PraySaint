"use client";
import { useState, useRef, useEffect } from "react";
import ShareButton from "@/components/ShareButton";
import ReflectionPrompt from "@/components/ReflectionPrompt";

/* ─── Rosary Structure ───────────────────────────────────────────── */
// 12 beads per decade: Our Father(0) + 10 Hail Marys(1-10) + Glory Be(11)
const BEADS_PER_DECADE = 12;
const TOTAL_BEADS      = 5 * BEADS_PER_DECADE;  // 60

// Pre-loop stem steps: 0=cross, 1=ourFather, 2-4=hailMary×3, 5=gloryBe
const STEM_STEPS  = 6;
const TOTAL_STEPS = STEM_STEPS + TOTAL_BEADS;   // 66

/* ─── Traditional prayers ────────────────────────────────────────── */
const PRAYERS = {
  creed: "I believe in God, the Father Almighty, Creator of Heaven and earth; and in Jesus Christ, His only Son Our Lord, Who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried. He descended into Hell; the third day He rose again from the dead; He ascended into Heaven, and sitteth at the right hand of God, the Father almighty; from thence He shall come to judge the living and the dead. I believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body and life everlasting. Amen.",
  ourFather: "Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
  hailMary: "Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
  gloryBe: "Glory be to the Father, and to the Son, and to the Holy Spirit; as it was in the beginning, is now, and ever shall be, world without end. Amen.",
  fatima: "O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those in most need of Thy mercy.",
  hailHolyQueen: "Hail, Holy Queen, Mother of Mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O holy Mother of God. That we may be made worthy of the promises of Christ.",
};

/* ─── Hardcoded mysteries ────────────────────────────────────────── */
const MYSTERY_SETS = {
  Joyful: {
    days: "Monday & Saturday",
    color: "#6ba8d8",
    mysteries: [
      { name: "The Annunciation", scriptureRef: "Luke 1:26–38", fruit: "Humility", meditation: "The Angel Gabriel appears to Mary and announces she will bear the Son of God. In her perfect humility, she answers: 'Let it be done to me according to your word.' In this moment, the Eternal Word took flesh. Contemplate Mary's total openness to God's will." },
      { name: "The Visitation", scriptureRef: "Luke 1:39–45", fruit: "Love of Neighbor", meditation: "Mary hastens to visit her cousin Elizabeth, who is with child. At Mary's greeting, the infant John leaps for joy in the womb. Even bearing the Son of God, Mary's first impulse is charity toward another. Ask for a generous heart." },
      { name: "The Nativity", scriptureRef: "Luke 2:1–20", fruit: "Poverty of Spirit", meditation: "The King of kings is born in a stable, laid in a manger, with only shepherds as witnesses. God chose the lowliest of settings to enter the world. Contemplate how God exalts the humble and dwells with the poor in spirit." },
      { name: "The Presentation", scriptureRef: "Luke 2:22–38", fruit: "Obedience", meditation: "Mary and Joseph present the infant Jesus at the Temple in obedience to the Law of Moses. Simeon prophesies that a sword will pierce Mary's soul. This moment foreshadows the Cross. Offer your own obediences to God today." },
      { name: "Finding in the Temple", scriptureRef: "Luke 2:41–52", fruit: "Piety", meditation: "After three days of frantic searching, Mary and Joseph find the twelve-year-old Jesus in the Temple, about His Father's business. Jesus is always found in the Father's house. Let your heart be His temple." },
    ],
  },
  Sorrowful: {
    days: "Tuesday & Friday",
    color: "#9b6ba8",
    mysteries: [
      { name: "The Agony in the Garden", scriptureRef: "Luke 22:39–46", fruit: "Conformity to God's Will", meditation: "In Gethsemane, Jesus sweats blood in agony, yet prays: 'Not my will, but yours be done.' He faces the full weight of human sin and suffering in this dark hour. Unite your own trials to His prayer of surrender." },
      { name: "The Scourging at the Pillar", scriptureRef: "John 19:1", fruit: "Mortification", meditation: "Jesus is bound and beaten, his body torn by the scourge. He endures this violence for our sins of the flesh. Each stripe is an act of infinite love. Ask for the grace to offer your bodily sufferings as prayer." },
      { name: "The Crowning with Thorns", scriptureRef: "Mark 15:17–20", fruit: "Moral Courage", meditation: "Soldiers mock the King of Kings, pressing a crown of thorns into His sacred head. Jesus bears this humiliation in silence. Pray for the courage to bear mockery and misunderstanding for the sake of truth and faith." },
      { name: "The Carrying of the Cross", scriptureRef: "Luke 23:26–32", fruit: "Patience", meditation: "Jesus carries the instrument of His execution through the streets of Jerusalem. He falls and rises again. Simon of Cyrene is pressed into service. Every cross we carry, He has already carried. Take up yours with courage today." },
      { name: "The Crucifixion", scriptureRef: "Luke 23:33–46", fruit: "Perseverance", meditation: "On Calvary, the Son of God gives His last breath for our salvation. 'Father, forgive them.' 'Today you will be with me in Paradise.' 'It is finished.' In the depths of suffering, love is made complete. Stay at the foot of the Cross." },
    ],
  },
  Glorious: {
    days: "Wednesday & Sunday",
    color: "#d4a017",
    mysteries: [
      { name: "The Resurrection", scriptureRef: "John 20:1–10", fruit: "Faith", meditation: "On the third day, the tomb is empty and death is defeated. The Risen Christ appears to Mary Magdalene, to the disciples, to more than five hundred. This is the foundation of our faith. Let the Resurrection fill you with unshakeable hope." },
      { name: "The Ascension", scriptureRef: "Luke 24:50–53", fruit: "Hope", meditation: "Forty days after the Resurrection, Jesus ascends into Heaven, promising to send the Holy Spirit. He goes before us to prepare a place. Our homeland is Heaven. Let hope in the life to come order your desires today." },
      { name: "The Descent of the Holy Spirit", scriptureRef: "Acts 2:1–11", fruit: "Love of God", meditation: "On Pentecost, tongues of fire rest on the Apostles and they are filled with the Holy Spirit. The Church is born. The same Spirit dwells in you through Baptism and Confirmation. Ask Him to set your heart on fire today." },
      { name: "The Assumption of Mary", scriptureRef: "CCC 966", fruit: "Grace of a Happy Death", meditation: "At the end of her earthly life, Mary is taken body and soul into heavenly glory. She is the first fruits of the Resurrection. She awaits us with maternal love. Ask her to be with you at the hour of your death." },
      { name: "The Coronation of Mary", scriptureRef: "Revelation 12:1", fruit: "Trust in Mary's Intercession", meditation: "Mary is crowned Queen of Heaven and Earth, seated at the right hand of her Son. All the angels and saints honor her. As our Queen and Mother, she intercedes ceaselessly for us. Place all your needs in her hands." },
    ],
  },
  Luminous: {
    days: "Thursday",
    color: "#7cc47f",
    mysteries: [
      { name: "The Baptism in the Jordan", scriptureRef: "Matthew 3:13–17", fruit: "Openness to the Holy Spirit", meditation: "Jesus is baptized by John, and the Father's voice thunders: 'This is my beloved Son.' The Holy Spirit descends as a dove. Recall your own Baptism — the moment you became a child of God. Renew your openness to the Spirit." },
      { name: "The Wedding at Cana", scriptureRef: "John 2:1–11", fruit: "Fidelity", meditation: "At Mary's intercession, Jesus performs His first miracle, turning water into wine at a wedding feast. Mary's instruction to the servants is her message to us: 'Do whatever He tells you.' Commit to faithful obedience today." },
      { name: "The Proclamation of the Kingdom", scriptureRef: "Mark 1:15", fruit: "Repentance", meditation: "Jesus proclaims: 'The kingdom of God is at hand; repent and believe in the Gospel.' He calls sinners, heals the sick, forgives the penitent. The door of mercy is always open. Come before Him with a contrite heart today." },
      { name: "The Transfiguration", scriptureRef: "Luke 9:28–36", fruit: "Desire for Holiness", meditation: "On Mount Tabor, Jesus is transfigured before Peter, James, and John — His face shining like the sun, His garments blazing white. We are made for glory. This is our destiny. Let the vision of holiness ignite your desire for God." },
      { name: "The Institution of the Eucharist", scriptureRef: "Luke 22:14–20", fruit: "Eucharistic Adoration", meditation: "At the Last Supper, Jesus takes bread and wine and says: 'This is my body; this is my blood.' Every Mass re-presents this sacrifice. He gives Himself entirely. Receive Him with all the love, faith, and wonder you can bring." },
    ],
  },
};

/* ─── localStorage helpers ───────────────────────────────────────── */
function getStreak() {
  try {
    const raw = localStorage.getItem("patronforge_rosary_streak");
    if (!raw) return 0;
    const s = JSON.parse(raw);
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (s.lastDate === today || s.lastDate === yesterday) return s.count;
    return 0;
  } catch { return 0; }
}
function bumpStreak() {
  try {
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const raw = localStorage.getItem("patronforge_rosary_streak");
    const s   = raw ? JSON.parse(raw) : { count: 0, lastDate: null };
    if (s.lastDate === today) return s.count;
    const newCount = s.lastDate === yesterday ? s.count + 1 : 1;
    localStorage.setItem("patronforge_rosary_streak", JSON.stringify({ count: newCount, lastDate: today }));
    return newCount;
  } catch { return 1; }
}

/* ─── HiDPI canvas setup ─────────────────────────────────────────── */
function setupHiDPI(canvas, dw, dh) {
  const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
  canvas.width  = dw * dpr;
  canvas.height = dh * dpr;
  canvas.style.width  = dw + "px";
  canvas.style.height = dh + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return ctx;
}

/* ─── 3D Pearl Bead ──────────────────────────────────────────────── */
function draw3DBead(ctx, x, y, r, baseColor, highlightColor, darkColor) {
  const shadowGrad = ctx.createRadialGradient(x + r * 0.18, y + r * 0.22, 0, x + r * 0.18, y + r * 0.22, r * 1.3);
  shadowGrad.addColorStop(0, "rgba(0,0,0,0.30)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x + r * 0.12, y + r * 0.25, r * 0.88, r * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  const grad = ctx.createRadialGradient(x - r * 0.30, y - r * 0.30, r * 0.02, x, y, r);
  grad.addColorStop(0,    "rgba(255,255,255,0.92)");
  grad.addColorStop(0.13, highlightColor);
  grad.addColorStop(0.48, baseColor);
  grad.addColorStop(0.80, darkColor);
  grad.addColorStop(1,    "rgba(0,0,0,0.65)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  const rimGrad = ctx.createRadialGradient(x, y, r * 0.68, x, y, r);
  rimGrad.addColorStop(0, "rgba(0,0,0,0)");
  rimGrad.addColorStop(1, "rgba(0,0,0,0.20)");
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  const sx = x - r * 0.30, sy = y - r * 0.30, sr = r * 0.30;
  const specGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
  specGrad.addColorStop(0, "rgba(255,255,255,0.88)");
  specGrad.addColorStop(0.55, "rgba(255,255,255,0.28)");
  specGrad.addColorStop(1,  "rgba(255,255,255,0)");
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();
}

/* ─── Gold chain segment ─────────────────────────────────────────── */
function drawChain(ctx, x1, y1, x2, y2, active) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = active ? "rgba(212,160,23,0.65)" : "rgba(212,160,23,0.22)";
  ctx.lineWidth = 1.3;
  ctx.lineCap = "round";
  ctx.stroke();
}

/* ─── Center medallion ───────────────────────────────────────────── */
function drawMedallion(ctx, cx, cy, r) {
  ctx.save();
  ctx.shadowBlur  = 18;
  ctx.shadowColor = "rgba(212,160,23,0.7)";
  ctx.beginPath();
  ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(212,160,23,0.3)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const grad = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.32, r * 0.06, cx, cy, r);
  grad.addColorStop(0, "#f4d068");
  grad.addColorStop(0.55, "#d4a017");
  grad.addColorStop(1, "#7a5008");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.55); ctx.lineTo(cx, cy + r * 0.55);
  ctx.moveTo(cx - r * 0.42, cy - r * 0.1); ctx.lineTo(cx + r * 0.42, cy - r * 0.1);
  ctx.stroke();
}

/* ─── Crucifix at stem bottom ────────────────────────────────────── */
function drawCrucifix(ctx, cx, topY, size) {
  const botY      = topY + size * 2.4;
  const leftX     = cx - size * 0.72;
  const rightX    = cx + size * 0.72;
  const crossbarY = topY + size * 0.65;

  ctx.save();
  ctx.shadowBlur  = 22;
  ctx.shadowColor = "rgba(212,160,23,0.75)";

  const grad = ctx.createLinearGradient(leftX, topY, rightX, botY);
  grad.addColorStop(0, "#f4d068");
  grad.addColorStop(0.45, "#d4a017");
  grad.addColorStop(1, "#7a5008");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx, botY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(leftX, crossbarY);
  ctx.lineTo(rightX, crossbarY);
  ctx.stroke();

  ctx.shadowBlur = 10;
  [[cx, topY], [cx, botY], [leftX, crossbarY], [rightX, crossbarY]].forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#f4d068";
    ctx.fill();
  });
  ctx.restore();
}

/* ─── Main rosary draw ───────────────────────────────────────────── */
function drawRosary(canvas, currentStep, accentColor) {
  if (!canvas) return;

  // Derive loop bead index (-1 = still in stem phase)
  const loopBead      = currentStep < STEM_STEPS ? -1 : currentStep - STEM_STEPS;
  // Which stem bead is active (0=Glory Be top, 4=Our Father bottom); -1 = none
  const activeStemIdx = (currentStep >= 1 && currentStep < STEM_STEPS)
    ? (STEM_STEPS - 1 - currentStep)   // step1→4(father), step5→0(glory)
    : -1;
  const isCrossActive = currentStep === 0;

  const DW = 540, DH = 640;
  const ctx = setupHiDPI(canvas, DW, DH);
  const W = DW, H = DH;

  /* ── Rich background ── */
  const bg = ctx.createRadialGradient(W / 2, H * 0.28, 10, W / 2, H * 0.28, W * 0.9);
  bg.addColorStop(0,   "#111e45");
  bg.addColorStop(0.45, "#080e26");
  bg.addColorStop(1,   "#020610");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  /* Cathedral gold top-glow */
  const topGlow = ctx.createRadialGradient(W / 2, -20, 0, W / 2, -20, W * 0.72);
  topGlow.addColorStop(0, "rgba(212,160,23,0.18)");
  topGlow.addColorStop(0.6, "rgba(212,160,23,0.04)");
  topGlow.addColorStop(1, "rgba(212,160,23,0)");
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, H);

  /* Mystery accent glow at oval center */
  const aR = parseInt(accentColor.slice(1, 3), 16);
  const aG = parseInt(accentColor.slice(3, 5), 16);
  const aB = parseInt(accentColor.slice(5, 7), 16);
  const accentGlow = ctx.createRadialGradient(W / 2, 170, 0, W / 2, 170, W * 0.58);
  accentGlow.addColorStop(0, `rgba(${aR},${aG},${aB},0.11)`);
  accentGlow.addColorStop(0.5, `rgba(${aR},${aG},${aB},0.04)`);
  accentGlow.addColorStop(1, `rgba(${aR},${aG},${aB},0)`);
  ctx.fillStyle = accentGlow;
  ctx.fillRect(0, 0, W, H);

  /* Subtle star particles */
  const starSeed = [
    [42, 28], [108, 55], [480, 40], [510, 90], [22, 180], [525, 200],
    [60, 420], [498, 380], [130, 590], [400, 610], [270, 18], [35, 320],
    [505, 300], [480, 520], [80, 550],
  ];
  starSeed.forEach(([sx, sy]) => {
    const r = (((sx * 13 + sy * 7) % 3) + 1) * 0.6;
    const a = 0.18 + ((sx + sy) % 5) * 0.06;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,248,220,${a})`;
    ctx.fill();
  });

  /* ─── Oval loop parameters ─── */
  const cx = W / 2;
  const cy = 170;
  const rx = 205;
  const ry = 135;

  function beadPos(i) {
    const angle = Math.PI / 2 - (i / TOTAL_BEADS) * Math.PI * 2;
    return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
  }

  /* Faint oval track guide */
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx + 1, ry + 1, 0, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${aR},${aG},${aB},0.10)`;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  /* Loop chain segments */
  for (let i = 0; i < TOTAL_BEADS; i++) {
    const { x: x1, y: y1 } = beadPos(i);
    const { x: x2, y: y2 } = beadPos((i + 1) % TOTAL_BEADS);
    drawChain(ctx, x1, y1, x2, y2, i < loopBead);
  }

  /* ─── Stem: Glory Be (top/junction) → Hail Marys → Our Father → Cross ─── */
  const junctionX = cx;
  const junctionY = cy + ry;   // bead 0 (junction) center
  const bead0R    = 13;

  // CORRECT ORDER going DOWN from junction:
  // index 0 = Glory Be   (dy smallest = closest to junction = LAST prayed before loop)
  // index 4 = Our Father (dy largest  = closest to cross    = FIRST prayed above cross)
  const stemBeads = [
    { dy: 38,  r: 7,  type: "glorybe" },  // Glory Be  (top of stem, closest to junction)
    { dy: 64,  r: 7,  type: "hail"    },  // Hail Mary 3
    { dy: 90,  r: 7,  type: "hail"    },  // Hail Mary 2
    { dy: 116, r: 7,  type: "hail"    },  // Hail Mary 1
    { dy: 150, r: 11, type: "father"  },  // Our Father (bottom of stem, closest to cross)
  ];

  // Stem chains — lit progressively as steps are prayed (bottom-up)
  // Chain idx (0=junction→glory, 4=hail1→father, 5=father→cross)
  // Chain idx is lit when currentStep >= STEM_STEPS - idx
  let prevY = junctionY + bead0R;
  stemBeads.forEach(({ dy, r }, idx) => {
    const sy = junctionY + dy;
    const chainLit = currentStep >= (STEM_STEPS - idx);
    drawChain(ctx, junctionX, prevY, junctionX, sy - r, chainLit);
    prevY = sy + r;
  });
  const lastStemBead = stemBeads[stemBeads.length - 1];
  const crucifixTopY = junctionY + lastStemBead.dy + lastStemBead.r + 18;
  drawChain(ctx, junctionX, prevY, junctionX, crucifixTopY, currentStep >= 1);

  /* Crucifix — glow if we're on it */
  if (isCrossActive) {
    const crossCY = crucifixTopY + 20;
    for (let g = 5; g >= 1; g--) {
      ctx.beginPath();
      ctx.arc(junctionX, crossCY, 18 + g * 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,160,23,${0.055 / g})`;
      ctx.fill();
    }
  }
  drawCrucifix(ctx, junctionX, crucifixTopY, 16);

  /* Stem beads — active, past, or future */
  stemBeads.forEach(({ dy, r, type }, idx) => {
    const sy = junctionY + dy;
    const isStemActive = idx === activeStemIdx;
    // Past = lower in stem (higher idx = closer to cross) = already prayed
    const isStemPast   = (loopBead >= 0) || (activeStemIdx >= 0 && idx > activeStemIdx);

    if (isStemActive) {
      for (let g = 3; g >= 1; g--) {
        ctx.beginPath();
        ctx.arc(junctionX, sy, r + g * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,160,23,${0.09 / g})`;
        ctx.fill();
      }
      ctx.shadowBlur = 22; ctx.shadowColor = "#f0c040";
      draw3DBead(ctx, junctionX, sy, r, "#f0c040", "#fef8b0", "#b8860b");
      ctx.shadowBlur = 0;
    } else if (isStemPast) {
      draw3DBead(ctx, junctionX, sy, r, "#c89510", "#e8b840", "#7a5008");
    } else if (type === "glorybe") {
      draw3DBead(ctx, junctionX, sy, r, "#304890", "#5878c0", "#1c2e68");
    } else if (type === "father") {
      draw3DBead(ctx, junctionX, sy, r, "#3a6898", "#6898c8", "#1e3a78");
    } else {
      draw3DBead(ctx, junctionX, sy, r, "#2a4070", "#4868a0", "#182858");
    }
  });

  /* ─── Loop beads ─── */
  for (let i = 0; i < TOTAL_BEADS; i++) {
    const { x: bx, y: by } = beadPos(i);
    const posInDecade = i % BEADS_PER_DECADE;
    const isOurFather = posInDecade === 0;
    const isGloryBe   = posInDecade === 11;
    const isActive    = i === loopBead;
    const isPast      = i < loopBead;
    const beadR       = isOurFather ? 13 : 8;

    if (isActive) {
      for (let g = 3; g >= 1; g--) {
        ctx.beginPath();
        ctx.arc(bx, by, beadR + g * 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,160,23,${0.08 / g})`;
        ctx.fill();
      }
      ctx.shadowBlur = 26; ctx.shadowColor = "#f0c040";
    }

    if (isActive) {
      draw3DBead(ctx, bx, by, beadR, "#f0c040", "#fff8c0", "#b8860b");
    } else if (isPast) {
      draw3DBead(ctx, bx, by, beadR, "#c89510", "#e8b840", "#7a5008");
    } else if (isOurFather) {
      draw3DBead(ctx, bx, by, beadR, "#3a6898", "#6898c8", "#1e3a78");
    } else if (isGloryBe) {
      draw3DBead(ctx, bx, by, beadR, "#304890", "#5878c0", "#1c2e68");
    } else {
      draw3DBead(ctx, bx, by, beadR, "#2a4070", "#4868a0", "#182858");
    }

    ctx.shadowBlur = 0;

    if (isOurFather && !isActive) {
      ctx.font = "bold 7px Arial";
      ctx.fillStyle = isPast ? "rgba(255,240,180,0.7)" : "rgba(180,210,255,0.75)";
      ctx.textAlign = "center";
      ctx.fillText(Math.floor(i / BEADS_PER_DECADE) + 1, bx, by + 2.5);
    }
    if (isOurFather && isActive) {
      ctx.font = "bold 7px Arial";
      ctx.fillStyle = "rgba(8,14,40,0.9)";
      ctx.textAlign = "center";
      ctx.fillText(Math.floor(i / BEADS_PER_DECADE) + 1, bx, by + 2.5);
    }
  }

  /* Accent stripe at bottom — mystery color hint */
  const stripe = ctx.createLinearGradient(0, H - 4, W, H - 4);
  stripe.addColorStop(0, "transparent");
  stripe.addColorStop(0.3, `rgba(${aR},${aG},${aB},0.4)`);
  stripe.addColorStop(0.7, `rgba(${aR},${aG},${aB},0.4)`);
  stripe.addColorStop(1, "transparent");
  ctx.fillStyle = stripe;
  ctx.fillRect(0, H - 3, W, 3);
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function RosaryPage() {
  const MYSTERY_NAMES = ["Joyful", "Sorrowful", "Glorious", "Luminous"];

  // Pick default based on day of week (traditional Catholic custom)
  function getDefaultMystery() {
    const day = new Date().getDay(); // 0=Sun, 1=Mon, ...
    if (day === 0 || day === 3) return "Glorious";   // Sun, Wed
    if (day === 1 || day === 6) return "Joyful";     // Mon, Sat
    if (day === 2 || day === 5) return "Sorrowful";  // Tue, Fri
    return "Luminous";                                 // Thu
  }

  const [selectedMystery, setSelectedMystery] = useState(getDefaultMystery());
  const [currentStep,     setCurrentStep]     = useState(0);  // 0=cross … 5=gloryBe … 6–65=loop
  const [complete,        setComplete]         = useState(false);
  const [showReflection,  setShowReflection]   = useState(false);
  const [streak,          setStreak]           = useState(0);

  const canvasRef = useRef(null);
  const shareRef  = useRef(null);

  useEffect(() => { setStreak(getStreak()); }, []);

  const mysteryData = MYSTERY_SETS[selectedMystery];
  const accentColor = mysteryData.color;

  // Stem phase vs loop phase
  const isPreLoop  = currentStep < STEM_STEPS;
  const loopBead   = isPreLoop ? -1 : currentStep - STEM_STEPS; // -1 or 0–59
  const progress   = Math.round((currentStep / (TOTAL_STEPS - 1)) * 100);

  // Loop-specific derivations (safe to compute, ignored during pre-loop)
  const decadeIndex    = isPreLoop ? 0 : Math.floor(loopBead / BEADS_PER_DECADE);
  const posInDecade    = isPreLoop ? -1 : loopBead % BEADS_PER_DECADE;
  const currentMystery = mysteryData.mysteries[Math.min(decadeIndex, 4)];

  // What prayer are we currently on?
  function getCurrentPrayer() {
    if (isPreLoop) {
      const stemMap = [
        { title: "Sign of the Cross & Apostles' Creed", label: "Crucifix",            type: "creed"    },
        { title: "Our Father",                          label: "1st Stem Bead",        type: "ourFather" },
        { title: "Hail Mary — for Faith",               label: "2nd Stem Bead",        type: "hailMary"  },
        { title: "Hail Mary — for Hope",                label: "3rd Stem Bead",        type: "hailMary"  },
        { title: "Hail Mary — for Charity",             label: "4th Stem Bead",        type: "hailMary"  },
        { title: "Glory Be",                            label: "5th Stem Bead",        type: "gloryBe"   },
      ];
      return stemMap[currentStep];
    }
    if (posInDecade === 0)  return { title: "Our Father",               label: `Decade ${decadeIndex + 1} — Large Bead`, type: "ourFather" };
    if (posInDecade === 11) return { title: "Glory Be + Fatima Prayer", label: `Decade ${decadeIndex + 1} — Connector`,  type: "gloryBe"   };
    return { title: `Hail Mary ${posInDecade}`, label: `Decade ${decadeIndex + 1} — Bead ${posInDecade}`, type: "hailMary" };
  }
  const prayerInfo = getCurrentPrayer();

  useEffect(() => {
    drawRosary(canvasRef.current, currentStep, accentColor);
  }, [currentStep, accentColor]);

  // Reset when mystery changes
  function selectMystery(name) {
    setSelectedMystery(name);
    setCurrentStep(0);
    setComplete(false);
  }

  function advanceBead() {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setComplete(true);
      setStreak(bumpStreak());
    }
  }

  function handleKeyDown(e) {
    if (["Enter", " ", "ArrowRight"].includes(e.key)) { e.preventDefault(); advanceBead(); }
  }

  return (
    <div style={{ background: "var(--bg-page)", color: "var(--fg-primary)", minHeight: "100vh" }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="page-hero" style={{ padding: "64px 24px 72px", textAlign: "center" }}>
        <p style={{ color: "rgba(212,160,23,0.72)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "12px" }}>
          CCC 2708 · Contemplative Prayer
        </p>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.2rem, 5vw, 3.6rem)", fontWeight: 700, color: "#f0e8d5", lineHeight: 1.15, marginBottom: "14px" }}>
          The Holy Rosary
        </h1>
        <p style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1.05rem", lineHeight: 1.8, color: "rgba(240,232,213,0.65)", maxWidth: "500px", margin: "0 auto 0" }}>
          Pray all five decades, bead by bead, with mystery meditations and traditional prayers.
        </p>
        {streak > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "18px", padding: "8px 18px", borderRadius: "999px", background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.25)", color: "#f0c040", fontSize: "12px", fontWeight: 700 }}>
            🔥 {streak}-day streak!
          </div>
        )}
      </section>

      {/* ── Mystery selector tabs ─────────────────────────────────── */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)", position: "sticky", top: "56px", zIndex: 10 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", gap: "0", overflowX: "auto" }} role="tablist" aria-label="Rosary mystery sets">
            {MYSTERY_NAMES.map((name) => {
              const set = MYSTERY_SETS[name];
              const isActive = selectedMystery === name;
              return (
                <button
                  key={name}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectMystery(name)}
                  style={{
                    padding: "14px 20px",
                    background: "none",
                    border: "none",
                    borderBottom: isActive ? `2px solid ${set.color}` : "2px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    whiteSpace: "nowrap",
                    fontSize: "0.88rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? set.color : "var(--fg-muted)",
                  }}
                >
                  {name}
                  <span style={{ display: "block", fontSize: "9px", letterSpacing: "0.05em", marginTop: "2px", color: isActive ? set.color : "var(--fg-muted)", opacity: 0.7 }}>
                    {set.days}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main layout: rosary canvas + prayer panel ─────────────── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>

          {/* LEFT: Rosary canvas */}
          <div>
            {/* Progress bar */}
            {!complete && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", fontSize: "11px", color: "var(--fg-muted)", fontWeight: 600 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  {isPreLoop
                    ? ["Crucifix", "Our Father", "Hail Mary 1", "Hail Mary 2", "Hail Mary 3", "Glory Be"][currentStep]
                    : posInDecade === 0
                      ? `Decade ${decadeIndex + 1} · Our Father`
                      : posInDecade === 11
                        ? `Decade ${decadeIndex + 1} · Glory Be`
                        : `Decade ${decadeIndex + 1} · Hail Mary ${posInDecade}`}
                </span>
                <div style={{ flex: 1, height: "5px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
                  <div
                    style={{ height: "100%", borderRadius: "999px", background: `linear-gradient(90deg, ${accentColor}, #f0c040)`, width: `${progress}%`, transition: "width 0.3s ease" }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Rosary progress: ${progress}%`}
                  />
                </div>
                <span>{progress}%</span>
              </div>
            )}

            {/* Canvas wrapper with float animation */}
            <div
              ref={shareRef}
              className="animate-card-float"
              style={{ textAlign: "center" }}
            >
              <canvas
                ref={canvasRef}
                width={540}
                height={640}
                className="mx-auto cursor-pointer"
                style={{
                  borderRadius: "22px",
                  boxShadow: `0 0 0 1px rgba(212,160,23,0.2), 0 12px 60px rgba(0,0,0,0.6), 0 0 40px rgba(${parseInt(accentColor.slice(1,3),16)},${parseInt(accentColor.slice(3,5),16)},${parseInt(accentColor.slice(5,7),16)},0.07)`,
                  maxWidth: "min(540px, 100%)",
                  transition: "box-shadow 0.2s ease",
                }}
                onClick={complete ? undefined : advanceBead}
                onKeyDown={complete ? undefined : handleKeyDown}
                tabIndex={complete ? -1 : 0}
                role={complete ? "img" : "button"}
                aria-label={complete ? "Completed rosary" : `${prayerInfo.label} — ${prayerInfo.title}. Click to advance.`}
                onMouseEnter={(e) => { if (!complete) e.currentTarget.style.boxShadow = `0 0 0 1px rgba(212,160,23,0.4), 0 20px 70px rgba(0,0,0,0.65)`; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 0 1px rgba(212,160,23,0.2), 0 12px 60px rgba(0,0,0,0.6)`; }}
              />
              {!complete && (
                <p style={{ fontSize: "11px", color: "var(--fg-muted)", marginTop: "10px" }}>
                  Tap the rosary or press{" "}
                  <kbd style={{ padding: "2px 6px", borderRadius: "5px", fontSize: "10px", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>Enter</kbd>
                  {" / "}
                  <kbd style={{ padding: "2px 6px", borderRadius: "5px", fontSize: "10px", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>→</kbd>
                  {" "}to advance
                </p>
              )}
            </div>

            {/* Completion card */}
            {complete && (
              <div
                className="animate-fade-slide-up"
                style={{
                  marginTop: "24px",
                  borderRadius: "20px",
                  padding: "36px 28px",
                  background: "linear-gradient(155deg, #060d22, #0a1530 50%, #152d63)",
                  border: "2px solid rgba(212,160,23,0.35)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2.2rem", marginBottom: "12px", filter: "drop-shadow(0 0 18px rgba(212,160,23,0.65))" }}>✝</div>
                <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", fontWeight: 700, color: "#f0c040", marginBottom: "6px" }}>Rosary Complete</h2>
                <p style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "0.95rem", color: "rgba(240,232,213,0.72)", marginBottom: "6px" }}>
                  Well done. You have prayed all five mysteries.
                </p>
                {streak > 0 && <p style={{ fontSize: "12px", color: "#f0c040", marginBottom: "20px", fontWeight: 700 }}>🔥 {streak}-day streak!</p>}

                {/* Hail Holy Queen */}
                <div style={{ padding: "16px 18px", borderRadius: "14px", marginBottom: "20px", background: "rgba(0,0,0,0.28)", border: "1px solid rgba(212,160,23,0.15)", textAlign: "left" }}>
                  <p style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(212,160,23,0.7)", marginBottom: "8px" }}>Closing Prayer — Hail Holy Queen</p>
                  <p className="prayer-text" style={{ fontSize: "0.82rem", color: "rgba(240,232,213,0.82)" }}>{PRAYERS.hailHolyQueen}</p>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                  <ShareButton canvasRef={shareRef} title="I prayed the Rosary on PraySaint!" shareText="Just completed the Holy Rosary on PraySaint 📿" />
                  <button onClick={() => setShowReflection(true)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 600, padding: "0.55rem 1rem", borderRadius: "10px", cursor: "pointer", background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.25)", color: "#f0c040" }}>
                    🙏 Reflect
                  </button>
                  <button onClick={() => { setCurrentStep(0); setComplete(false); }} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 600, padding: "0.55rem 1rem", borderRadius: "10px", cursor: "pointer", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(240,232,213,0.8)" }}>
                    ↺ Pray Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Prayer guide + current mystery */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Current bead / prayer prompt */}
            {!complete && (
              <div
                style={{
                  borderRadius: "20px",
                  padding: "28px",
                  background: "linear-gradient(155deg, #060d22, #0a1530 55%, #0f2040)",
                  border: `1px solid ${accentColor}44`,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                }}
              >
                <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: accentColor, marginBottom: "10px" }}>
                  {prayerInfo.label}
                </p>
                <p style={{ fontFamily: "Playfair Display, serif", fontSize: "1.35rem", fontWeight: 700, color: "#f0c040", marginBottom: "6px" }}>
                  {prayerInfo.title}
                </p>

                {/* Pre-loop stem context */}
                {isPreLoop && currentStep === 0 && (
                  <p style={{ fontSize: "0.82rem", color: "rgba(200,212,240,0.75)", lineHeight: 1.75, marginBottom: "16px" }}>
                    Hold the crucifix. Make the Sign of the Cross, then pray the Apostles' Creed to profess your faith.
                  </p>
                )}
                {isPreLoop && currentStep === 1 && (
                  <p style={{ fontSize: "0.82rem", color: "rgba(200,212,240,0.75)", lineHeight: 1.75, marginBottom: "16px" }}>
                    On the large bead above the cross, pray the Our Father.
                  </p>
                )}
                {isPreLoop && currentStep >= 2 && currentStep <= 4 && (
                  <p style={{ fontSize: "0.82rem", color: "rgba(200,212,240,0.75)", lineHeight: 1.75, marginBottom: "16px" }}>
                    Pray for an increase in {["Faith", "Hope", "Charity"][currentStep - 2]}.
                  </p>
                )}
                {isPreLoop && currentStep === 5 && (
                  <p style={{ fontSize: "0.82rem", color: "rgba(200,212,240,0.75)", lineHeight: 1.75, marginBottom: "16px" }}>
                    Pray the Glory Be, then announce the 1st Mystery as you enter the rosary loop.
                  </p>
                )}

                {/* Loop context */}
                {!isPreLoop && (
                  <>
                    <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(200,212,240,0.85)", marginBottom: "4px" }}>
                      Mystery {decadeIndex + 1}: {currentMystery.name}
                    </p>
                    {currentMystery.scriptureRef && (
                      <p style={{ fontSize: "0.75rem", color: `${accentColor}99`, marginBottom: "16px" }}>{currentMystery.scriptureRef}</p>
                    )}
                    {posInDecade === 0 && (
                      <p className="prayer-text" style={{ fontSize: "0.9rem", color: "rgba(240,232,213,0.78)", lineHeight: 1.85, marginBottom: "16px" }}>
                        {currentMystery.meditation}
                      </p>
                    )}
                    {currentMystery.fruit && posInDecade === 0 && (
                      <p style={{ fontSize: "0.75rem", color: `${accentColor}bb`, marginBottom: "16px" }}>Virtue: <strong style={{ color: accentColor }}>{currentMystery.fruit}</strong></p>
                    )}
                  </>
                )}

                <button
                  onClick={advanceBead}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    fontWeight: 700, fontSize: "0.9rem",
                    padding: "0.75rem 1.75rem",
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
                    color: "#fff",
                    border: "none", cursor: "pointer",
                    boxShadow: `0 6px 20px ${accentColor}44`,
                    transition: "all 0.18s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}66`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 6px 20px ${accentColor}44`; }}
                >
                  {isPreLoop ? "Next →" : "Next Bead →"}
                </button>
              </div>
            )}

            {/* Prayer text card */}
            {!complete && (
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--fg-muted)", marginBottom: "16px" }}>
                  Prayer Text
                </p>

                {/* Pre-loop prayers */}
                {isPreLoop && currentStep === 0 && (
                  <>
                    <div style={{ marginBottom: "16px" }}>
                      <p style={{ fontSize: "10px", fontWeight: 700, color: accentColor, marginBottom: "6px" }}>SIGN OF THE CROSS</p>
                      <p className="prayer-text" style={{ fontSize: "0.82rem", lineHeight: 1.85, color: "var(--fg-secondary)" }}>In the name of the Father, and of the Son, and of the Holy Spirit. Amen.</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "10px", fontWeight: 700, color: accentColor, marginBottom: "6px" }}>APOSTLES' CREED</p>
                      <p className="prayer-text" style={{ fontSize: "0.82rem", lineHeight: 1.85, color: "var(--fg-secondary)" }}>{PRAYERS.creed}</p>
                    </div>
                  </>
                )}
                {isPreLoop && currentStep === 1 && (
                  <div>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: accentColor, marginBottom: "6px" }}>OUR FATHER</p>
                    <p className="prayer-text" style={{ fontSize: "0.82rem", lineHeight: 1.85, color: "var(--fg-secondary)" }}>{PRAYERS.ourFather}</p>
                  </div>
                )}
                {isPreLoop && currentStep >= 2 && currentStep <= 4 && (
                  <div>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: accentColor, marginBottom: "6px" }}>HAIL MARY</p>
                    <p className="prayer-text" style={{ fontSize: "0.82rem", lineHeight: 1.85, color: "var(--fg-secondary)" }}>{PRAYERS.hailMary}</p>
                  </div>
                )}
                {isPreLoop && currentStep === 5 && (
                  <div>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: accentColor, marginBottom: "6px" }}>GLORY BE</p>
                    <p className="prayer-text" style={{ fontSize: "0.82rem", lineHeight: 1.85, color: "var(--fg-secondary)" }}>{PRAYERS.gloryBe}</p>
                  </div>
                )}

                {/* Loop prayers */}
                {!isPreLoop && posInDecade === 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: accentColor, marginBottom: "6px" }}>OUR FATHER</p>
                    <p className="prayer-text" style={{ fontSize: "0.82rem", lineHeight: 1.85, color: "var(--fg-secondary)" }}>{PRAYERS.ourFather}</p>
                  </div>
                )}
                {!isPreLoop && posInDecade >= 1 && posInDecade <= 10 && (
                  <div style={{ marginBottom: "16px" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: accentColor, marginBottom: "6px" }}>HAIL MARY</p>
                    <p className="prayer-text" style={{ fontSize: "0.82rem", lineHeight: 1.85, color: "var(--fg-secondary)" }}>{PRAYERS.hailMary}</p>
                  </div>
                )}
                {!isPreLoop && posInDecade === 11 && (
                  <>
                    <div style={{ marginBottom: "16px" }}>
                      <p style={{ fontSize: "10px", fontWeight: 700, color: accentColor, marginBottom: "6px" }}>GLORY BE</p>
                      <p className="prayer-text" style={{ fontSize: "0.82rem", lineHeight: 1.85, color: "var(--fg-secondary)" }}>{PRAYERS.gloryBe}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "10px", fontWeight: 700, color: accentColor, marginBottom: "6px" }}>FATIMA PRAYER</p>
                      <p className="prayer-text" style={{ fontSize: "0.82rem", lineHeight: 1.85, color: "var(--fg-secondary)" }}>{PRAYERS.fatima}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mysteries list */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", boxShadow: "var(--shadow-md)" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--fg-muted)", marginBottom: "16px" }}>
                {selectedMystery} Mysteries
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {mysteryData.mysteries.map((m, i) => {
                  const isActive = i === decadeIndex && !complete;
                  const isDone   = i < decadeIndex || complete;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "14px",
                        background: isActive ? `linear-gradient(155deg, rgba(${parseInt(accentColor.slice(1,3),16)},${parseInt(accentColor.slice(3,5),16)},${parseInt(accentColor.slice(5,7),16)},0.08), transparent)` : "transparent",
                        border: isActive ? `1px solid ${accentColor}44` : "1px solid transparent",
                        transition: "all 0.25s ease",
                      }}
                    >
                      <p style={{ fontFamily: "Playfair Display, serif", fontSize: "0.88rem", fontWeight: 700, color: isActive ? "#f0c040" : isDone ? accentColor : "var(--fg-primary)", marginBottom: "2px", display: "flex", alignItems: "center", gap: "8px" }}>
                        {isDone ? <span style={{ color: accentColor }}>✓</span> : <span style={{ color: "var(--fg-muted)", fontSize: "11px" }}>{i + 1}.</span>}
                        {m.name}
                      </p>
                      <p style={{ fontSize: "0.72rem", color: isActive ? `${accentColor}bb` : "var(--fg-muted)" }}>
                        {m.scriptureRef} · Virtue: {m.fruit}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rosary how-to guide for beginners */}
            <details
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "0",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <summary
                style={{
                  padding: "18px 24px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--fg-secondary)",
                  userSelect: "none",
                  listStyle: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <span>📿 New to the Rosary? How to begin</span>
                <span style={{ color: "var(--fg-muted)", fontSize: "12px" }}>▼</span>
              </summary>
              <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--border)" }}>
                <ol style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                  {[
                    { label: "Crucifix", text: "Hold the crucifix and pray the Apostles' Creed to profess your faith." },
                    { label: "1st Large Bead", text: "Pray the Our Father." },
                    { label: "3 Small Beads", text: "Pray a Hail Mary on each bead, for an increase in Faith, Hope, and Charity." },
                    { label: "Chain Connector", text: "Pray the Glory Be and announce the 1st Mystery." },
                    { label: "Each Decade (×5)", text: "Pray the Our Father on the large bead, then a Hail Mary on each of the 10 small beads, then a Glory Be and the Fatima Prayer." },
                    { label: "Closing", text: "Pray the Hail Holy Queen and any personal prayers." },
                  ].map(({ label, text }) => (
                    <li key={label} style={{ fontSize: "0.82rem", lineHeight: 1.7, color: "var(--fg-secondary)" }}>
                      <strong style={{ color: accentColor }}>{label}:</strong> {text}
                    </li>
                  ))}
                </ol>
              </div>
            </details>

          </div>
        </div>
      </div>

      {showReflection && (
        <ReflectionPrompt
          question="How did praying these mysteries draw you closer to Mary and Jesus today?"
          cccRef="CCC 2708 — Meditative prayer seeks to understand the why and how of Christian life."
          onClose={() => setShowReflection(false)}
        />
      )}
    </div>
  );
}
