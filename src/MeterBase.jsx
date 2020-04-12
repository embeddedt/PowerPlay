import * as React from "react"

function MeterBase(props) {
  return (
    <svg
      viewBox="0 0 401 264"
      fill="#fff"
      fillRule="evenodd"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      fontFamily="Roboto"
      fontSize={14}
      textAnchor="middle"
      {...props}
    >
      <defs>
        <linearGradient id="prefix__A" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#97ff28" />
          <stop offset="25%" stopColor="#e3ff47" />
          <stop offset="50%" stopColor="#fff423" />
          <stop offset="75%" stopColor="#ffbf33" />
          <stop offset="99%" stopColor="#eb5a00" />
        </linearGradient>
      </defs>
      <path
        d="M66.667 200H0C0 89.2 89.2 0 200 0s200 89.2 200 200h-66.667c0-73.867-59.467-133.333-133.333-133.333S66.667 126.133 66.667 200z"
        fill="url(#prefix__A)"
        stroke="url(#prefix__A)"
      />
    </svg>
  )
}

export default MeterBase
