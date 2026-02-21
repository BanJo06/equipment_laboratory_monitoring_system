import Svg, { Path, Rect } from "react-native-svg";
const UsageHistoryIcon = ({ size = 64, color = "#2567CA", ...props }) => (
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
      fill="#fff"
      d="M33.5 18.5A13.5 13.5 0 0 0 20 32h-4.5l5.835 5.835.105.21L27.5 32H23c0-5.805 4.695-10.5 10.5-10.5S44 26.195 44 32s-4.695 10.5-10.5 10.5c-2.895 0-5.52-1.185-7.41-3.09l-2.13 2.13a13.423 13.423 0 0 0 9.54 3.96 13.5 13.5 0 1 0 0-27ZM32 26v7.5l6.42 3.81 1.08-1.815-5.25-3.12V26H32Z"
    />
  </Svg>
);
export default UsageHistoryIcon;
