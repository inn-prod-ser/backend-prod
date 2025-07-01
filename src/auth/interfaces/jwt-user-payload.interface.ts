export interface JwtUserPayload {
  id:        string;
  firstName: string | null;
  lastName:  string | null;
  email:     string;
  iat?:      number;
  exp?:      number;
}