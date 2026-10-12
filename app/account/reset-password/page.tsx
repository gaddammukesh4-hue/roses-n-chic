import Nav from '@/components/Nav';
import ResetPasswordForm from '@/components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <>
      <Nav />
      <main className="pt-[calc(var(--nav-h,76px)+40px)] pb-24 px-6 max-w-md mx-auto">
        <h1 className="text-h1 mb-6">Set a new password</h1>
        <ResetPasswordForm />
      </main>
    </>
  );
}
