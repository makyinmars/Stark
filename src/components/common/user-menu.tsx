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
  Search,
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
    <div className="container mx-auto flex flex-col gap-4 p-4">
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
