import Head from "next/head";
import UserMenu from "src/components/common/user-menu";

const CreateWorkout = () => {
  return (
    <>
      <Head>
        <title>Create Workout</title>
      </Head>
      <UserMenu>
        <h1 className="custom-h1">CreateWorkout</h1>
      </UserMenu>
    </>
  );
};

export default CreateWorkout;
