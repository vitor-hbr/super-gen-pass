declare module "supergenpass-lib" {
  interface GenerateOptions {
    length?: number;
    onlyDomain?: boolean;
  }

  export function generate(
    masterPassword: string,
    url: string,
    options: GenerateOptions,
    callback: (password: string) => void,
  ): void;
}
