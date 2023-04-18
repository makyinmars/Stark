import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";

import {
  Home,
  CreditCard,
  LogOut,
  History,
  User,
  Dumbbell,
  Crown,
  Zap,
  Search,
  ArrowLeftCircle,
} from "lucide-react";

import { Button } from "src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";
import { api } from "src/utils/api";
import ModeToggle from "../mode-toggle";

interface UserMenuProps {
  children: React.ReactNode;
}

const UserMenu = ({ children }: UserMenuProps) => {
  const utils = api.useContext();
  const router = useRouter();
  const user = utils.auth.getUserSession.getData();

  return (
    <div className="container mx-auto flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="w-10 rounded-full p-0" variant="ghost">
                <ArrowLeftCircle
                  className="h-8 w-8"
                  onClick={() => void router.back()}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go back</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
            >Account</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-2 flex w-auto flex-col bg-accent-default">
            <DropdownMenuLabel className="flex items-center gap-2">
              {user && user.name}{" "}
              {user && user.stripeSubscriptionStatus === "active" && (
                <Crown className="h-5 w-5 text-yellow-500" />
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/" className="flex items-center">
                <DropdownMenuItem className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Home</span>
                </DropdownMenuItem>
              </Link>
              {user && (
                <Link href={`/user/${user.id}`} className="flex items-center">
                  <DropdownMenuItem className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
              )}
              {user?.role === "ADMIN" && (
                <Link href="/admin" className="flex items-center">
                  <DropdownMenuItem className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Admin</span>
                  </DropdownMenuItem>
                </Link>
              )}
              <Link href="/dashboard" className="flex items-center">
                <DropdownMenuItem className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/history" className="flex items-center">
                <DropdownMenuItem className="w-full">
                  <History className="mr-2 h-4 w-4" />
                  <span>History</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/exercise" className="flex items-center">
                <DropdownMenuItem className="w-full">
                  <Dumbbell className="mr-2 h-4 w-4" />
                  <span>Exercises</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/search-user" className="flex items-center">
                <DropdownMenuItem className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  <span>Users</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/upgrade" className="flex items-center">
                <DropdownMenuItem className="w-full">
                  <Crown className="mr-2 h-4 w-4" />
                  <span>Upgrade</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/feature-request" className="flex items-center">
                <DropdownMenuItem className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  <span>Feature Request</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="flex justify-center">
              <DropdownMenuItem
                className="w-full"
                onClick={() =>
                  void signOut({
                    callbackUrl: "/",
                  })
                }
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {children}
    </div>
  );
};

export default UserMenu;
