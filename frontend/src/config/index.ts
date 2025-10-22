// Environment configuration
export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/',
  
  // CRDP Configuration
  crdp: {
    host: import.meta.env.VITE_CRDP_HOST || '192.168.0.231',
    port: parseInt(import.meta.env.VITE_CRDP_PORT || '32082'),
    policy: import.meta.env.VITE_CRDP_POLICY || 'P03',
  },
  
  // App Configuration
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
};

export default config;
