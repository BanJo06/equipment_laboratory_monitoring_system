import AccountsIcon from "../icons/AccountsIcon";
import ActiveSessionsIcon from "../icons/ActiveSessionsIcon";
import AnalyticsIcon from "../icons/AnalyticsIcon";
import EquipmentInventoryIcon from "../icons/EquipmentInventoryIcon";
import LoginIcon from "../icons/LoginIcon";
import StartSessionIcon from "../icons/StartSessionIcon";
import UsageHistoryIcon from "../icons/UsageHistoryIcon";

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
  Accounts: AccountsIcon,
  UsageHistory: UsageHistoryIcon,
  Analytics: AnalyticsIcon,
  EquipmentInventory: EquipmentInventoryIcon,
};
