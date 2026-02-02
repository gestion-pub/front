import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { ClipboardTextIcon } from '@phosphor-icons/react/dist/ssr/ClipboardText';
import { AddressBookIcon } from '@phosphor-icons/react/dist/ssr/AddressBook';
import { CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import { SquaresFourIcon } from '@phosphor-icons/react/dist/ssr/SquaresFour';
import { MegaphoneIcon } from '@phosphor-icons/react/dist/ssr/Megaphone';







export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  user: UserIcon,
  users: UsersIcon,
  planning: ClipboardTextIcon,
  clients: AddressBookIcon,
  conducteurs: CalendarIcon,
  categories: SquaresFourIcon,
  campagnes: MegaphoneIcon, // 👈 هنا
} as Record<string, Icon>;
