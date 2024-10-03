export class Result {
    readonly code?: number;
    readonly message?: string;
    readonly data?: {};

    constructor({code, message, data}: {
        code?: number, message?: string, data?: {}
    }) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    static success(data: {}) {
        return new Result({code: 200, data});
    }

    static successNoData() {
        return new Result({code: 201});
    }

    static error(code: number, message: string) {
        return new Result({code, message});
    }

}