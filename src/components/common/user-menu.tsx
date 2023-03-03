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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Account</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-2 w-36">
            <DropdownMenuLabel>
              {user && user.name}
              {`'`}s Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link href="/" className="flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Home</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                {user && (
                  <Link href={`/user/${user.id}`} className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <History className="mr-2 h-4 w-4" />
                <span>History</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/exercise" className="flex items-center">
                  <Dumbbell className="mr-2 h-4 w-4" />
                  <span>Exercises</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/search-user" className="flex items-center">
                  <Search className="mr-2 h-4 w-4" />
                  <span>Users</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Crown className="mr-2 h-4 w-4" />
                <span>Upgrade</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Zap className="mr-2 h-4 w-4" />
                <span>Wishlist</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span
                onClick={() =>
                  void signOut({
                    callbackUrl: "/",
                  })
                }
              >
                Log out
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {children}
    </div>
  );
};

export default UserMenu;
