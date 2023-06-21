export const DATABASE_TABLES = {
    configs: 'config_entry', 
  }

export type Config_Entry_Table = {
    id: string
    email: string;
    url: string;
    length: number;
    forceSpecialCharacter: boolean;
    onlyDomain: boolean;
}