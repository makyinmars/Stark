import type { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import UserMenu from "src/components/common/user-menu";
import { Button } from "src/components/ui/button";
import { api } from "src/utils/api";
import { ssgHelper } from "src/utils/ssg";

const Upgrade = () => {
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
        {!isLoading && subscriptionStatus !== null && (
          <div className="flex flex-col gap-4">
            <h2 className="custom-h2 self-center">
              Your subscription is{" "}
              <span className="text-green-600">{subscriptionStatus}</span>
            </h2>
            <Button onClick={() => void onCreateBillingPortalSession()}>
              Manage subscription and billing
            </Button>
          </div>
        )}
        {!isLoading && subscriptionStatus === null && (
          <div className="flex flex-col gap-4">
            <h2 className="custom-h2 self-center">Premiun Membership</h2>
            <div className="flex justify-around">
              <div className="flex flex-col justify-around rounded border-2 border-slate-800 p-4">
                <h3 className="custom-h3 self-center">Free</h3>
                <ul>
                  <li>Create workouts</li>
                </ul>
              </div>
              <div className="flex flex-col justify-around gap-4 rounded border-2 border-slate-800 p-4">
                <h3 className="custom-h3 self-center">Premiun</h3>
                <ul>
                  <li>Free plan plus</li>
                  <li>Copy workouts</li>
                  <li>View chart</li>
                </ul>
                <Button onClick={() => void onCreateCheckoutSession()}>
                  Upgrade account
                </Button>
              </div>
            </div>
          </div>
        )}
      </UserMenu>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { ssg, session } = await ssgHelper(context);

  if (session && session.user) {
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
        permanent: false,
      },
    };
  }
};

export default Upgrade;
