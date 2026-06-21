// Signature brand visual: an isometric 2x2x2 unit load on a pallet,
// echoing the Betsel Stack logo (white / amber / silver blocks).
export default function PalletMark({ className = "" }) {
  return (
    <svg
      className={`pallet-mark ${className}`}
      viewBox="0 0 400 330"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Betsel Stack pallet pattern mark"
    >
      {/* ground shadow */}
      <ellipse cx="200" cy="300" rx="118" ry="20" fill="rgba(0,0,0,0.45)" />

      {/* pallet deck */}
      <polygon points="200,186.6 308.6,248 200,309.4 91.4,248" fill="#d7dbe0" stroke="#0b0c0e" strokeWidth="2.4" strokeLinejoin="round" />
      <polygon points="200,186.6 308.6,248 308.6,264.6 200,203.3" fill="#9aa0a7" stroke="#0b0c0e" strokeWidth="2.4" strokeLinejoin="round" />
      <polygon points="200,186.6 91.4,248 91.4,264.6 200,203.3" fill="#aeb4bb" stroke="#0b0c0e" strokeWidth="2.4" strokeLinejoin="round" />
      {/* pallet feet hints */}
      <polygon points="116,262 138,275 138,289 116,276" fill="#5d636b" />
      <polygon points="262,275 284,262 284,276 262,289" fill="#4c525a" />
      <polygon points="189,206 211,206 211,219 189,219" fill="#6b7178" opacity="0.85" />

      {/* cube - left faces */}
      <polygon points="200,144 154,170 154,222 200,196" fill="#c9ced4" stroke="#0b0c0e" strokeWidth="2.2" strokeLinejoin="round" />
      <polygon points="200,92 154,118 154,170 200,144" fill="#e8ebee" stroke="#0b0c0e" strokeWidth="2.2" strokeLinejoin="round" />
      <polygon points="154,170 108,196 108,248 154,222" fill="#bcc2c8" stroke="#0b0c0e" strokeWidth="2.2" strokeLinejoin="round" />
      <polygon points="154,118 108,144 108,196 154,170" fill="#dde1e5" stroke="#0b0c0e" strokeWidth="2.2" strokeLinejoin="round" />

      {/* cube - right faces (amber column echoes logo) */}
      <polygon points="200,144 246,170 246,222 200,196" fill="#9aa1a8" stroke="#0b0c0e" strokeWidth="2.2" strokeLinejoin="round" />
      <polygon points="200,92 246,118 246,170 200,144" fill="#c2c8ce" stroke="#0b0c0e" strokeWidth="2.2" strokeLinejoin="round" />
      <polygon points="246,170 292,196 292,248 246,222" fill="#d89a0c" stroke="#0b0c0e" strokeWidth="2.2" strokeLinejoin="round" />
      <polygon points="246,118 292,144 292,196 246,170" fill="#fdb410" stroke="#0b0c0e" strokeWidth="2.2" strokeLinejoin="round" />

      {/* cube - top faces */}
      <polygon points="200,92 246,118 200,144 154,118" fill="#ffffff" stroke="#0b0c0e" strokeWidth="2.2" strokeLinejoin="round" />
      <polygon points="154,118 200,144 154,170 108,144" fill="#fdb410" stroke="#0b0c0e" strokeWidth="2.2" strokeLinejoin="round" />
      <polygon points="246,118 292,144 246,170 200,144" fill="#ffffff" stroke="#0b0c0e" strokeWidth="2.2" strokeLinejoin="round" />
      <polygon points="200,144 246,170 200,196 154,170" fill="#fdb410" stroke="#0b0c0e" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}
