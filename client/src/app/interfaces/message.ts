export interface LogMessage {
    date: string;
    message: string;

    // the following 2 are player ids
    receiver: string;
    sender?: string;
    exclusive?: boolean;
}
