import Link from "next/link";
import { Button } from "src/components/ui/button";
import { signOut } from "next-auth/react";
import {
  Home,
  CreditCard,
  LogOut,
  History,
  User,
  Dumbbell,
  Crown,
  Zap,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { api } from "src/utils/api";

interface UserMenuProps {
  children: React.ReactNode;
}

const UserMenu = ({ children }: UserMenuProps) => {
  const utils = api.useContext();
  const user = utils.auth.getUserSession.getData();
  return (
    <div className="container flex flex-col gap-4 p-4 mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Home size={24} />
        </Link>
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
                {user && (
                  <Link href={`/user/${user.id}`} className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>Profile</span>
                  </Link>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="w-4 h-4 mr-2" />
                <Link href="/dashboard">
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <History className="w-4 h-4 mr-2" />
                <span>History</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Dumbbell className="w-4 h-4 mr-2" />
                <span>Exercises</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Crown className="w-4 h-4 mr-2" />
                <span>Upgrade</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Zap className="w-4 h-4 mr-2" />
                <span>Wishlist</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="w-4 h-4 mr-2" />
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
