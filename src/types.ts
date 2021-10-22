export type ClientOptions = {
  host?: string | undefined;
  path?: string | undefined;
  port?: number | undefined;
  url?: string | undefined;
  cookies?: boolean | undefined;
  headers?: { [header: string]: string } | undefined;
  basic_auth?: { user: string, pass: string } | undefined;
  method?: string | undefined;
}

export type SautoResponse = {
  status: number,
  status_message: string,
}

export type SautoHash = SautoResponse & {
  output: {
    hash_key: string,
    session_id: string,
  }
}

// export type CarData = {
//   address: string,
//   airbag: [],
//   aircondition: [],
//   attractive_offer: boolean,
//   beds: [],
//   body_id: [];
// }