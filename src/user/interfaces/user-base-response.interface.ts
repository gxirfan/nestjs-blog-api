export interface IUserBaseProfile {
    id: string;
    username: string;
    nickname?: string;
    firstName: string;
    lastName: string;
    bio?: string;
    email: string;
    birthDate: Date;
    avatar?: string;
    cover?: string;
    location?: string;
    gender?: string;
}