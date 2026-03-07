export interface UserProfileResponse {
    username: string;
    url_banner?: string;
    url_avatar?: string;
    followers: number;
    following: number;
    subscribers: number;
    description?: string;
    fierce_balance?: number;
    user_id: number;
}
