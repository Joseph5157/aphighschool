import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/admin/login" },
});

export const config = {
  // Protect everything under /admin except the login page itself
  matcher: ["/admin/((?!login).*)"],
};
