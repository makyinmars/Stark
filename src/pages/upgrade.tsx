import type { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import UserMenu from "src/components/common/user-menu";
import { Button } from "src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
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
        <h2 className="custom-h2 text-center">Upgrade Account</h2>
        {!isLoading && subscriptionStatus !== null && (
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-center">
                Your subscription is{" "}
                <span className="text-green-600">{subscriptionStatus}</span>
              </CardTitle>
              <CardDescription>
                You are a premium member of Stark. Thank you for your support!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => void onCreateBillingPortalSession()}
              >
                Manage subscription and billing
              </Button>
            </CardContent>
          </Card>
        )}
        {!isLoading && subscriptionStatus === null && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Premium Membership</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul>
                    <li>
                      Access to workout plans and routines created by Stark
                    </li>
                    <li>Basic progress tracking features</li>
                    <li>Limited access to community features</li>
                    <li>
                      No ability to copy workouts or view progress in chart
                      format
                    </li>
                    <li>No premium support from Stark</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Premium</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul>
                    <li>Access to all features of the free membership</li>
                    <li>
                      Ability to copy workouts created by other users or
                      trainers on the app
                    </li>
                    <li>Save favorite workouts for easy access later</li>
                    <li>
                      View progress in visual and easy-to-understand chart
                      format
                    </li>
                    <li>Set goals and benchmarks for yourself</li>
                    <li>Track progress towards these goals over time</li>
                    <li>Priority support from Stark</li>
                    <li>
                      More in-depth community features and support from other
                      premium members
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => void onCreateCheckoutSession()}
                  >
                    Upgrade account
                  </Button>
                </CardFooter>
              </Card>
            </CardContent>
          </Card>
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
