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
    type_profile: 'USER' | 'RWA';
    is_verified?: string;
    verified_last_date?: string;
}
