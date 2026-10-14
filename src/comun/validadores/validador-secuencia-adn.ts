export function validarSecuenciaAdn(secuencia: string): boolean {
  return (
    typeof secuencia === 'string' &&
    secuencia.length > 0 &&
    /^[ACGT]+$/.test(secuencia)
  );
}
