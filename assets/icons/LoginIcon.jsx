import Svg, { Circle, Path } from "react-native-svg";

const LoginIcon = ({ size = 64, color = "#2567CA", ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64" // This is the "map" that keeps everything in proportion
    fill="none"
    {...props}
  >
    <Circle cx={32} cy={32} r={32} fill={color} />
    <Path
      stroke="#fff"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M43.75 22.5V46h-19V22.5h19Z"
    />
    <Path
      stroke="#fff"
      strokeLinecap="square"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M29.75 30.5h9m-9 6h9M19.25 17v25.5M19.25 42.5h4.5M40.25 21.5V17M40.25 17h-21"
    />
  </Svg>
);

export default LoginIcon;
