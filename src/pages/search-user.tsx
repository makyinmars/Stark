import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { GetServerSidePropsContext } from "next";
import Head from "next/head";

import UserMenu from "src/components/common/user-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "src/components/ui/command";
import { ssgHelper } from "src/utils/ssg";
import { api } from "src/utils/api";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";

const SearchUser = () => {
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");

  const onSearchClick = () => {
    if (value) {
      setSearch(value);
    }
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
          <Button variant="outline" onClick={() => void onSearchClick()}>
            Search
          </Button>
        </div>
        {search && <SearchResult value={search} />}
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

interface SearchUserProps {
  value: string;
}

const SearchResult = ({ value }: SearchUserProps) => {
  const utils = api.useContext();

  const user = utils.auth.getUserSession.getData();

  const { data } = api.user.getUsersBySearchName.useQuery({
    name: value,
    userId: user && user.id,
  });

  return (
    <Command>
      <CommandEmpty>No users found.</CommandEmpty>
      <CommandGroup>
        {data &&
          data.map((user) => (
            <Link key={user.name} href={`/user/${user.id}`}>
              <CommandItem>
                <div className="flex items-center gap-2">
                  {user.image && (
                    <Image
                      width={32}
                      height={12}
                      alt={user.name as string}
                      src={user.image}
                      className="h-auto w-8 rounded"
                    />
                  )}
                  {user.name}
                </div>
              </CommandItem>
            </Link>
          ))}
      </CommandGroup>
    </Command>
  );
};
