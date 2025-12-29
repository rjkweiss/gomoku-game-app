export type User = {
    id: number,
    email: string,
    username: string | null;
    firstName: string,
    lastName: string
};

export type RegisterData = {
    email: string;
    username?: string;
    password: string;
    firstName: string;
    lastName: string;
};
