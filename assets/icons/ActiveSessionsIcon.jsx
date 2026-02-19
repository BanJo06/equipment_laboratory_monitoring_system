import Svg, { Path, Rect } from "react-native-svg";
const SvgComponent = ({ size = 64, color = "#2567CA", ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    {...props}
  >
    <Rect width={64} height={64} fill={color} rx={32} />
    <Path
      stroke="#fff"
      strokeLinecap="square"
      strokeWidth={2}
      d="M29 36.5h-3a7.5 7.5 0 0 0-7.5 7.5v1.5h10.575M41 39.128V41l1.5 1.5M38 25.25a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Zm3 22.5a6.75 6.75 0 1 1 0-13.5 6.75 6.75 0 0 1 0 13.5Z"
    />
  </Svg>
);
export default SvgComponent;
