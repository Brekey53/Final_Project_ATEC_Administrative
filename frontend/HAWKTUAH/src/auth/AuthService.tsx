const AUTH_KEY = "123";

export function setAuth(token: string) {
  localStorage.setItem(AUTH_KEY, token);
}


/**
 TODO: RETIRAR ISTO, SÓ PARA TESTAR
 */
export async function login(
  email: string,
  password: string
): Promise<void> {

  await new Promise((res) => setTimeout(res, 700));

  if (email === "admin@admin.pt" && password === "1234") {
    setAuth("fake-token");
    return;
  }

  throw new Error("Credenciais inválidas");
}
