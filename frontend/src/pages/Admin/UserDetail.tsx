import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRepositories } from "../../context/RepositoriesContext";
import type { User } from "../../domain/entities/User";
import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";

export default function UserDetail() {
  const { userRepository } = useRepositories();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee",
  });

  useEffect(() => {
    if (!id) {
      setError('ID de usuario no válido');
      setIsLoading(false);
      return;
    }
    
    const userId = parseInt(id, 10);
    if (isNaN(userId) || userId <= 0) {
      setError('ID de usuario no válido');
      setIsLoading(false);
      return;
    }
    
    loadUser(userId);
  }, [id]);

  const loadUser = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userRepository.getById(userId);
      if (data) {
        setUser(data);
        setFormData({
          username: data.username || "",
          email: data.email || "",
          password: "",
          confirmPassword: "",
          role: data.role || "employee",
        });
      } else {
        setError('Usuario no encontrado');
      }
    } catch (error: any) {
      const errorMsg = error.response?.status === 404 
        ? 'Usuario no encontrado' 
        : 'Error al cargar usuario';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Si se ingresa contraseña, validarla
    if (formData.password) {
      if (formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      const updateData: { username: string; email: string; password?: string; role: string } = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        role: formData.role,
      };
      
      // Solo incluir password si se ingresó una nueva
      if (formData.password) {
        updateData.password = formData.password;
      }

      await userRepository.update(user.id, updateData);
      setIsEditing(false);
      loadUser(user.id);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Error al actualizar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    try {
      await userRepository.delete(user.id);
      navigate("/admin/users");
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Error al eliminar el usuario');
      setIsLoading(false);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <>
        <PageMeta title="Error" description="Error al cargar usuario" />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PageBreadCrumb pageTitle="Error" />
          </div>
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {error}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    No se pudo cargar la información del usuario.
                  </p>
                </div>
              </div>

            </div>
          </div>


        </div>
      </>
    );
  }

  if (!user) return null;

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; class: string }> = {
      admin: { label: "Administrador", class: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" },
      employee: { label: "Empleado", class: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300" },
      customer: { label: "Cliente", class: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" }
    };
    
    const config = roleConfig[role] || roleConfig.employee;

    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      <PageMeta title={`Usuario: ${user.username}`} description="Detalles del usuario" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageBreadCrumb pageTitle={`Usuario: ${user.username}`} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.username}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Usuario ID: {user.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isEditing && (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={handleDelete}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!isEditing ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Usuario
                        </label>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">
                          {user.username}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Email
                        </label>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Rol
                        </label>
                        <div className="mt-1">
                          {getRoleBadge(user.role)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar Información
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Actualiza la información del usuario
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre de Usuario <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nueva Contraseña (opcional)
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Dejar en blanco para no cambiar"
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirmar Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Confirmar nueva contraseña"
                        disabled={!formData.password}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rol <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        <option value="employee">Empleado</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          username: user.username,
                          email: user.email,
                          password: "",
                          confirmPassword: "",
                          role: user.role,
                        });
                      }}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Guardar Cambios
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div> {/* close max-w-4xl */}
        </div> {/* close min-h-screen */}
      </>
  );
  }
