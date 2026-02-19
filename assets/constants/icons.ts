import ActiveSessionsIcon from "../icons/ActiveSessionsIcon";
import LoginIcon from "../icons/LoginIcon";
import StartSessionIcon from "../icons/StartSessionIcon";

// Define an interface for your icon map for better type safety
interface SvgIconMap {
  [key: string]: React.FC<any>; // React.FC takes props, using 'any' for flexibility here
  // More specific types if your icons have consistent props:
  // [key: string]: React.FC<{ width: number; height: number; color: string }>;
}

export const SVG_ICONS: SvgIconMap = {
  LogIn: LoginIcon,
  StartSession: StartSessionIcon,
  ActiveSessions: ActiveSessionsIcon,
};
