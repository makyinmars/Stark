import { useSession, signIn, signOut } from "next-auth/react";

const SignIn = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="bg-slate-100 p-4 rounded">
        <h2>Sign In</h2>
      </div>
    </div>
  );
};

export default SignIn;
