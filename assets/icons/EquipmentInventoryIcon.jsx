import Svg, { Path, Rect } from "react-native-svg";
const EquipmentInventoryIcon = ({ size = 64, color = "#2567CA", ...props }) => (
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
      d="m37.25 43.888-6.375-6.375 2.1-2.1 4.275 4.275 8.475-8.476 2.1 2.1L37.25 43.889ZM45.5 29h-3v-7.5h-3V26h-15v-4.5h-3v21h9v3h-12v-27h9.262c.276-.875.813-1.593 1.613-2.155A4.479 4.479 0 0 1 32 15.5c1 0 1.894.281 2.682.845.788.563 1.319 1.281 1.593 2.155H45.5V29ZM32 21.5c.425 0 .782-.144 1.07-.432.288-.288.431-.644.43-1.068a1.459 1.459 0 0 0-.432-1.068A1.448 1.448 0 0 0 32 18.5c-.425 0-.781.144-1.068.432A1.459 1.459 0 0 0 30.5 20c-.001.424.143.78.432 1.07.289.288.645.432 1.068.43Z"
    />
  </Svg>
);
export default EquipmentInventoryIcon;
