import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "../magicui/border-beam";
import { useModalControls } from "@/components/hooks/useModalControls";
import { 
  X, Award, Star, Trophy, GraduationCap, MapPin, ExternalLink,
  LayoutDashboard, Code2, Target, Calendar, CheckCircle2, User, Globe
} from "lucide-react";

const getBadgeColors = (badgeName, stars) => {
  const nameLower = badgeName.toLowerCase();
  
  // Custom starting gradients for prominent default tracks:
  if (nameLower.includes("problem solving")) {
    return {
      gradientId: "badge-silver-gradient",
      stop1: "#e7eeef",
      stop2: "#b7c9cc",
      stroke: "#c06c54",
    };
  }
  if (nameLower.includes("java")) {
    return {
      gradientId: "badge-bronze-gradient",
      stop1: "#ffc5ab",
      stop2: "#ffa38a",
      stroke: "#c06c54",
    };
  }

  // Generic dynamic fallbacks based on earned star levels:
  if (stars >= 5) {
    return {
      gradientId: "badge-gold-gradient",
      stop1: "#ffe8b3",
      stop2: "#f5be58",
      stroke: "#c06c54",
    };
  }
  if (stars >= 3) {
    return {
      gradientId: "badge-silver-gradient",
      stop1: "#e7eeef",
      stop2: "#b7c9cc",
      stroke: "#c06c54",
    };
  }
  return {
    gradientId: "badge-bronze-gradient",
    stop1: "#ffc5ab",
    stop2: "#ffa38a",
    stroke: "#c06c54",
  };
};

