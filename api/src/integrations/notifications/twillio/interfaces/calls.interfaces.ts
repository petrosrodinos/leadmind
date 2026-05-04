export interface CreateCall {
    from?: string;
    to: string;
    url?: string;
    message?: string;
    statusCallback?: string;
    statusCallbackMethod?: string;
    statusCallbackEvent?: string[];
}