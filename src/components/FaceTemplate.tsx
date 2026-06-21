import type { TemplateView } from '@/types';

interface Props {
  view: TemplateView;
  width: number;
  height: number;
}

const S = '#E8D5B7';

function Dots({ data }: { data: [number, number][] }) {
  return <>{data.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.5" fill={S} opacity="0.5" />)}</>;
}

function FrontFace() {
  return (
    <g>
      <line x1="100" y1="10" x2="100" y2="250" stroke={S} strokeWidth="0.3" opacity="0.2" />
      <line x1="30" y1="70" x2="170" y2="70" stroke={S} strokeWidth="0.3" opacity="0.2" />
      <line x1="30" y1="130" x2="170" y2="130" stroke={S} strokeWidth="0.3" opacity="0.2" />
      <line x1="30" y1="190" x2="170" y2="190" stroke={S} strokeWidth="0.3" opacity="0.2" />
      <ellipse cx="100" cy="125" rx="55" ry="90" stroke={S} strokeWidth="1.5" />
      <path d="M45 125Q45 210 100 235Q155 210 155 125" stroke={S} strokeWidth="1.5" />
      <path d="M68 98Q78 88 88 98" stroke={S} strokeWidth="1.5" />
      <path d="M112 98Q122 88 132 98" stroke={S} strokeWidth="1.5" />
      <path d="M100 105L100 150" stroke={S} strokeWidth="1.5" />
      <path d="M93 155Q97 160 100 155Q103 160 107 155" stroke={S} strokeWidth="1.5" />
      <path d="M86 182Q93 190 100 188Q107 190 114 182" stroke={S} strokeWidth="1.5" />
      <Dots data={[
        [100, 35], [50, 70], [150, 70], [73, 87], [127, 87],
        [52, 132], [148, 132], [82, 170], [118, 170],
        [100, 225], [47, 188], [153, 188],
      ]} />
    </g>
  );
}

function Deg45Face() {
  return (
    <g>
      <path d="M108 32Q58 32 52 95Q48 165 82 218Q95 233 108 228Q128 218 132 165Q138 95 125 50Q120 32 108 32Z"
        stroke={S} strokeWidth="1.5" />
      <path d="M88 95Q95 86 102 95" stroke={S} strokeWidth="1.5" />
      <path d="M93 105L87 145" stroke={S} strokeWidth="1.5" />
      <path d="M82 150Q86 155 90 150" stroke={S} strokeWidth="1.5" />
      <path d="M82 178Q87 184 92 182" stroke={S} strokeWidth="1.5" />
      <Dots data={[
        [98, 35], [55, 68], [76, 85], [55, 128],
        [80, 168], [95, 218], [52, 185],
      ]} />
    </g>
  );
}

function SideFace() {
  return (
    <g>
      <path d="M92 28Q132 28 132 72Q132 95 118 108Q108 118 110 138Q112 155 105 168Q98 180 95 195Q93 215 105 228Q110 235 100 242Q82 240 76 222Q68 198 66 168Q62 128 62 88Q62 48 92 28Z"
        stroke={S} strokeWidth="1.5" />
      <path d="M132 105Q142 115 138 135Q134 150 122 155" stroke={S} strokeWidth="1.5" />
      <path d="M88 180Q93 186 98 184" stroke={S} strokeWidth="1.5" />
      <Dots data={[
        [92, 32], [65, 65], [78, 83], [60, 128],
        [80, 168], [98, 222], [55, 185],
      ]} />
    </g>
  );
}

export default function FaceTemplate({ view, width, height }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 200 260" fill="none">
      {view === 'front' && <FrontFace />}
      {view === '45deg' && <Deg45Face />}
      {view === 'side' && <SideFace />}
    </svg>
  );
}
