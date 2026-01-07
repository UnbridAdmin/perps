export class LoginModel {
    public message: string;
    public signature: string;
    public coin_id: number;
    public referral_code: string;
    constructor(object: any) {
        this.message = (object.message) ? object.message : "";
        this.signature = (object.signature) ? object.signature : "";
        this.coin_id = (object.coin_id) ? object.coin_id : "";
        this.referral_code = (object.referral_code) ? object.referral_code : "";
    }
}