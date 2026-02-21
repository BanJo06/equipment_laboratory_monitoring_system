import Svg, { Path, Rect } from "react-native-svg";
const AccountsIcon = ({ size = 64, color = "#2567CA", ...props }) => (
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
      d="M33.605 29.615a7.5 7.5 0 0 0 0-8.73A5.1 5.1 0 0 1 36.5 20a5.25 5.25 0 1 1 0 10.5 5.1 5.1 0 0 1-2.895-.885ZM22.25 25.25a5.25 5.25 0 1 1 10.499 0 5.25 5.25 0 0 1-10.499 0Zm3 0a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 0 0-4.5 0ZM38 39.5v3H17v-3s0-6 10.5-6 10.5 6 10.5 6Zm-3 0c-.21-1.17-1.995-3-7.5-3s-7.395 1.965-7.5 3m17.925-6a7.98 7.98 0 0 1 3.075 6v3h6v-3s0-5.445-9.09-6h.015Z"
    />
  </Svg>
);
export default AccountsIcon;
