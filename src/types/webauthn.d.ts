interface AuthenticationExtensionsPRFValues {
  first?: BufferSource;
  second?: BufferSource;
}

interface AuthenticationExtensionsPRFInputs {
  eval?: AuthenticationExtensionsPRFValues;
  evalByCredential?: Record<string, AuthenticationExtensionsPRFValues>;
}

interface AuthenticationExtensionsClientInputs {
  prf?: AuthenticationExtensionsPRFInputs;
}
