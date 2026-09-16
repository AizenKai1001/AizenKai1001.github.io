// Original conceptual illustrations. These do not depict the private lab topology.
const vent = (x, y, count = 7) => Array.from({length: count}, (_, i) => `<path d="M${x + i * 7} ${y}v21"/>`).join('');

export function labIllustration(kind = 'homelab-platform') {
  const hardware = kind === 'pico-audio-lab';
  const art = hardware ? `
    <g class="bench-board" transform="translate(176 206) rotate(-15)">
      <rect class="lab-shadow" x="-69" y="-106" width="158" height="234" rx="12"/>
      <rect class="lab-pcb" x="-76" y="-122" width="144" height="234" rx="10"/>
      ${Array.from({length:16},(_,i)=>`<rect class="lab-contact" x="-84" y="${-105+i*13}" width="18" height="7" rx="2"/><rect class="lab-contact" x="58" y="${-105+i*13}" width="18" height="7" rx="2"/>`).join('')}
      <g class="board-traces" fill="none"><path d="M-62 -85h25v43h30m-55 1h13v21h29m-42 14h17v43h25m-42 8h14v46h38m56 -154h-21v28h-20m41 -3h-11v45h-30m41 24h-25v-15h-17m42 45h-16v30h-17"/></g>
      <rect class="lab-chip" x="-27" y="-31" width="54" height="61" rx="4"/>
      <rect class="lab-chip-mark" x="-14" y="-19" width="29" height="33" rx="2"/>
      <g class="chip-pins" fill="none">${Array.from({length:6},(_,i)=>`<path d="M-34 ${-24+i*9}h7m54 0h7"/>`).join('')}</g>
      <rect class="lab-metal" x="-22" y="-134" width="44" height="28" rx="4"/><rect class="lab-chip" x="-14" y="-127" width="28" height="11" rx="2"/>
      <rect class="lab-metal" x="-24" y="60" width="26" height="17" rx="3"/><rect class="lab-chip" x="15" y="64" width="16" height="22" rx="2"/>
      <circle class="lab-led" cx="32" cy="-92" r="5"/><circle class="lab-screw" cx="-46" cy="93" r="5"/><circle class="lab-screw" cx="40" cy="93" r="5"/>
      <path class="lab-wire" d="M66 69c27 0 28 95 104 95s76 -42 110 -49" fill="none"/>
      <path class="lab-wire-secondary" d="M67 82c15 0 32 96 104 96s88 -42 114 -47" fill="none"/>
    </g>
    <g class="bench-speaker" transform="translate(416 229)">
      <ellipse class="lab-shadow" cx="0" cy="87" rx="72" ry="24"/>
      <path class="lab-case-side" d="M-68 -43v85c0 33 136 33 136 0v-85Z"/>
      <ellipse class="lab-speaker-rim" rx="68" ry="49" cy="-43"/><ellipse class="lab-speaker-cone" rx="55" ry="39" cy="-43"/>
      <ellipse class="speaker-diaphragm" rx="35" ry="25" cy="-43"/><ellipse class="lab-contact" rx="16" ry="11" cy="-43"/>
      <g class="lab-sound-rings" fill="none"><ellipse rx="78" ry="56" cy="-43"/><ellipse rx="92" ry="65" cy="-43"/></g>
    </g>
    <g class="lab-signal-line" transform="translate(337 79)" fill="none"><path d="M0 0h12v-17h20v34h20v-34h20v34h20v-34h20v17h15"/></g>` : `
    <g class="bench-server" transform="translate(122 62)">
      <ellipse class="lab-shadow" cx="151" cy="278" rx="143" ry="22"/>
      <path class="lab-case-side" d="M248 9l48 31v228l-48 -16Z"/>
      <path class="lab-case-top" d="M0 9l50 -26h198l48 31 -48 18Z"/>
      <rect class="lab-case" x="0" y="9" width="248" height="244" rx="9"/>
      <g class="server-units">${[0,1,2].map(i=>`<g class="server-unit unit-${i}" transform="translate(14 ${28+i*70})"><rect class="lab-unit" width="220" height="58" rx="5"/><rect class="lab-drive" x="11" y="11" width="125" height="36" rx="3"/><g class="lab-vents" fill="none">${vent(19,18,15)}</g><rect class="lab-button" x="148" y="12" width="50" height="12" rx="3"/><circle class="lab-led led-${i}" cx="206" cy="18" r="3.8"/><g class="lab-packets">${[0,1,2,3].map(n=>`<rect class="packet-${n}" x="${149+n*12}" y="34" width="7" height="5" rx="1"/>`).join('')}</g></g>`).join('')}</g>
      <g class="lab-screws">${[[7,17],[239,17],[7,241],[239,241]].map(([x,y])=>`<circle class="lab-screw" cx="${x}" cy="${y}" r="2"/>`).join('')}</g>
    </g>
    <g class="bench-storage" transform="translate(424 226)"><ellipse class="lab-shadow" cx="0" cy="103" rx="65" ry="17"/><path class="lab-case-side" d="M-53 -14v87c0 26 106 26 106 0v-87Z"/><ellipse class="lab-metal" cy="-14" rx="53" ry="20"/><path class="storage-line" d="M-53 17c0 25 106 25 106 0m-106 29c0 25 106 25 106 0" fill="none"/><circle class="lab-led" cx="27" cy="69" r="3"/></g>
    <path class="lab-wire" d="M213 318v34c0 18 86 18 86 0v-20" fill="none"/>`;
  return `<svg class="lab-illustration ${hardware?'illustration-pico':'illustration-homelab'}" viewBox="0 0 600 400" aria-hidden="true"><g class="lab-grid" fill="none">${[90,150,210,270,330].map(y=>`<path d="M45 ${y}h510"/>`).join('')}${[90,160,230,300,370,440,510].map(x=>`<path d="M${x} 45v310"/>`).join('')}</g>${art}</svg>`;
}
