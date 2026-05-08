import type {User} from "./user.ts";

export interface AuthResponse {
    token: string;
    user: User;
}
