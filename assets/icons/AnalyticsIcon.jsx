import Svg, { Path, Rect } from "react-native-svg";
const AnalyticsIcon = ({ size = 64, color = "#2567CA", ...props }) => (
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
      d="M18.5 45.5v-27h27v27h-27Zm3-3h21v-21h-21v21Zm3-3h3V32h-3v7.5Zm12 0h3v-15h-3v15Zm-6 0h3V35h-3v4.5Zm0-7.5h3v-3h-3v3Z"
    />
  </Svg>
);
export default AnalyticsIcon;
