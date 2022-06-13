export interface WordValidations {
    letters: Letter[],
    success: boolean
}

export interface Letter {
    value: string;
    exists: boolean;
    rightPlace: boolean;
}