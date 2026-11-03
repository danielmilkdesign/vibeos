 'use client';
import React, {createContext,useContext,useEffect,useState} from 'react';
import type {User,UserRole} from '../types/crm';
export {DEMO_USERS} from './auth-constants';
export interface AuthResult {success:boolean;error?:string}
interface AuthContextType {
 user:User|null; loading:boolean; isAuthenticated:boolean;
 login:(email:string,password?:string,rememberMe?:boolean)=>Promise<AuthResult>;
 loginWithMagicToken:(token:string,rememberMe?:boolean)=>AuthResult;
 switchUserRole:(role:UserRole)=>void;
 logout:()=>Promise<void>;
 hasRole:(roles:UserRole[])=>boolean;
}
const AuthContext=createContext<AuthContextType|undefined>(undefined);
export function AuthProvider({children}:{children:React.ReactNode}) {
 const [user,setUser]=useState<User|null>(null);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
  // Remove legacy browser credentials; no browser value is an authority.
  localStorage.removeItem('vibe_os_user'); localStorage.removeItem('vibe_auth_token');
  fetch('/api/auth/me',{cache:'no-store',credentials:'same-origin'})
   .then(async r=>{if(r.ok)setUser((await r.json()).user);else setUser(null);})
   .catch(()=>setUser(null)).finally(()=>setLoading(false));
 },[]);
 const login=async(email:string,password='',rememberMe=false):Promise<AuthResult>=>{
  try {
   const r=await fetch('/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,rememberMe})});
   const data=await r.json();
   if(!r.ok){setUser(null);return {success:false,error:data.error||'Falha na autenticação.'};}
   setUser(data.user);return {success:true};
  }catch{setUser(null);return {success:false,error:'Autenticação indisponível.'};}
 };
 const logout=async()=>{
  const r=await fetch('/api/auth/logout',{method:'POST',credentials:'same-origin'});
  if(!r.ok)throw new Error('Não foi possível encerrar a sessão. Tente novamente.');
  setUser(null);window.location.assign('/login');
 };
 return <AuthContext.Provider value={{user,loading,login,logout,isAuthenticated:!!user,
 loginWithMagicToken:()=>({success:false,error:'Acesso por chave removido.'}),
 switchUserRole:()=>{throw new Error('Troca de perfil não permitida.');},
 hasRole:roles=>!!user&&(user.role==='ADMINISTRADOR'||roles.includes(user.role))}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const context=useContext(AuthContext);if(!context)throw new Error('useAuth requires AuthProvider');return context;}
