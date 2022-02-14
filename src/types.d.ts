type TConfig = {
    api_url: string;
}

type RowndToken = {
    jti: string;
    sub: string;
    aud: string[];
    iat: number;
    exp: number;
    iss: string;
}