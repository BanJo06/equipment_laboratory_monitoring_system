import Svg, { Path, Rect } from "react-native-svg";

const StartSessionIcon = ({ size = 64, color = "#2567CA", ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    // Use the size prop for width/height to keep it square by default
    width={size}
    height={size}
    // viewBox is the secret sauce for scalability
    viewBox="0 0 64 64"
    fill="none"
    {...props}
  >
    {/* Background Circle */}
    <Rect width={64} height={64} fill={color} rx={32} />

    {/* Clock Outline */}
    <Path
      stroke="#fff"
      strokeLinecap="square"
      strokeWidth={2}
      d="M17 32c0-8.285 6.715-15 15-15s15 6.715 15 15-6.715 15-15 15-15-6.715-15-15Z"
    />

    {/* Clock Hands */}
    <Path
      stroke="#fff"
      strokeLinecap="square"
      strokeWidth={2}
      d="M32 23.75V32l4.5 4.5"
    />
  </Svg>
);

export default StartSessionIcon;
