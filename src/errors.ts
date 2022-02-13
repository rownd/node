export class WrappedError extends Error {
    constructor(msg: string) {
        super(msg);

        this.innerError = null;
        this.statusCode = 500;
    }
    public innerError: Error | null;
    public statusCode: number;
}