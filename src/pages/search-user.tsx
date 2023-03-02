import { Check } from "lucide-react";
import { useState } from "react";
import type { GetServerSidePropsContext } from "next";
import Head from "next/head";

import { cn } from "src/utils/tailwindcss";
import UserMenu from "src/components/common/user-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "src/components/ui/command";
import { ssgHelper } from "src/utils/ssg";
import { api } from "src/utils/api";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";

const SearchUser = () => {
  const utils = api.useContext();

  const [value, setValue] = useState("");

  const { data, isLoading, isError } = api.user.getUsersBySearchName.useQuery({
    name: "Franklin",
  });

  const onSearchClick = async () => {
    try {
      console.log("VAlue", value);
      const data = await utils.user.getUsersBySearchName.fetch({ name: value });
      console.log("DAta", data);
    } catch {}
  };

  return (
    <>
      <Head>
        <title>User Search</title>
      </Head>
      <UserMenu>
        <div className="flex items-center gap-1">
          <Input
            type="text"
            placeholder="Search user"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button onClick={() => void onSearchClick()}>Search</Button>
        </div>
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandEmpty>No users found.</CommandEmpty>
          <CommandGroup>
            {data &&
              data.map((user) => (
                <CommandItem
                  key={user.name}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === user.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.name}
                </CommandItem>
              ))}
          </CommandGroup>
        </Command>
      </UserMenu>
    </>
  );
};

export default SearchUser;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { ssg, session } = await ssgHelper(context);

  if (session && session.user) {
    await ssg.auth.getUserSession.prefetch();

    return {
      props: {
        trpcState: ssg.dehydrate(),
      },
    };
  } else {
    return {
      props: {
        trpcState: ssg.dehydrate(),
      },
      redirect: {
        destination: "/",
        permanent: "false",
      },
    };
  }
};
