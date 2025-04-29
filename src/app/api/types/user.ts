import { DefaultUser } from "next-auth";

export interface User extends DefaultUser {
  id: string;

  name: string;

  username: string;

  password: string;

  rol: string | null;
}