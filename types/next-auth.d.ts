import { RoleType } from "@prisma/client";
import { DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      companyId: string;
      company: string;
    };
  }
  /**
   * For NextAuth OAuthConfig.Profile Configuration
   */
  interface User extends DefaultUser {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId: string;
    company: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId: string;
    company: string;
  }
}
