export type connectUsersType = Record<
    string,
    { interests: string[]; users?: string[]; dynamicKey?: string; status?: string }
>;

export type connectUserReponseType = {
    users?: string[];
    dynamicKey?: string;
    status?: string;
};
