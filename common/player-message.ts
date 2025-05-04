export interface PlayerMessage {
    name: string;
    message: string;
    date: string;
}

export interface LogMessage {
    date: string;
    message: string;

    // the following 2 are player ids
    receiver: string;
    sender?: string; // only for combat logs
}
