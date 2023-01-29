/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export function humanFileSize(bytes: any, si?: boolean, dp?: number): string;
export function switchNetworkLocalhost(provider: any): Promise<any>;
export function switchNetworkMumbai(provider: any): Promise<any>;
export function switchNetworkPolygon(provider: any): Promise<any>;
export function changeIPFSToGateway(ipfsUrl: any): any;
export function checkMobile(): boolean;
export function shortenAddress({ address, number, withLink }: {
    address: any;
    number?: number;
    withLink?: string;
}): string | JSX.Element;
export function RBSnackbar({ open, message, severity, currentTime }: {
    open: any;
    message: any;
    severity: any;
    currentTime: any;
}): JSX.Element;
export function signMessage({ rentMarket, message }: {
    rentMarket: any;
    message: any;
}): Promise<any>;
export function isUserAllowed({ rentMarket, address }: {
    rentMarket: any;
    address: any;
}): Promise<any>;
export function getUniqueKey(): any;
export function getErrorDescription({ errorString }: {
    errorString: any;
}): any;
export function getChainName({ chainId }: {
    chainId: any;
}): any;
export function isObject(value: any): boolean;
export function isInt(value: any): boolean;
export namespace ConnectStatus {
    const connect: string;
    const loading: string;
    const disconnect: string;
}
export namespace MyMenu {
    const own: string;
    const rent: string;
}
export namespace RBSize {
    const small: number;
    const middle: number;
    const big: number;
    const double: number;
    const triple: number;
}
export namespace AlertSeverity {
    const error: string;
    const warning: string;
    const info: string;
    const success: string;
}
export const Alert: any;
