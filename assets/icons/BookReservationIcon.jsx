import Svg, { Path, Rect } from "react-native-svg";
const BookReservationIcon = ({ size = 64, color = "#2567CA", ...props }) => (
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
      d="M30.125 24.5v1.875H24.5V24.5h5.625ZM24.5 30.125V28.25h5.625v1.875H24.5Zm0 3.75V32h3.75v1.875H24.5ZM22.625 24.5v1.875H20.75V24.5h1.875Zm0 3.75v1.875H20.75V28.25h1.875Zm-1.875 5.625V32h1.875v1.875H20.75Zm-1.875-15v26.25h9.375V47H17V17h16.333l8.042 8.042v3.208H39.5v-1.875H32v-7.5H18.875Zm15 1.333V24.5h4.292l-4.292-4.292ZM43.25 32H47v15H30.125V32h3.75v-1.875h1.875V32h5.625v-1.875h1.875V32Zm1.875 13.125v-7.5H32v7.5h13.125Zm0-9.375v-1.875H32v1.875h13.125Z"
    />
  </Svg>
);
export default BookReservationIcon;
