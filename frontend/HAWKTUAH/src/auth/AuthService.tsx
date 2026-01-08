import axios from 'axios';


export async function login(email: string, password: string) {
    try {
      const res = await axios.post('http://localhost:5056/api/auth/login', { email, password }  );
      console.log('Status:', res.status);
      console.log('Response data:', res.data);
  }catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Credenciais inválidas");
    }
    throw new Error("Erro ao ligar ao servidor");
  }
}