const getBadgeIcon = (badgeName) => {
  const nameLower = badgeName.toLowerCase();
  
  // Problem Solving / Algorithms / Data Structures
  if (nameLower.includes("problem solving") || nameLower.includes("algorithms") || nameLower.includes("data structures")) {
    return (
      <svg x="32.5" y="21" width="27" height="27" viewBox="0 0 95.41 98.75">
        <polygon points="48.433 61.241 62.272 53.23 48.433 45.582 48.433 61.241" fill="none" />
        <path d="M49.63581,36.26994V19.9878c0-.074.01534-.13269.01845-.20382L47.70143,18.6322,35.79772,11.86884V28.36347l5.536,3.26487Z" transform="translate(-2.2948 -0.625)" fill="none" />
        <polygon points="48.171 18.27 48.203 18.289 62.849 9.736 48.381 1.343 33.694 9.854 48.171 18.27" fill="none" />
        <polygon points="1.457 70.71 46.977 96.929 46.977 80.542 1.457 54.322 1.457 70.71" fill="none" />
        <path d="M50.36418,79.7104c.06824,0,.07446.06223.11958.08535l45.03633-25.941L60.22771,33.15065,50.804,38.24612l-.01623.00867-.05957.03223H50.682a1.19688,1.19688,0,0,1-1.11156-.17381l-1.96128-1.18579-7.191-4.1635L4.33476,53.30579ZM34.11227,53.048l15.34529-8.92178h.00022l.178-.10358h.11113a.75833.75833,0,0,1,.52388,0h.09335l.22138.12869h0l15.1917,8.83243c.36407.2056.61034.32518.61012.87129,0,.3643.02267.41631-.36407.72837L50.81716,63.22311l-.25027.1547c-.06424.0509-.14581.03334-.218.06223-.01778.01022-.03756.00689-.056.01578a.74976.74976,0,0,1-.409.04845c-.05734-.00356-.10735.03578-.16492.01956a.82079.82079,0,0,1-.28583-.146l-.24338-.1507L34.19473,54.707c-.48565-.27894-.58212-.48788-.58212-.85195A.81609.81609,0,0,1,34.11227,53.048Z" transform="translate(-2.2948 -0.625)" fill="none" />
        <path d="M34.19473,54.707l14.995,8.52015.24338.1507a.82079.82079,0,0,0,.28583.146c.05757.01623.10758-.02312.16492-.01956a.74976.74976,0,0,0,.409-.04845c.01845-.00889.03823-.00556.056-.01578.07224-.02889.15381-.01134.218-.06223l.25027-.1547,15.20615-8.63973c.38674-.31206.36407-.36407.36407-.72837.00022-.54611-.246-.66569-.61012-.87129L50.58556,44.1513h0l-.22138-.12869h-.09335a.75833.75833,0,0,0-.52388,0h-.11113l-.178.10358h-.00022L34.11227,53.048a.81609.81609,0,0,0-.49966.80705C33.61261,54.21909,33.70908,54.428,34.19473,54.707Zm16.53353,7.15943V46.20748l13.8381,7.64731Z" transform="translate(-2.2948 -0.625)" fill="#1e293b" />
        <path d="M97.7052,53.85479c0-.36407.00489-.605-.3643-.72815L62.18855,32.09044l4.19862-2.27023c.42142-.18737.3643-.36407.3643-.72837V10.88376c0-.07668-.01578-.13758-.01911-.21071a1.21385,1.21385,0,0,0,.01911-.15336c0-.3643,0-.72837-.3643-.72837L51.21191.7584a.94806.94806,0,0,0-.96153-.00489L34.70527,9.79132a.68617.68617,0,0,0-.29495.337.60869.60869,0,0,0-.03067.08246,2.3798,2.3798,0,0,0-.03867.673V28.79689a.65773.65773,0,0,0,.3643.65924l3.981,2.30513L2.65887,52.39828c-.36407.36407-.36407.36407-.36407.72837,0,.07668.01578.13758.01911.21071a1.21385,1.21385,0,0,0-.01911.15336v17.844c0,.36407,0,.52988.36407.72815L49.99989,99.375a1.71436,1.71436,0,0,0,.65813-.33407l.07024-.03L97.3409,72.42717c.3643,0,.3643-.36407.3643-.72837V54.21909l-.01378-.01378A2.62317,2.62317,0,0,0,97.7052,53.85479ZM50.67536,1.968,65.144,10.36121l-14.64626,8.5526-.03245-.01889L35.98864,10.47857ZM35.79772,11.86884,47.70143,18.6322,49.65426,19.784c-.00311.07113-.01845.1298-.01845.20382V36.26994l-8.3021-4.64159-5.536-3.26487ZM47.60919,36.92741l1.96128,1.18579A1.19688,1.19688,0,0,0,50.682,38.287h.04623l.05957-.03223.01623-.00867,9.42366-5.09546L95.5201,53.85479l-45.03633,25.941c-.04512-.02312-.05134-.08535-.11958-.08535L4.33476,53.30579,40.41819,32.76391Zm1.66255,60.62678L3.75153,71.33473V54.94745L49.27174,81.16692Z" transform="translate(-2.2948 -0.625)" fill="#1e293b" />
      </svg>
    );
  }
  
  // Java
  if (nameLower.includes("java")) {
    return (
      <svg x="32.5" y="21" width="27" height="27" viewBox="0 0 73.24 98.75">
        <path d="M49.5111,18.92259c-4.563,3.20919-9.73441,6.84655-12.50539,12.86432-4.81291,10.499,9.8484,21.95107,10.475,22.43344a.80945.80945,0,0,0,1.212-1.01451c-.053-.10222-5.31573-10.3244-5.12015-17.65776.06924-2.55419,3.64372-5.4517,7.42786-8.51932,3.4659-2.80975,7.39469-5.99425,9.69333-9.71956,5.04629-8.20012-.56241-16.2633-.6197-16.34392a.8094.8094,0,0,0-1.45116.6384A17.22453,17.22453,0,0,1,56.69,12.4828C55.43977,14.7529,52.69251,16.68508,49.5111,18.92259Z" transform="translate(-13.38209 -0.625)" fill="#1e293b" />
        <path d="M68.73516,22.53854a.80936.80936,0,0,0-.77438-1.40314c-.77515.29471-18.98162,7.31272-18.98162,15.7923,0,5.84535,2.49691,8.93322,4.32013,11.18827a8.51541,8.51541,0,0,1,1.536,2.30037c.57283,1.87915-.78422,5.27561-1.35492,6.42589A.80942.80942,0,0,0,54.66751,57.867c.313-.21756,7.65063-5.40541,6.33466-11.65579a15.41576,15.41576,0,0,0-2.68786-5.64341c-1.59581-2.37328-2.74842-4.08752-.99984-7.2537C59.36316,29.621,68.64123,22.60874,68.73516,22.53854Z" transform="translate(-13.38209 -0.625)" fill="#1e293b" />
        <path d="M21.343,58.14625a2.87287,2.87287,0,0,0,.42567,2.68149c1.97365,2.74012,8.96466,4.24876,19.686,4.24876H41.456c1.45271,0,2.98642-.02855,4.55736-.08486,17.14144-.61352,23.49925-5.95374,23.76155-6.18075a.80908.80908,0,0,0-.74275-1.39234C62.99511,59.06682,51.72236,59.652,43.90336,59.652c-8.74922,0-13.20493-.6303-14.29582-1.0957.55971-.76859,4.01211-2.14107,8.29019-2.98256a.80937.80937,0,0,0-.15623-1.60353C35.2338,53.9702,22.65762,54.17155,21.343,58.14625Z" transform="translate(-13.38209 -0.625)" fill="#1e293b" />
        <path d="M78.70179,52.64594a16.91173,16.91173,0,0,0-7.02939,1.84713.80961.80961,0,0,0,.3813,1.5233c.075,0,7.54165.06114,8.21786,4.32726.59906,3.68037-7.06468,9.64357-10.06827,11.63091a.80938.80938,0,0,0,.61527,1.46659c.71286-.15256,17.43673-3.83794,15.66848-13.57506C85.40831,53.89865,81.65773,52.64594,78.70179,52.64594Z" transform="translate(-13.38209 -0.625)" fill="#1e293b" />
        <path d="M67.23269,70.783a.8102.8102,0,0,0-.33116-.81141l-4.01-2.80878a.812.812,0,0,0-.67215-.1192A78.86966,78.86966,0,0,1,51.896,68.83267a71.65008,71.65008,0,0,1-7.8271.4141c-6.08663,0-10.06634-.71517-10.64592-1.23978-.07676-.14736-.05246-.21428-.03877-.2515a2.04153,2.04153,0,0,1,1.0334-.77843.80949.80949,0,0,0-.4708-1.54606c-4.02252.97072-5.98943,2.32815-5.84631,4.03448.2542,3.02538,7.26161,4.57819,13.18565,4.98861.85191.05825,1.77326.08775,2.73781.08775h.00154c9.85071,0,22.47915-3.09076,22.60529-3.1222A.80715.80715,0,0,0,67.23269,70.783Z" transform="translate(-13.38209 -0.625)" fill="#1e293b" />
        <path d="M37.00108,77.27581a.80937.80937,0,0,0-.46366-1.487c-.53907.01427-5.27484.228-5.60639,3.24313a3.13539,3.13539,0,0,0,.76744,2.44677c1.70035,2.01512,6.29031,3.21285,14.02965,3.66147.91556.055,1.84559.08255,2.76462.08255a42.18314,42.18314,0,0,0,16.74354-3.21189.80968.80968,0,0,0,.076-1.42281l-5.06769-3.09366a.81477.81477,0,0,0-.58691-.10164c-.032.00675-3.24969.67408-8.10561,1.33332a26.12612,26.12612,0,0,1-3.41961.18843c-4.85071,0-10.2461-.79251-11.28085-1.31152A.32454.32454,0,0,1,37.00108,77.27581Z" transform="translate(-13.38209 -0.625)" fill="#1e293b" />
        <path d="M43.907,94.52448c22.53778-.01909,34.6341-4.02715,36.96437-6.54933a2.79048,2.79048,0,0,0,.844-2.2888A3.53465,3.53465,0,0,0,80.1651,83.407a.81721.81721,0,0,0-1.05617.14369.8.8,0,0,0-.00521,1.05327c.14215.18284.22431.48893-.19133.90495-.93157.87-10.32729,3.511-25.97128,4.3045-2.143.11129-4.39072.168-6.68029.16837-14.00689,0-24.25781-1.91868-25.60347-3.03656C21.176,86.2,24.802,85.00936,28.658,84.33586a.8096.8096,0,0,0-.24745-1.59987c-.10878.01485-.47793.03684-.90534.06307-6.36244.38844-13.71489,1.25424-14.09851,4.53248a3.33615,3.33615,0,0,0,.88258,2.695c1.71829,1.93064,6.65715,4.49757,29.61693,4.49757Z" transform="translate(-13.38209 -0.625)" fill="#1e293b" />
        <path d="M85.29818,88.68588a.80853.80853,0,0,0-.93273.18361c-.033.03568-3.42154,3.57892-13.60977,5.65962-3.90044.78152-11.22184,1.17786-21.7609,1.17786-10.55874,0-20.606-.41544-20.70609-.41969a.80949.80949,0,0,0-.22161,1.5962A120.51319,120.51319,0,0,0,53.09774,99.375a116.67238,116.67238,0,0,0,19.97144-1.66737c11.83478-2.07471,12.66335-7.943,12.69286-8.19182A.80953.80953,0,0,0,85.29818,88.68588Z" transform="translate(-13.38209 -0.625)" fill="#1e293b" />
      </svg>
    );
  }
  
  // Python
  if (nameLower.includes("python")) {
    return (
      <svg x="32.5" y="21" width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c5.522 0 10 4.477 10 10s-4.478 10-10 10S2 17.523 2 12 6.478 2 12 2zm0 3C8.134 5 5 8.134 5 12s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7z" fill="#1e293b" opacity="0.15" />
        <path d="M11.75 6.25a2.75 2.75 0 0 0-2.75 2.75V11H12v1H9a2.75 2.75 0 0 0-2.75 2.75v1.5A2.75 2.75 0 0 0 9 19h2.75a2.75 2.75 0 0 0 2.75-2.75V14H12v-1h3a2.75 2.75 0 0 0 2.75-2.75V8.75A2.75 2.75 0 0 0 15 6h-3.25z" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10.5" cy="8.25" r="0.75" fill="#1e293b" />
        <circle cx="13.5" cy="16.75" r="0.75" fill="#1e293b" />
      </svg>
    );
  }
  
  // SQL / Databases
  if (nameLower.includes("sql") || nameLower.includes("database")) {
    return (
      <svg x="32.5" y="21" width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
      </svg>
    );
  }

  // 30 Days of Code / Calendar Tutorials
  if (nameLower.includes("30 days of code") || nameLower.includes("days") || nameLower.includes("tutorial")) {
    return (
      <svg x="32.5" y="21" width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeWidth="2.5" />
      </svg>
    );
  }
  
  // Default fallback (brackets for language tracks)
  return (
    <svg x="32.5" y="21" width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
};

const HackerRankBadge = ({ badge }) => {
  const { name, stars, solved, totalChallenges } = badge;
  const colors = getBadgeColors(name, stars);

  const progressText = solved !== undefined && totalChallenges !== undefined
    ? `${solved} / ${totalChallenges} solved`
    : "";

  return (
    <motion.div
      className="relative flex flex-col items-center group cursor-pointer"
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div 
        className="w-36 h-40 transition-all duration-300"
        style={{
          filter: `drop-shadow(0px 8px 16px ${
            name.toLowerCase().includes("problem solving")
              ? "rgba(142, 142, 142, 0.2)"
              : "rgba(189, 89, 60, 0.2)"
          })`
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 92 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={colors.gradientId} x1="46" y1="0.5" x2="46" y2="99.5" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={colors.stop1} />
              <stop offset="1" stopColor={colors.stop2} />
            </linearGradient>
          </defs>

          {/* Hexagon Path */}
          <path
            fill={`url(#${colors.gradientId})`}
            stroke={colors.stroke}
            strokeWidth="1.8"
            d="M90.3892 44.9106L90.3893 44.914C90.5873 51.9976 90.3892 59.5788 89.8948 65.4581C89.7459 67.8071 89.5241 69.8644 89.2548 71.4803C88.9812 73.1224 88.6689 74.2376 88.3726 74.7495C88.2249 75.0255 87.9549 75.366 87.5388 75.7853C87.1279 76.1994 86.5969 76.6683 85.9594 77.1872C84.6848 78.2247 83.011 79.4407 81.0792 80.7886C76.1371 84.1752 69.4065 88.1657 62.9661 91.6605C58.9514 93.8584 55.1183 95.8269 51.996 97.2447C50.4343 97.9539 49.0577 98.522 47.9293 98.9118C46.7841 99.3074 45.9476 99.5 45.4429 99.5C44.8368 99.5 43.7518 99.219 42.2485 98.6583C40.7685 98.1063 38.9475 97.3088 36.9015 96.3316C32.811 94.3779 27.849 91.7188 22.9696 88.9044C18.0901 86.09 13.3015 83.125 9.55688 80.5609C7.68397 79.2784 6.07847 78.1005 4.85537 77.0948C3.6188 76.0781 2.82774 75.2805 2.51554 74.7536C2.28519 74.3275 2.0493 73.5182 1.82917 72.3438C1.61115 71.1807 1.41751 69.7122 1.25082 68.0137C0.917563 64.6178 0.694767 60.3313 0.595718 55.7891C0.39748 48.597 0.496929 40.7167 0.991039 34.7412C1.13992 32.3423 1.36172 30.2598 1.63112 28.6185C1.90193 26.9685 2.21232 25.8224 2.51467 25.2483C2.86854 24.6758 3.67611 23.8504 4.9172 22.8226C6.15287 21.7992 7.77552 20.6094 9.70207 19.315C14.5518 16.0235 21.0868 12.0319 27.3246 8.63924C31.4393 6.34112 35.4202 4.29812 38.6657 2.83059C40.2891 2.09658 41.7217 1.5096 42.8908 1.10715C44.0779 0.698497 44.9386 0.5 45.4429 0.5C45.8599 0.5 46.5131 0.630344 47.3938 0.904038C48.2627 1.17405 49.3131 1.57058 50.508 2.07336C52.8947 3.07763 55.8302 4.49415 58.9957 6.13884L76.0424 15.9271C79.2093 17.9719 82.072 19.9123 84.2641 21.5505C85.3617 22.3708 86.285 23.1108 86.9918 23.7467C87.708 24.391 88.1652 24.8965 88.372 25.2495C88.6251 25.6975 88.8797 26.5434 89.1143 27.7675C89.346 28.9765 89.5489 30.5006 89.7217 32.2614C90.0674 35.7817 90.2902 40.2179 90.3892 44.9106Z"
          />

          {/* Dynamic Icon */}
          {getBadgeIcon(name)}

          {/* Badge Label */}
          <text
            x="50%"
            y="65.5"
            textAnchor="middle"
            className="font-extrabold fill-[#1e293b] select-none tracking-tight font-sans"
            style={{
              fontSize: name.length > 12 ? '6.8px' : '9px',
              fontFamily: "var(--font-mont), system-ui, sans-serif"
            }}
          >
            {name}
          </text>

          {/* Stars */}
          {Array.from({ length: Math.min(stars, 6) }).map((_, idx) => {
            const starWidth = 7;
            const starSpacing = 2.2;
            const totalStarWidth = stars * starWidth + (stars - 1) * starSpacing;
            const startX = (92 - totalStarWidth) / 2;
            return (
              <svg
                key={idx}
                x={startX + idx * (starWidth + starSpacing)}
                y="71"
                width="7"
                height="10"
                viewBox="0 0 6.55 6.26"
              >
                <path
                  fill="#1e293b"
                  d="M55.51425,77.01983l-1.89417-.275-.84833-1.7175a.299.299,0,0,0-.27167-.16917.3245.3245,0,0,0-.2725.16917l-.305.61833-.5425,1.09916-.51417.075-1.38.2a.30333.30333,0,0,0-.18583.10083.33411.33411,0,0,0-.045.06833.35631.35631,0,0,0-.02417.07667.34087.34087,0,0,0-.005.04083.3038.3038,0,0,0,.02417.13417.33341.33341,0,0,0,.06667.0975l1.37167,1.33667-.2875,1.67167-.03667.21417c-.00167.01-.00167.02-.0025.02917l-.00167.0175a.26453.26453,0,0,0,.00167.04417.30489.30489,0,0,0,.44417.22917l1.69417-.89,1.69416.89a.30352.30352,0,0,0,.44084-.32L54.31175,78.874l1.37083-1.33667a.30339.30339,0,0,0-.16833-.5175"
                  transform="translate(-49.22548 -74.85817)"
                />
              </svg>
            );
          })}
        </svg>
      </div>

      <div className="absolute bottom-full mb-2 scale-0 group-hover:scale-100 bg-dark dark:bg-light text-light dark:text-dark text-[11px] py-2 px-3 rounded-xl shadow-xl border border-solid border-dark/10 dark:border-light/10 transition-all duration-200 pointer-events-none z-30 flex flex-col items-center text-center w-40">
        <span className="font-extrabold text-green-600 dark:text-green-500 mb-0.5">{name}</span>
        <span className="text-[10px] font-bold opacity-80">
          {stars} Star{stars > 1 ? 's' : ''} {progressText && `• ${progressText}`}
        </span>
      </div>
    </motion.div>
  );
};

export const HackerRankModal = ({ show, onClose, data }) => {
  const { canPortal } = useModalControls(show, onClose);
  const [activeTab, setActiveTab] = useState("overview");
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (show && scrollContainerRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = scrollContainerRef.current;
        setShowScrollArrow(scrollHeight - scrollTop - clientHeight > 30);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [show, activeTab, data]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollArrow(scrollHeight - scrollTop - clientHeight > 30);
  };

  if (!canPortal) return null;

  const hrData = data || {};
  const hrLoading = !data;

  const profile = hrData.profile || {};
  const name = profile.name || "Urva Gandhi";
  const username = profile.username || "urvagandhi24";
  const avatar = profile.avatar || "https://d1ce3iv5vajdy.cloudfront.net/hackerrank/assets/gravatar.jpg";
  const location = profile.location || "Ahmedabad";
  const country = profile.country || "India";
  const headline = profile.headline || "Java Full-Stack & AI/ML Engineer";
  const level = profile.level || 5;

  const badges = hrData.badges || [];
  // Skills are already pre-filtered by the API (zero-score entries removed)
  const skills = hrData.skills || [];

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="hackerrank-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-default"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onMouseDown={onClose}
            className="absolute inset-0 bg-dark/60 dark:bg-black/80 backdrop-blur-md"
          />

          {/* Modal Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateX: -5, y: 15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, rotateX: 5, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-solid border-dark/10 bg-light shadow-2xl dark:border-green-500/30 dark:bg-dark flex flex-col cursor-default"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-dark/10 dark:hover:bg-light/10 transition-all z-20"
              aria-label="Close dialog"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header Details */}
            <div className="p-8 pb-4 border-b border-solid border-dark/10 dark:border-light/10 flex flex-col md:gap-4 relative">
              <BorderBeam size={150} duration={8} delay={4} colorFrom="#2ec866" colorTo="#00e676" />
              <div className="flex items-center gap-4 sm:flex-col sm:items-start">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-solid border-green-500/50 shadow-md flex items-center justify-center bg-green-500/10">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-green-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-3xl font-extrabold tracking-tight">
                      {name}
                    </h4>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-solid border-green-500/20">
                      <Award className="w-3.5 h-3.5" /> HackerRank
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-dark/60 dark:text-light/60 mt-1 max-w-[90%]">
                    {headline}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-sm text-dark/70 dark:text-light/70 flex-wrap">
                    <span className="font-semibold text-green-600 dark:text-green-400">@{username}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-green-500" /> {location && `${location}, `}{country}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar border-b border-solid border-dark/5 dark:border-light/5">
                {[
                  { id: "overview", label: "Overview", icon: LayoutDashboard },
                  { id: "badges", label: "Badges & Skills", icon: Award },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors duration-200 whitespace-nowrap ${
                        isActive
                           ? "text-green-600 dark:text-green-400"
                           : "text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {isActive && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.2 }}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 origin-center"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Body Content Wrapper */}
            <div className="relative flex-1 flex flex-col min-h-0">
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-8 max-h-[50vh] min-h-[40vh] no-scrollbar bg-light dark:bg-[#0d1117]/95"
              >
              {hrLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-solid border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                  <span className="text-sm font-bold text-dark/50 dark:text-light/50">Fetching HackerRank Analytics...</span>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Top Stats Counters Row */}
                      <div className="grid grid-cols-3 gap-4 sm:grid-cols-1">
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Trophy className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">Level {level}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Platform Level</span>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Award className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{badges.length}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Badges Earned</span>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Code2 className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{skills.length}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Practice Tracks</span>
                        </div>
                      </div>

                      {/* Info and platform highlights */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark space-y-4">
                        <h5 className="text-md font-bold border-b border-solid border-dark/10 dark:border-light/10 pb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500" /> HackerRank Performance Highlights
                        </h5>
                        <p className="text-sm leading-relaxed text-dark/80 dark:text-light/80">
                          Solving technical challenges across several developer domains. Demonstrates strong coding competency in core programming environments and algorithms.
                        </p>
                        {skills.length > 0 && (
                          <div className="pt-2">
                            <div className="text-xs text-dark/50 dark:text-light/50 font-bold uppercase mb-2">Active Skills Overview</div>
                            <div className="flex flex-wrap gap-2">
                              {skills.map((skill, i) => (
                                <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-dark/5 dark:bg-light/5 border border-solid border-dark/10 dark:border-light/10">
                                  {skill.name}: {skill.score} pts
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Badges Tab */}
                  {activeTab === "badges" && (
                    <motion.div
                      key="badges"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Badges list */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark flex flex-col items-center">
                        <h5 className="text-md font-bold mb-6 border-b border-solid border-dark/10 dark:border-light/10 pb-2 w-full text-left">
                          Earned Badges
                        </h5>
                        {badges.length === 0 ? (
                          <span className="text-sm text-dark/50 dark:text-light/50 self-start">No badges found.</span>
                        ) : (
                          <div className="flex flex-wrap items-center justify-center gap-10 py-4 w-full">
                            {badges.map((badge, i) => (
                              <HackerRankBadge key={i} badge={badge} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Skills/ELO Leaderboard Scores list */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark">
                        <h5 className="text-md font-bold mb-4 border-b border-solid border-dark/10 dark:border-light/10 pb-2">Domain Practice & Leaderboard Rankings</h5>
                        {skills.length === 0 ? (
                          <span className="text-sm text-dark/50 dark:text-light/50">No active domain rankings found.</span>
                        ) : (
                          <div className="space-y-4">
                            {skills.map((skill, i) => (
                              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark/5 dark:bg-light/5 border border-solid border-dark/10 dark:border-light/10 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <Code2 className="w-5 h-5 text-green-500" />
                                  <span className="font-bold text-sm">{skill.name}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-semibold text-dark/70 dark:text-light/70">
                                  <span>Score: <strong className="text-green-500">{skill.score}</strong></span>
                                  {skill.rank && (
                                    <span>Rank: <strong className="text-green-500">#{skill.rank.toLocaleString()}</strong></span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
              </div>

              <AnimatePresence>
                {showScrollArrow && !hrLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-4 left-0 right-0 z-20 pointer-events-none flex flex-col items-center justify-center text-green-500 animate-bounce"
                  >
                    <span className="text-[10px] font-extrabold tracking-wider bg-light/95 dark:bg-dark/95 px-2.5 py-1 rounded-full border border-solid border-green-500/30 shadow-md backdrop-blur-sm">
                      Scroll Down
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-md"
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-solid border-dark/10 dark:border-light/10 bg-dark/5 dark:bg-light/5 flex items-center justify-between sm:flex-col sm:gap-4 sm:items-stretch">
              <span className="text-xs font-bold text-dark/50 dark:text-light/50">
                Data fetched dynamically via HackerRank REST API.
              </span>
              <a
                href={`https://www.hackerrank.com/profile/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-green-600 hover:bg-green-700 text-center text-sm font-bold text-white dark:text-black dark:bg-green-400 dark:hover:bg-green-300 transition-all duration-300 px-6 py-2.5"
              >
                Visit Official Profile
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
