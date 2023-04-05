import type { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import UserMenu from "src/components/common/user-menu";
import { Button } from "src/components/ui/button";
import { api } from "src/utils/api";
import { ssgHelper } from "src/utils/ssg";

const Dashboard = () => {
  const { data: subscriptionStatus, isLoading } =
    api.user.subscriptionStatus.useQuery();

  const { push } = useRouter();

  const createCheckoutSession = api.stripe.createCheckoutSession.useMutation({
    onSuccess: async (data) => {
      if (data) {
        const { checkoutUrl } = data;
        if (checkoutUrl) {
          await push(checkoutUrl);
        }
      }
    },
  });

  const createBillingPortalSession =
    api.stripe.createBillingPortalSession.useMutation({
      onSuccess: async (data) => {
        if (data) {
          const { billingPortalUrl } = data;
          if (billingPortalUrl) {
            await push(billingPortalUrl);
          }
        }
      },
    });

  const onCreateBillingPortalSession = async () => {
    try {
      await createBillingPortalSession.mutateAsync();
    } catch {}
  };

  const onCreateCheckoutSession = async () => {
    try {
      await createCheckoutSession.mutateAsync();
    } catch {}
  };

  return (
    <>
      <Head>
        <title>Upgrade</title>
      </Head>
      <UserMenu>
        <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
          <p className="text-2xl text-gray-700">Actions:</p>
          <div className="mt-3 flex flex-col items-center justify-center gap-4">
            {!isLoading && subscriptionStatus !== null && (
              <>
                <p className="text-xl text-gray-700">
                  Your subscription is {subscriptionStatus}.
                </p>
                <Button onClick={() => void onCreateBillingPortalSession()}>
                  Manage subscription and billing
                </Button>
              </>
            )}
            {!isLoading && subscriptionStatus === null && (
              <>
                <p className="text-xl text-gray-700">
                  You are not subscribed!!!
                </p>

                <Button onClick={() => void onCreateCheckoutSession()}>
                  Upgrade account
                </Button>
              </>
            )}
          </div>
        </main>
      </UserMenu>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { ssg, session } = await ssgHelper(context);

  if (session && session.user) {
    const userId = session.user.id;

    await ssg.auth.getUserSession.prefetch();

    return {
      props: {
        trpcState: ssg.dehydrate(),
        userId,
      },
    };
  } else {
    return {
      props: {
        trpcState: ssg.dehydrate(),
        userId: null,
      },
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

export default Dashboard;
