import { useState } from "react";
import { Link, useNavigate} from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useAuth } from "../../context/AuthContext";
import { login as loginAPI, getCurrentUser } from "../../services/authService";
import type { LoginCredentials } from "../../services/authService";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("🔐 Iniciando proceso de login...");
      const credentials: LoginCredentials = { username, password };
      console.log("📝 Credenciales:", credentials);
      
      // Llamar al API de login
      const authResponse = await loginAPI(credentials);
      console.log("✅ Respuesta de login:", authResponse);
      
      if (!authResponse.access_token) {
        throw new Error("No se recibió el token de acceso");
      }
      
      // Guardar el token primero
      localStorage.setItem('access_token', authResponse.access_token);
      console.log("💾 Token guardado en localStorage");
      
      // Esperar un poco para asegurar que el token esté guardado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Obtener información del usuario
      console.log("👤 Obteniendo datos del usuario...");
      const userData = await getCurrentUser();
      console.log("✅ Datos del usuario obtenidos:", userData);
      
      if (!userData) {
        throw new Error("No se pudieron obtener los datos del usuario");
      }
      
      // Actualizar el contexto de autenticación
      console.log("🔄 Actualizando contexto...");
      login(userData, authResponse.access_token);
      
      // Esperar que el contexto se actualice y luego navegar
      console.log("🚀 Login exitoso, redirigiendo al dashboard...");
      setTimeout(() => {
        navigate("/admin");
      }, 200); // Dar tiempo al contexto para actualizarse
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err instanceof Error ? err.message : "Invalid username or password");
      // Limpiar el localStorage en caso de error
      localStorage.removeItem('access_token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your user and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                    {error}
                  </div>
                )}
                <div>
                  <Label>
                    Username <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    placeholder="Enter your user" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-900"
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
